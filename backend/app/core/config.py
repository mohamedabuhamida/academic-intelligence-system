import os
from dotenv import load_dotenv
from supabase.client import create_client
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()


def get_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


# =========================
# Supabase
# =========================

_supabase_client = None

def get_supabase():
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            get_env("NEXT_PUBLIC_SUPABASE_URL"),
            get_env("SUPABASE_SERVICE_ROLE_KEY"),
        )
    return _supabase_client


# =========================
# Gemini Embeddings
# =========================

_embedding_model = None

def get_embedding_model():
    global _embedding_model

    if _embedding_model is None:
        _embedding_model = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=get_env("GOOGLE_API_KEY"),
        )

    return _embedding_model


# =========================
# Gemini LLM
# =========================

_llm_model = None

def get_llm():
    global _llm_model

    if _llm_model is None:
        _llm_model = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite",
            temperature=0,
            google_api_key=get_env("GOOGLE_API_KEY"),
        )

    return _llm_model