# app/agents/rag_agent.py

import asyncio
import logging
from typing import Any, Dict, List, Optional, Tuple

from langchain_core.documents import Document
from langchain_community.vectorstores import SupabaseVectorStore

from app.services.memory_service import store_memory, retrieve_memory
from app.core.config import get_supabase, get_embedding_model, get_llm

logger = logging.getLogger(__name__)

class SupabaseVectorStoreCompat(SupabaseVectorStore):
    """Custom wrapper to handle Supabase RPC parameter compatibility."""
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
                    metadata={
                        **(search.get("metadata", {}) or {}),
                        "document_id": search.get("document_id"),
                    },
                    page_content=search.get("content", ""),
                ),
                search.get("similarity", 0.0),
            )
            for search in res.data
            if search.get("content")
        ]

def format_docs(docs: List[Document]) -> str:
    return "\n\n---\n\n".join(doc.page_content for doc in docs)


def format_doc_sources(docs: List[Document]) -> str:
    titles: list[str] = []

    for doc in docs:
        metadata = doc.metadata or {}
        title = metadata.get("document_title") or metadata.get("file_name") or "Untitled source"
        if title not in titles:
            titles.append(str(title))

    if not titles:
        return ""

    return "\n".join(f"- {title}" for title in titles)


def build_study_sources(docs: List[Document]) -> List[Dict[str, Any]]:
    seen_keys: set[str] = set()
    sources: List[Dict[str, Any]] = []

    for doc in docs:
        metadata = doc.metadata or {}
        document_id = str(metadata.get("document_id") or "")
        title = str(metadata.get("document_title") or metadata.get("file_name") or "Untitled source")
        unique_key = document_id or title
        if unique_key in seen_keys:
            continue

        seen_keys.add(unique_key)
        excerpt = " ".join((doc.page_content or "").split())
        if len(excerpt) > 220:
            excerpt = f"{excerpt[:217].rstrip()}..."

        sources.append(
            {
                "document_id": document_id or None,
                "title": title,
                "excerpt": excerpt or None,
                "source_type": metadata.get("source_type"),
                "topic": metadata.get("topic"),
                "week": metadata.get("week"),
                "lecture_number": metadata.get("lecture_number"),
            }
        )

    return sources


def get_vector_store():
    embeddings = get_embedding_model()
    supabase = get_supabase()

    return SupabaseVectorStoreCompat(
        client=supabase,
        embedding=embeddings,
        table_name="document_chunks",
        query_name="match_documents",
    )

def get_rag_components():
    llm = get_llm()
    vector_store = get_vector_store()

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

        # Retrieve relevant policy context from the vector store.
        docs = await asyncio.to_thread(retriever.invoke, query)
        regulation_context = format_docs(docs)

        # Retrieve conversational memory for continuity.
        memory_context = await asyncio.to_thread(retrieve_memory, user_id, query)

        # Build the grounded system prompt.
        final_prompt = f"""
You are the "Policy & Regulation Expert Agent", a core component of the Multi-Agent Academic Decision Intelligence System for the Faculty of AI at Delta University.

Your SPECIFIC ROLE: Answer student inquiries STRICTLY using the official retrieved Academic Regulations. 
You are NOT the Database Agent. You do NOT have access to the student's personal grades, GPA, or registered courses.

STRICT RULES:
1. GROUNDING: Base your answer EXCLUSIVELY on the "Retrieved Academic Regulation Context".
2. NO HALLUCINATION: If the provided context does not explicitly contain the answer, DO NOT invent information. Respond exactly with: "عذراً، اللائحة الأكاديمية لا تحتوي على معلومات كافية للإجابة على هذا السؤال."
3. ROLE BOUNDARY: If the user asks about their personal GPA or grades, politely apologize and inform them that this requires accessing their academic record, which is outside your current scope.
4. CONTEXTUAL AWARENESS: Use the "Relevant User Memory" to understand the flow of the conversation, but never let memory override the official regulations.
5. FINAL OUTPUT LANGUAGE: Your internal reasoning is in English, but your final response to the user MUST be in clear, professional, and elegant Arabic using markdown bullet points where appropriate.

----------------------------------------
Relevant User Memory:
{memory_context}

----------------------------------------
Retrieved Academic Regulation Context:
{regulation_context}

----------------------------------------
Student Question:
{query}

----------------------------------------
Accurate Arabic Answer:
"""

        # Generate the grounded response.
        response = await llm.ainvoke(final_prompt)
        response_text = normalize_text(response)

        # Store conversation memory.
        await asyncio.to_thread(store_memory, user_id, "user", query)
        await asyncio.to_thread(store_memory, user_id, "ai", response_text)

        return response_text

    except Exception as e:
        logger.error(f"Error in RAG Agent: {str(e)}")
        return "عذراً، حدث خطأ فني أثناء البحث في اللائحة. يرجى المحاولة مرة أخرى."

