# app/agents/rag_agent.py

import logging
from typing import List, Tuple, Optional, Dict

from langchain_core.documents import Document
from langchain_community.vectorstores import SupabaseVectorStore

from app.services.memory_service import store_memory, retrieve_memory
from app.core.config import get_supabase, get_embedding_model, get_llm
from app.agents.sql_agent import ask_database

logger = logging.getLogger(__name__)


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
            return " ".join([c.get("text", "") for c in content])
        except:
            return str(content)

    return str(content)


async def ask_academic_mentor(query: str, user_id: str) -> str:

    try:

        retriever, llm = get_rag_components()

        # 1️⃣ Retrieve academic regulation context (RAG)
        docs = retriever.invoke(query)
        regulation_context = format_docs(docs)

        # 2️⃣ Decide if database is required
        decision_prompt = f"""
Does this question require the student's personal academic record?

Examples requiring database:
- GPA
- completed credits
- my courses
- semester planning
- improve my GPA

Question:
{query}

Answer ONLY: YES or NO
"""

        decision = await llm.ainvoke(decision_prompt)

        use_database = "YES" in decision.content.upper()

        student_data = "Not required"

        # 3️⃣ Query database ONLY if needed
        if use_database:

            student_data = await ask_database(
                f"""
Retrieve academic data for this student.

Student ID: {user_id}

Use SQL queries to retrieve:

1) Student profile
2) Completed courses
3) Current courses
4) GPA history
5) Total completed credits

Relevant tables:
profiles
student_courses
courses
gpa_history
"""
            )

        # 4️⃣ Retrieve semantic memory
        memory_context = retrieve_memory(user_id, query)

        # 5️⃣ Build final prompt
        final_prompt = f"""
You are the academic assistant for the Faculty of AI at Delta University.

IMPORTANT:

The student is already authenticated in the system.

Student ID:
{user_id}

You ALREADY have access to the student's academic data.

NEVER ask the student for:
- user id
- student id
- login information

Use the provided database data instead.

--------------------------------
Academic Regulations:
{regulation_context}

--------------------------------
Student Academic Data:
{student_data}

--------------------------------
User Memory:
{memory_context}

--------------------------------
Student Question:
{query}

--------------------------------
Provide a clear and accurate answer.
"""

        # 6️⃣ Generate answer
        response = await llm.ainvoke(final_prompt)

        response_text = normalize_text(response)

        # 7️⃣ Store conversation memory
        store_memory(user_id, "user", query)
        store_memory(user_id, "ai", response_text)

        return response_text

    except Exception:
        logger.exception("Academic mentor failed")
        return "حدث خطأ أثناء معالجة الطلب."