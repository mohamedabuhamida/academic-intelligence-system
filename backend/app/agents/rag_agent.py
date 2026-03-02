import logging
import os
import threading
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from supabase.client import create_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
_RAG_CHAIN = None
_RAG_CHAIN_LOCK = threading.Lock()

PROMPT_TEMPLATE = """You are the academic assistant for the Faculty of AI at Delta University.
Answer only from the retrieved regulation context.
If the answer is not in the context, say you do not have enough information in the current regulation.

Retrieved context:
{context}

Student question: {question}

Accurate answer:"""


def format_docs(docs):
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


class SupabaseVectorStoreCompat(SupabaseVectorStore):
    """Compatibility layer for postgrest>=2 RPC builders.

    langchain_community currently expects query_builder.params, but new
    postgrest builders expose fluent methods like .limit().
    """

    def similarity_search_by_vector_with_relevance_scores(
        self,
        query: List[float],
        k: int,
        filter: Optional[Dict[str, Any]] = None,
        postgrest_filter: Optional[str] = None,
        score_threshold: Optional[float] = None,
    ) -> List[Tuple[Document, float]]:
        match_documents_params = self.match_args(query, filter)
        query_builder = self._client.rpc(self.query_name, match_documents_params)

        # New postgrest clients no longer expose `params`; use fluent API.
        if hasattr(query_builder, "params"):
            if postgrest_filter:
                query_builder.params = query_builder.params.set(
                    "and", f"({postgrest_filter})"
                )
            query_builder.params = query_builder.params.set("limit", k)
        else:
            if postgrest_filter:
                query_builder = query_builder.filter("and", "eq", f"({postgrest_filter})")
            query_builder = query_builder.limit(k)

        res = query_builder.execute()
        match_result = [
            (
                Document(
                    metadata=search.get("metadata", {}),
                    page_content=search.get("content", ""),
                ),
                search.get("similarity", 0.0),
            )
            for search in res.data
            if search.get("content")
        ]

        if score_threshold is not None:
            match_result = [
                (doc, similarity)
                for doc, similarity in match_result
                if similarity >= score_threshold
            ]

        return match_result


def get_rag_chain():
    global _RAG_CHAIN
    if _RAG_CHAIN is not None:
        return _RAG_CHAIN

    with _RAG_CHAIN_LOCK:
        if _RAG_CHAIN is not None:
            return _RAG_CHAIN

        logger.info("Initializing RAG components...")

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            google_api_key=_required_env("GOOGLE_API_KEY"),
        )

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2",
            model_kwargs={"device": "cpu"},
        )

        supabase = create_client(
            _required_env("NEXT_PUBLIC_SUPABASE_URL"),
            _required_env("SUPABASE_SERVICE_ROLE_KEY"),
        )

        vector_store = SupabaseVectorStoreCompat(
            client=supabase,
            embedding=embeddings,
            table_name="document_chunks",
            query_name="match_documents",
        )

        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5},
        )

        prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

        _RAG_CHAIN = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

    return _RAG_CHAIN


def ask_academic_mentor(query: str) -> str:
    try:
        logger.info("Processing query: %s", query)
        rag_chain = get_rag_chain()
        return rag_chain.invoke(query)
    except Exception:
        logger.exception("Error processing query")
        return (
            "Sorry, a technical error happened while searching the regulation. "
            "Please try again shortly."
        )


if __name__ == "__main__":
    test_query = "What are the requirements for course registration?"
    answer = ask_academic_mentor(test_query)
    print(f"\nStudent question: {test_query}")
    print(f"\nAcademic assistant:\n{answer}")