# --- الإضافة السحرية الجديدة ---
async def get_raw_rag_context(query: str) -> str:
    """Helper function to fetch raw academic rules for the Planner Agent silently."""
    try:
        retriever, _ = get_rag_components()
        docs = await asyncio.to_thread(retriever.invoke, query)
        return format_docs(docs)
    except Exception as e:
        logger.error(f"Error fetching raw RAG context: {str(e)}")
        return ""


async def ask_study_assistant(
    query: str,
    user_id: str,
    course_id: str,
    course_code: str | None = None,
    course_name: str | None = None,
    selected_document_ids: List[str] | None = None,
    study_mode: str | None = None,
) -> Dict[str, Any]:
    try:
        llm = get_llm()
        vector_store = get_vector_store()
        embeddings = get_embedding_model()
        query_vector = await asyncio.to_thread(embeddings.embed_query, query)
        raw_results = await asyncio.to_thread(
            vector_store.similarity_search_by_vector_with_relevance_scores,
            query_vector,
            24,
        )

        docs: List[Document] = []
        for doc, _score in raw_results:
            metadata = doc.metadata or {}
            if (
                metadata.get("scope") == "study_material"
                and str(metadata.get("uploaded_by")) == str(user_id)
                and str(metadata.get("course_id")) == str(course_id)
                and (
                    not selected_document_ids
                    or str(metadata.get("document_id")) in {str(item) for item in selected_document_ids}
                )
            ):
                docs.append(doc)
            if len(docs) >= 6:
                break

        if not docs:
            return {
                "answer": (
                    "لم يتم العثور على مصادر مذاكرة مرفوعة لهذه المادة بعد.\n\n"
                    "- ارفع محاضرة أو ملخصًا أو ملف PDF للمادة أولًا.\n"
                    "- بعد ذلك اسأل عن الشرح أو التلخيص أو الاختبار."
                ),
                "sources": [],
            }

        study_context = format_docs(docs)
        sources = format_doc_sources(docs)
        structured_sources = build_study_sources(docs)
        course_label = " - ".join(part for part in [course_code, course_name] if part) or course_id
        mode = (study_mode or "chat").strip().lower()

        mode_instruction_map = {
            "summary": "Start with a concise structured summary, then list the key takeaways.",
            "quiz": "Generate a short quiz from the materials with questions first, then provide a separate answer key.",
            "flashcards": "Produce flashcards in a clear Q/A format covering the most important concepts.",
            "expected_questions": "List the most likely exam or oral questions based on the uploaded materials and provide brief model answers.",
            "study_plan": "Create a short practical study plan using the uploaded materials, ordered by priority and difficulty.",
            "chat": "Answer naturally and helpfully based on the materials.",
        }
        mode_instruction = mode_instruction_map.get(mode, mode_instruction_map["chat"])

        final_prompt = f"""
You are the "Study Materials Assistant" for a university academic platform.

YOUR ROLE:
- Answer the student's question using ONLY the retrieved study materials for the selected course.
- Behave like a focused study notebook assistant similar to NotebookLM.

STRICT RULES:
1. Ground every explanation in the retrieved study materials.
2. If the materials do not contain enough information, say so clearly and ask the student to upload more lectures or notes.
3. Keep the answer focused on the selected course only: {course_label}.
4. Prefer helpful study outputs such as:
   - concise explanation
   - bullet summary
   - key takeaways
   - short quiz when requested
5. Respect the requested study mode exactly.
5. Final response must be in clear Arabic.
6. End the answer with a short "المصادر المستخدمة" section using the provided source names when available.

----------------------------------------
Selected Course:
{course_label}

----------------------------------------
Requested Study Mode:
{mode}

Mode-specific Instruction:
{mode_instruction}

----------------------------------------
Retrieved Study Materials Context:
{study_context}

----------------------------------------
Student Question:
{query}

----------------------------------------
Available Source Names:
{sources or "- No source names available"}

----------------------------------------
Arabic Study Answer:
"""

        response = await llm.ainvoke(final_prompt)
        response_text = normalize_text(response).strip()

        if sources:
            response_text = f"{response_text}\n\nالمصادر المستخدمة:\n{sources}"

        await asyncio.to_thread(store_memory, user_id, "user", query)
        await asyncio.to_thread(store_memory, user_id, "ai", response_text)

        return {
            "answer": response_text,
            "sources": structured_sources,
        }
    except Exception as e:
        logger.error(f"Error in Study RAG Agent: {str(e)}")
        return {
            "answer": "عذرًا، حدث خطأ أثناء البحث في ملفات المذاكرة. يرجى المحاولة مرة أخرى.",
            "sources": [],
        }
