import os
from dotenv import load_dotenv
from supabase.client import create_client
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

# =========================
# 🔹 Environment Variables
# =========================

def get_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


# =========================
# 🔹 Supabase Client (Singleton)
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
# 🔹 Embedding Model (Singleton) - Hugging Face API
# =========================

_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HuggingFaceEndpointEmbeddings(
            model="https://router.huggingface.co/hf-inference/models/sentence-transformers/paraphrase-multilingual-mpnet-base-v2/pipeline/sentence-similarity",
            huggingfacehub_api_token=get_env("HF_TOKEN"),
        )
    return _embedding_model


# =========================
# 🔹 LLM Model (Singleton)
# =========================

_llm_model = None

def get_llm():
    global _llm_model
    if _llm_model is None:
        _llm_model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0,
            google_api_key=get_env("GOOGLE_API_KEY"),
        )
    return _llm_model