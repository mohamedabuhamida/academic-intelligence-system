import os
import requests
from dotenv import load_dotenv
from supabase.client import create_client
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.embeddings import Embeddings

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

class HFInferenceEmbeddings(Embeddings):
    def __init__(self, api_url: str, token: str):
        self.api_url = api_url
        self.headers = {"Authorization": f"Bearer {token}"}

    def _request_embeddings(self, texts):
        vectors = []

        for text in texts:
            payload = {"inputs": text}

            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=60,
            )

            response.raise_for_status()
            data = response.json()

            if isinstance(data[0], list):
                data = data[0]

            vectors.append(data)

        return vectors

    def embed_documents(self, texts):
        if not texts:
            return []
        return self._request_embeddings(texts)

    def embed_query(self, text):
        vectors = self._request_embeddings([text])
        return vectors[0] if vectors else []

    def __call__(self, texts):
        if isinstance(texts, str):
            return self.embed_query(texts)
        return self.embed_documents(texts)


_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HFInferenceEmbeddings(
            api_url=EMBEDDING_API_URL,
            token=get_env("HF_TOKEN"),
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
            model="gemini-3.1-flash-lite-preview"   ,
            temperature=0,
            google_api_key=get_env("GOOGLE_API_KEY"),
        )

    return _llm_model