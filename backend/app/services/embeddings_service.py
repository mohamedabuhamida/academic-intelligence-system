from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_text_splitters import MarkdownHeaderTextSplitter
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
        # Read markdown file content
        content = file.file.read().decode("utf-8")

        # 1) Split by markdown headers
        header_splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "h1"),
                ("##", "h2"),
                ("###", "h3"),
            ]
        )
        header_docs = header_splitter.split_text(content)

        # 2) Split each section into fixed-size chunks
        chunk_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
        )
        chunks = (
            chunk_splitter.split_documents(header_docs)
            if header_docs
            else chunk_splitter.create_documents([content])
        )

        embeddings_model = get_embedding_model()
        supabase = get_supabase()

        inserted = 0

        for chunk in chunks:
            chunk_text = chunk.page_content
            vector = embeddings_model.embed_query(chunk_text)

            supabase.table("document_chunks").insert({
                "document_id": document_id,
                "content": chunk_text,
                "embedding": vector,
                "metadata": chunk.metadata or {}
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
