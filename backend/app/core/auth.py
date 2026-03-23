from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_supabase


security = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthUser:
    user_id: str


def _extract_user_id(user_obj) -> str | None:
    if user_obj is None:
        return None
    if isinstance(user_obj, dict):
        value = user_obj.get("id")
        return str(value) if value else None

    value = getattr(user_obj, "id", None)
    return str(value) if value else None


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> AuthUser:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer access token.",
        )

    token = credentials.credentials.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer access token.",
        )

    try:
        supabase = get_supabase()
        try:
            auth_response = supabase.auth.get_user(token)
        except TypeError:
            auth_response = supabase.auth.get_user(jwt=token)

        user_obj = getattr(auth_response, "user", None)
        if user_obj is None and isinstance(auth_response, dict):
            user_obj = auth_response.get("user")

        user_id = _extract_user_id(user_obj)
        if not user_id:
            raise ValueError("user id not found in auth response")

        return AuthUser(user_id=user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
        )
