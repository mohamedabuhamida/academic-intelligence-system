import logging
import threading
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.documents import Document
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from app.services.memory_service import store_memory, retrieve_memory
from app.core.config import get_supabase, get_embedding_model, get_llm

logger = logging.getLogger(__name__)

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


class SupabaseVectorStoreCompat(SupabaseVectorStore):
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

        if hasattr(query_builder, "params"):
            query_builder.params = query_builder.params.set("limit", k)
        else:
            query_builder = query_builder.limit(k)

        res = query_builder.execute()

        return [
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


def get_rag_chain():
    global _RAG_CHAIN
    if _RAG_CHAIN is not None:
        return _RAG_CHAIN

    with _RAG_CHAIN_LOCK:
        if _RAG_CHAIN is not None:
            return _RAG_CHAIN

        logger.info("Initializing RAG chain...")

        llm = get_llm()
        embeddings = get_embedding_model()
        supabase = get_supabase()

        vector_store = SupabaseVectorStoreCompat(
            client=supabase,
            embedding=embeddings,
            table_name="document_chunks",  # ✅ مهم جدًا
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


def ask_academic_mentor(query: str, user_id: str) -> str:
    rag_chain = get_rag_chain()
    return rag_chain.invoke(query)