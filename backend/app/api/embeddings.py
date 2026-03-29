from fastapi import UploadFile, File, Form, Depends
from app.services.embeddings_service import ingest_markdown

from fastapi import APIRouter
from app.models.embedding_models import EmbeddingInsertRequest
from app.services.embeddings_service import insert_embedding
from app.core.auth import AuthUser, get_current_user

router = APIRouter()

@router.post("/api/embeddings/insert")
def insert_embedding_endpoint(
    request: EmbeddingInsertRequest,
    _: AuthUser = Depends(get_current_user),
):
    return insert_embedding(
        document_id=request.document_id,
        content=request.content,
    )



@router.post("/api/embeddings/upload-md")
def upload_md(
    document_id: str = Form(...),
    file: UploadFile = File(...),
    _: AuthUser = Depends(get_current_user),
):
    return ingest_markdown(file, document_id)
