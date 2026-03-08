import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

connection = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    sslmode="require"  # مهم جدًا مع Supabase
)

print("Connected successfully!")

cursor = connection.cursor()

cursor.execute("SELECT NOW();")

print(cursor.fetchone())

cursor.close()
connection.close()