import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', '.env')
load_dotenv(dotenv_path)

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
db = client.get_default_database()

print("Collections:", db.list_collection_names())

for coll_name in db.list_collection_names():
    print(f"\n--- Sample from {coll_name} ---")
    doc = db[coll_name].find_one()
    print(doc)
