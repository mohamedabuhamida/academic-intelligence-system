# app/agents/rag_agent.py

import logging
from typing import List, Tuple, Optional, Dict

from langchain_core.documents import Document
from langchain_community.vectorstores import SupabaseVectorStore

from app.services.memory_service import store_memory, retrieve_memory
from app.core.config import get_supabase, get_embedding_model, get_llm
from backend.app.agents.sql_agent import ask_database

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """
You are the academic assistant for the Faculty of AI at Delta University.

You must follow these strict rules:
1) Use the Academic Regulation context as the primary source of truth.
2) Use User Memory only to personalize the answer.
3) If the answer is not found in the regulation context, say:
   "I do not have enough information in the current regulation."

----------------------------------------
Relevant User Memory:
{memory_context}

----------------------------------------
Retrieved Academic Regulation Context:
{regulation_context}

----------------------------------------
Student Question:
{question}

----------------------------------------
Accurate Answer:
"""


def format_docs(docs: List[Document]) -> str:
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


class SupabaseVectorStoreCompat(SupabaseVectorStore):
    def similarity_search_by_vector_with_relevance_scores(
        self,
        query: List[float],
        k: int,
        filter: Optional[Dict] = None,
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


def get_rag_components():
    llm = get_llm()
    embeddings = get_embedding_model()
    supabase = get_supabase()

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

    return retriever, llm


def normalize_text(content):

    if isinstance(content, str):
        return content

    if hasattr(content, "content"):
        content = content.content

    if isinstance(content, list):
        try:
            return " ".join([c.get("text","") for c in content])
        except:
            return str(content)

    return str(content)


async def ask_academic_mentor(query: str, user_id: str) -> str:
    try:
        retriever, llm = get_rag_components()

        # 1️⃣ RAG context (regulations)
        docs = retriever.invoke(query)
        regulation_context = format_docs(docs)

        # 2️⃣ Student academic data from SQL
        student_data = await ask_database(
            f"Get academic data for student {user_id} relevant to: {query}"
        )

        # 3️⃣ User memory
        memory_context = retrieve_memory(user_id, query)

        # 4️⃣ Build prompt
        final_prompt = f"""
You are the academic assistant for the Faculty of AI at Delta University.

You must combine TWO sources of information:

1️⃣ Academic Regulations (RAG context)
2️⃣ Student Academic Record (database data)

You MUST apply the regulation rules when generating recommendations.

Rules:
- Do not recommend courses that violate prerequisites.
- Respect the maximum allowed credit hours per semester.
- Recommend a balanced workload.

----------------------------------------

Academic Regulations:
{regulation_context}

----------------------------------------

Student Academic Record:
{student_data}

----------------------------------------

Relevant User Memory:
{memory_context}

----------------------------------------

Student Question:
{query}

----------------------------------------

Return:
1. Recommended courses for next semester
2. Total recommended credit hours
3. Explanation based on regulations
"""

        # 5️⃣ LLM
        response = await llm.ainvoke(final_prompt)

        response_text = normalize_text(response)

        # 6️⃣ Store memory
        store_memory(user_id, "user", query)
        store_memory(user_id, "ai", response_text)

        return response_text

    except Exception:
        logger.exception("Academic mentor failed")
        return "حدث خطأ أثناء معالجة الطلب."