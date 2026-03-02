from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import get_embedding_model, get_supabase


def insert_embedding(document_id: str, content: str):
    try:
        embeddings_model = get_embedding_model()
        supabase = get_supabase()

        vector = embeddings_model.embed_query(content)

        supabase.table("document_chunks").insert({
            "document_id": document_id,
            "content": content,
            "embedding": vector
        }).execute()

        return {
            "status": "success",
            "dimension": len(vector)
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


def ingest_markdown(file, document_id: str):
    try:
        # قراءة محتوى الملف مباشرة
        content = file.file.read().decode("utf-8")

        # تقسيم النص إلى chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )
        chunks = text_splitter.split_text(content)

        embeddings_model = get_embedding_model()
        supabase = get_supabase()

        inserted = 0

        for chunk in chunks:
            vector = embeddings_model.embed_query(chunk)

            supabase.table("document_chunks").insert({
                "document_id": document_id,
                "content": chunk,
                "embedding": vector,
                "metadata": {}
            }).execute()

            inserted += 1

        return {
            "status": "success",
            "chunks_inserted": inserted
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }