from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.core.config import get_embedding_model, get_supabase
import tempfile
import os


def ingest_pdf(file, document_id: str):
    try:
        # حفظ الملف مؤقتًا
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        # تحميل PDF
        loader = PyPDFLoader(tmp_path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150
        )
        chunks = text_splitter.split_documents(documents)

        embeddings_model = get_embedding_model()
        supabase = get_supabase()

        inserted = 0

        for chunk in chunks:
            vector = embeddings_model.embed_query(chunk.page_content)

            supabase.table("document_chunks").insert({
                "document_id": document_id,
                "content": chunk.page_content,
                "embedding": vector,
                "metadata": {
                    "page": chunk.metadata.get("page", None)
                }
            }).execute()

            inserted += 1

        os.remove(tmp_path)

        return {
            "status": "success",
            "chunks_inserted": inserted
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }