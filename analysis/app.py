import mysql.connector
from pymongo import MongoClient
from flask import Flask

app = Flask(__name__)

# MySQL connection
mysql_conn = mysql.connector.connect(
    host="mysql",
    user="root",
    password="example",
    database="analytics"
)

# MongoDB connection
mongo_client = MongoClient('mongodb://mongodb:27017/')
mongo_db = mongo_client['analytics_db']

@app.route('/calculate', methods=['GET'])
def calculate():
    cursor = mysql_conn.cursor(dictionary=True)
    cursor.execute("SELECT grade FROM grades")
    grades = [row['grade'] for row in cursor.fetchall()]

    if grades:
        max_grade = max(grades)
        min_grade = min(grades)
        avg_grade = sum(grades) / len(grades)

        result = {
            'max': max_grade,
            'min': min_grade,
            'avg': avg_grade
        }

        # Write result to MongoDB
        mongo_db.analytics.update_one({}, {"$set": result}, upsert=True)

        return result
    else:
        return {"error": "No grades found"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)
