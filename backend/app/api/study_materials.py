from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.auth import AuthUser, get_current_user
from app.core.config import get_supabase
from app.services.embeddings_service import ingest_study_material


router = APIRouter()


@router.get("/api/study-materials")
def list_study_materials(
    course_id: str,
    current_user: AuthUser = Depends(get_current_user),
):
    supabase = get_supabase()
    file_prefix = f"study://{current_user.user_id}/{course_id}/%"

    response = (
        supabase.table("documents")
        .select("id, title, file_url, uploaded_at")
        .eq("uploaded_by", current_user.user_id)
        .like("file_url", file_prefix)
        .order("uploaded_at", desc=True)
        .execute()
    )

    return {
        "documents": response.data or [],
    }


@router.post("/api/study-materials/upload")
def upload_study_material(
    course_id: str = Form(...),
    course_code: str | None = Form(default=None),
    course_name: str | None = Form(default=None),
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
        .select("id, uploaded_by")
        .eq("id", document_id)
        .maybe_single()
        .execute()
    )

    document = document_response.data
    if not document or document.get("uploaded_by") != current_user.user_id:
        raise HTTPException(status_code=404, detail="Study material not found.")

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
