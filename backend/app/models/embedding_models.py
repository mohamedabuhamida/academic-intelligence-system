from pydantic import BaseModel

class EmbeddingInsertRequest(BaseModel):
    document_id: str
    content: str