import os
import logging
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import SupabaseVectorStore
from supabase.client import create_client
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# إعداد الـ Logging عشان يطبعلك الأخطاء بشياكة لو حصلت
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. تحميل الإعدادات
load_dotenv()

# 2. إعداد الموديل العبقري (Gemini 2.5 Flash)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    temperature=0, # صفر يعني الدقة 100% وبدون تأليف
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

# 3. إعداد الـ Embeddings (الموديل المحلي اللي شغال زي الفل)
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-mpnet-base-v2")

# 4. الاتصال بـ Supabase
supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# 5. تجهيز محرك البحث الخارق (بندور بالتشابه ونشترط درجة دقة معينة)
vector_store = SupabaseVectorStore(
    client=supabase,
    embedding=embeddings,
    table_name="documents",
    query_name="match_documents"
)

# كود احترافي: بنجيب أحسن 5 قطع، بس لازم نسبة التشابه تكون معقولة
retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5}
)

# دالة لتنظيف وتنسيق النصوص المستخرجة قبل ما تروح لـ Gemini
def format_docs(docs):
    return "\n\n---\n\n".join(doc.page_content for doc in docs)

# 6. تصميم الـ Prompt (قوي وصارم)
template = """أنت "المساعد الأكاديمي الذكي" الخاص بكلية الذكاء الاصطناعي بجامعة الدلتا.
مهمتك هي إرشاد الطلاب والإجابة على استفساراتهم بناءً على لائحة الكلية الرسمية المرفقة أدناه فقط.

قواعد صارمة:
1. استخدم المعلومات الموجودة في "النصوص المستخرجة" فقط.
2. إذا كان السؤال خارج نطاق الكلية أو غير موجود في النصوص، قل: "عذراً، لا أملك تفاصيل دقيقة حول هذا الاستفسار في لائحة الكلية الحالية."
3. لا تقم بتأليف أو تخمين أي إجابات من خارج النصوص.
4. اجعل إجابتك منظمة، واضحة، واستخدم النقاط (Bullet points) إذا لزم الأمر.

النصوص المستخرجة من اللائحة:
{context}

سؤال الطالب: {question}

الإجابة المعتمدة:"""

prompt = ChatPromptTemplate.from_template(template)

# 7. بناء الـ Chain المتطورة
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 8. الدالة النهائية اللي هنستدعيها من الـ API (محمية بـ Try/Except)
def ask_academic_mentor(query: str) -> str:
    try:
        logger.info(f"Processing query: {query}")
        response = rag_chain.invoke(query)
        return response
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return "عذراً، حدث خطأ فني أثناء البحث في اللائحة. يرجى المحاولة مرة أخرى لاحقاً."

# اختبار سريع
if __name__ == "__main__":
    test_query =" ما هي النسبة المئوية المناظرة وعدد النقاط لتقدير جيد جدا المرتفع (B+) حسب اللائحة؟"
    answer = ask_academic_mentor(test_query)
    print(f"\nسؤال الطالب: {test_query}")
    print(f"\n🤖 المساعد الأكاديمي:\n{answer}")