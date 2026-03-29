import io
import os
import re
import uuid
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_text_splitters import MarkdownHeaderTextSplitter
from pypdf import PdfReader
from app.core.config import get_embedding_model, get_supabase


def insert_embedding(document_id: str, content: str):
    try:
        embed = get_embedding_model()
        supabase = get_supabase()

        vector = embed.embed_query(content)

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


def normalize_markdown_for_rag(content: str) -> str:
    # Remove frequent PDF/page artifacts that hurt retrieval quality.
    content = re.sub(r"^\|\s*P\s*a\s*g\s*e\s*\d+\s*$", "", content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(r"^\|\s*Page\s*\d+\s*$", "", content, flags=re.MULTILINE | re.IGNORECASE)
    content = re.sub(
        r"^(Delta University for Science\s*&\s*Technology|Faculty of Artificial Intelligence)\s*$",
        "",
        content,
        flags=re.MULTILINE | re.IGNORECASE,
    )

    # Convert basic HTML table tags to plain text separators.
    content = re.sub(r"</?(table|tbody|thead|tr)>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</?(td|th)[^>]*>", " | ", content, flags=re.IGNORECASE)

    # Remove other HTML tags (e.g. <u>...</u>).
    content = re.sub(r"<[^>]+>", " ", content)

    # Normalize excessive separators and blank lines.
    content = re.sub(r"\s*\|\s*\|\s*", " | ", content)
    content = re.sub(r"[ \t]+", " ", content)
    content = re.sub(r"\n{3,}", "\n\n", content)

    return content.strip()


def ingest_markdown(file, document_id: str):
    try:
        # Read markdown file content
        content = file.file.read().decode("utf-8")
        content = normalize_markdown_for_rag(content)

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

        embed = get_embedding_model()
        supabase = get_supabase()

        inserted = 0

        for chunk in chunks:
            chunk_text = chunk.page_content
            
            vector = embed.embed_query(chunk_text)

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


def chunk_and_store_text(document_id: str, content: str, metadata: dict | None = None):
    content = normalize_markdown_for_rag(content)

    header_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("#", "h1"),
            ("##", "h2"),
            ("###", "h3"),
        ]
    )
    header_docs = header_splitter.split_text(content)

    chunk_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150,
    )
    chunks = (
        chunk_splitter.split_documents(header_docs)
        if header_docs
        else chunk_splitter.create_documents([content])
    )

    embed = get_embedding_model()
    supabase = get_supabase()

    inserted = 0

    for chunk in chunks:
        chunk_text = chunk.page_content.strip()
        if not chunk_text:
            continue

        vector = embed.embed_query(chunk_text)

        merged_metadata = {**(metadata or {}), **(chunk.metadata or {})}

        supabase.table("document_chunks").insert({
            "document_id": document_id,
            "content": chunk_text,
            "embedding": vector,
            "metadata": merged_metadata,
        }).execute()

        inserted += 1

    return inserted


def _study_material_bucket() -> str:
    return os.getenv("SUPABASE_STUDY_MATERIALS_BUCKET", "study-materials")


def upload_study_material_bytes(file_bytes: bytes, user_id: str, course_id: str, filename: str, content_type: str | None = None) -> str:
    supabase = get_supabase()
    bucket = _study_material_bucket()
    storage_path = f"{user_id}/{course_id}/{uuid.uuid4().hex}-{filename}"

    options = {"content-type": content_type or "application/octet-stream"}
    storage_client = supabase.storage.from_(bucket)
    try:
        storage_client.upload(storage_path, file_bytes, options)
    except TypeError:
        storage_client.upload(storage_path, file_bytes, file_options=options)

    return f"storage://{bucket}/{storage_path}"


def extract_text_from_uploaded_bytes(file_bytes: bytes, filename: str) -> tuple[str, str]:
    lower_name = filename.lower()

    if lower_name.endswith((".md", ".markdown", ".txt")):
        return file_bytes.decode("utf-8", errors="ignore"), filename

    if lower_name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(pages_text), filename

    raise ValueError("Unsupported file type. Please upload PDF, Markdown, or TXT files.")


def ingest_study_material(
    file,
    user_id: str,
    course_id: str,
    course_code: str | None,
    course_name: str | None,
    source_type: str | None = None,
    topic: str | None = None,
    week: str | None = None,
    lecture_number: str | None = None,
):
    supabase = get_supabase()
    filename = file.filename or f"upload-{uuid.uuid4().hex}.txt"
    file_bytes = file.file.read()
    content, filename = extract_text_from_uploaded_bytes(file_bytes, filename)
    if not content.strip():
        raise ValueError("Could not extract readable text from the uploaded file.")

    document_id = str(uuid.uuid4())
    file_url = upload_study_material_bytes(
        file_bytes=file_bytes,
        user_id=user_id,
        course_id=course_id,
        filename=filename,
        content_type=getattr(file, "content_type", None),
    )

    supabase.table("documents").insert({
        "id": document_id,
        "uploaded_by": user_id,
        "title": filename,
        "file_url": file_url,
    }).execute()

    metadata = {
        "scope": "study_material",
        "uploaded_by": user_id,
        "course_id": course_id,
        "course_code": course_code,
        "course_name": course_name,
        "source_type": source_type or "lecture",
        "topic": topic,
        "week": week,
        "lecture_number": lecture_number,
        "document_title": filename,
        "file_name": filename,
    }

    inserted = chunk_and_store_text(document_id=document_id, content=content, metadata=metadata)

    return {
        "status": "success",
        "document_id": document_id,
        "title": filename,
        "chunks_inserted": inserted,
    }
