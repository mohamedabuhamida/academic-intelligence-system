import os
import requests
from dotenv import load_dotenv
from supabase.client import create_client
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
# 🔹 Embedding Model (Singleton) - HF Inference API
# =========================

EMBEDDING_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/paraphrase-multilingual-mpnet-base-v2/pipeline/feature-extraction"

def get_embedding_model():
    """
    Returns a callable that generates embeddings via HF Inference API.
    Usage: embeddings = get_embedding_model()(["text1", "text2"])
    """
    hf_token = get_env("HF_TOKEN")
    headers = {"Authorization": f"Bearer {hf_token}"}
    
    def embed_texts(texts):
        """
        Generate embeddings for a list of texts.
        Returns list of embedding vectors.
        """
        if isinstance(texts, str):
            texts = [texts]
        
        payload = {"inputs": texts}
        response = requests.post(EMBEDDING_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    return embed_texts


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