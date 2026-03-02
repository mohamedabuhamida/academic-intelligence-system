from fastapi import UploadFile, File, Form
from app.services.embeddings_service import ingest_pdf

@router.post("/api/embeddings/upload")
def upload_pdf(
    document_id: str = Form(...),
    file: UploadFile = File(...)
):
    return ingest_pdf(file, document_id)