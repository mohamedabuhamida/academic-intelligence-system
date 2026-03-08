import os
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url


def _get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL")
    if not raw_url:
        raise RuntimeError("Missing DATABASE_URL environment variable")

    if raw_url.startswith("postgres://"):
        raw_url = raw_url.replace("postgres://", "postgresql://", 1)

    url = make_url(raw_url)
    if "sslmode" not in url.query:
        url = url.set(query={**url.query, "sslmode": "require"})

    return str(url)


DATABASE_URL = _get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)
