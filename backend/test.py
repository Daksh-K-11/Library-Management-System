from pymongo import MongoClient

client = MongoClient("mongodb+srv://hfmain175_db_user:SRXXXwHDySqgxfUL@library-cluster.ai9ao6k.mongodb.net/?appName=Library-Cluster")
print(client.list_database_names())
