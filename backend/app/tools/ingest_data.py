import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import Client, create_client

# 1. تحميل متغيرات البيئة من ملف .env
load_dotenv()

# 2. الاتصال بـ Supabase (بنستخدم الـ Service Role عشان ده رفع داتا أدمن)
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

  # 3. إعداد موديل محلي مجاني تماماً وبيدعم العربي ومقاسه 768
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
# 4. تحديد مسار ملف الداتا بتاعك
current_dir = Path(__file__).parent
file_path = current_dir.parent.parent / "Data" / "RAG-Data.md"

# قراءة الملف
print("Reading Markdown file...")
with open(file_path, 'r', encoding='utf-8') as f:
    markdown_text = f.read()

# 5. التقطيع الذكي بناءً على عناوين المارك داون
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
docs = markdown_splitter.split_text(markdown_text)

print(f"Successfully split the document into {len(docs)} smart chunks.")

# 6. الرفع على Supabase
print("Uploading vectors to Supabase... Please wait.")
vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents"
)

print("✅ Data successfully ingested into Supabase!")