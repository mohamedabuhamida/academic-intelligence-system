import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import MarkdownHeaderTextSplitter
from supabase.client import Client, create_client


def _get_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def ingest_markdown_file(file_path: Path) -> int:
    load_dotenv()

    supabase_url = _get_env("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = _get_env("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    )

    if not file_path.exists():
        raise FileNotFoundError(f"Markdown file not found: {file_path}")

    with open(file_path, "r", encoding="utf-8") as f:
        markdown_text = f.read()

    splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=[
            ("#", "Header 1"),
            ("##", "Header 2"),
            ("###", "Header 3"),
        ]
    )
    docs = splitter.split_text(markdown_text)

    SupabaseVectorStore.from_documents(
        docs,
        embeddings,
        client=supabase,
        table_name="documents",
        query_name="match_documents",
    )
    return len(docs)


def main():
    base_dir = Path(__file__).resolve().parent.parent.parent
    file_path = base_dir / "Data" / "RAG-Data.md"

    print("Reading Markdown file...")
    chunk_count = ingest_markdown_file(file_path)
    print(f"Successfully split the document into {chunk_count} smart chunks.")
    print("Data successfully ingested into Supabase.")


if __name__ == "__main__":
    main()
