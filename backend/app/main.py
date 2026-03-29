from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, embeddings

app = FastAPI(title="Academic AI Mentor API")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(embeddings.router)


@app.get("/")
def read_root():
    return {"status": "Academic AI Backend is Online"}


@app.get("/health")
def health_check():
    return {"ok": True}
