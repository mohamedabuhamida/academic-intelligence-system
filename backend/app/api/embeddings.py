from fastapi import UploadFile, File, Form
from fastapi import UploadFile, File, Form
from app.services.embeddings_service import ingest_markdown

from fastapi import APIRouter
from app.models.embedding_models import EmbeddingInsertRequest
from app.services.embeddings_service import insert_embedding

router = APIRouter()

@router.post("/api/embeddings/insert")
def insert_embedding_endpoint(request: EmbeddingInsertRequest):
    return insert_embedding(
        document_id=request.document_id,
        content=request.content
    )



@router.post("/api/embeddings/upload-md")
def upload_md(
    document_id: str = Form(...),
    file: UploadFile = File(...)
):
    return ingest_markdown(file, document_id)