from dotenv import load_dotenv
import os

load_dotenv()

#Mongo
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "library"

#Auth
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")