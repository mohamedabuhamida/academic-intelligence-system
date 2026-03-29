import os

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.auth import AuthUser, get_current_user
from app.core.config import get_supabase
from app.services.embeddings_service import ingest_study_material


router = APIRouter()


def extract_document_metadata(document_id: str) -> dict:
    supabase = get_supabase()
    response = (
        supabase.table("document_chunks")
        .select("metadata")
        .eq("document_id", document_id)
        .limit(1)
        .execute()
    )
    rows = response.data or []
    metadata = rows[0].get("metadata") if rows else None
    return metadata if isinstance(metadata, dict) else {}


def study_material_bucket() -> str:
    return os.getenv("SUPABASE_STUDY_MATERIALS_BUCKET", "study-materials")


def parse_storage_uri(file_url: str | None) -> tuple[str | None, str | None]:
    if not file_url or not file_url.startswith("storage://"):
        return None, None

    value = file_url.removeprefix("storage://")
    bucket, _, path = value.partition("/")
    if not bucket or not path:
        return None, None

    return bucket, path


def build_signed_url(file_url: str | None) -> str | None:
    bucket, path = parse_storage_uri(file_url)
    if not bucket or not path:
        return None

    supabase = get_supabase()
    result = supabase.storage.from_(bucket).create_signed_url(path, 3600)

    signed = None
    if isinstance(result, dict):
        signed = result.get("signedURL") or result.get("signedUrl")

    if not signed:
        return None

    if signed.startswith("http://") or signed.startswith("https://"):
        return signed

    return f"{supabase.supabase_url}{signed}"


@router.get("/api/study-materials")
def list_study_materials(
    course_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    supabase = get_supabase()
    bucket = study_material_bucket()
    file_prefix = f"storage://{bucket}/{current_user.user_id}/{course_id}/%"
    legacy_prefix = f"study://{current_user.user_id}/{course_id}/%"

    response = (
        supabase.table("documents")
        .select("id, title, file_url, uploaded_at")
        .eq("uploaded_by", current_user.user_id)
        .like("file_url", file_prefix)
        .order("uploaded_at", desc=True)
        .execute()
    )

    documents = response.data or []
    if not documents:
        legacy_response = (
            supabase.table("documents")
            .select("id, title, file_url, uploaded_at")
            .eq("uploaded_by", current_user.user_id)
            .like("file_url", legacy_prefix)
            .order("uploaded_at", desc=True)
            .execute()
        )
        documents = legacy_response.data or []
    enriched_documents = [
        {
            **document,
            "signed_url": build_signed_url(document.get("file_url")),
            "metadata": extract_document_metadata(document.get("id")),
        }
        for document in documents
    ]

    return {"documents": enriched_documents}


@router.post("/api/study-materials/upload")
def upload_study_material(
    course_id: str = Form(...),
    course_code: str | None = Form(default=None),
    course_name: str | None = Form(default=None),
    source_type: str | None = Form(default="lecture"),
    topic: str | None = Form(default=None),
    week: str | None = Form(default=None),
    lecture_number: str | None = Form(default=None),
    file: UploadFile = File(...),
    current_user: AuthUser = Depends(get_current_user),
):
    try:
        return ingest_study_material(
            file=file,
            user_id=current_user.user_id,
            course_id=course_id,
            course_code=course_code,
            course_name=course_name,
            source_type=source_type,
            topic=topic,
            week=week,
            lecture_number=lecture_number,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unable to process study material: {exc}")


@router.delete("/api/study-materials/{document_id}")
def delete_study_material(
    document_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    supabase = get_supabase()

    document_response = (
        supabase.table("documents")
        .select("id, uploaded_by, file_url")
        .eq("id", document_id)
        .maybe_single()
        .execute()
    )

    document = document_response.data
    if not document or document.get("uploaded_by") != current_user.user_id:
        raise HTTPException(status_code=404, detail="Study material not found.")

    bucket, path = parse_storage_uri(document.get("file_url"))
    if bucket and path:
        try:
            supabase.storage.from_(bucket).remove([path])
        except Exception:
            pass

    (
        supabase.table("document_chunks")
        .delete()
        .eq("document_id", document_id)
        .execute()
    )

    (
        supabase.table("documents")
        .delete()
        .eq("id", document_id)
        .execute()
    )

    return {"status": "success"}
