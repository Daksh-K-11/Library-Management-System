from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import urllib.parse
from .config import settings

database_password = urllib.parse.quote_plus(settings.database_password)
DATABASE_URL = f'postgresql://{settings.database_username}:{database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}'

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit = False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()