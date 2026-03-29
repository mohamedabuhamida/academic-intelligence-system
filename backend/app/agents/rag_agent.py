# app/agents/rag_agent.py

import asyncio
import logging
from typing import List, Tuple, Optional, Dict

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
                    metadata=search.get("metadata", {}),
                    page_content=search.get("content", ""),
                ),
                search.get("similarity", 0.0),
            )
            for search in res.data
            if search.get("content")
        ]

def format_docs(docs: List[Document]) -> str:
    return "\n\n---\n\n".join(doc.page_content for doc in docs)

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