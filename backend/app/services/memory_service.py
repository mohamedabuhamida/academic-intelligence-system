from app.core.config import get_embedding_model, get_supabase


def store_memory(user_id: str, role: str, content: str):
    embeddings_model = get_embedding_model()
    supabase = get_supabase()

    vector = embeddings_model.embed_query(content)

    supabase.table("user_memory").insert({
        "user_id": user_id,
        "role": role,
        "content": content,
        "embedding": vector
    }).execute()


def retrieve_memory(user_id: str, question: str, top_k: int = 5) -> str:
    embeddings_model = get_embedding_model()
    supabase = get_supabase()

    query_vector = embeddings_model.embed_query(question)

    response = supabase.rpc(
        "match_user_memory",
        {
            "query_embedding": query_vector,
            "match_count": top_k,
            "user_id": user_id,
        }
    ).execute()

    if not response.data:
        return ""

    return "\n".join([item["content"] for item in response.data])