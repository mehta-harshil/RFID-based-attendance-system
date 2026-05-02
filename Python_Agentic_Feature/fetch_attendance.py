import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

def get_attendance_data():
    # Load environment variables from the backend .env file
    dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', '.env')
    load_dotenv(dotenv_path)

    # Get MongoDB URI
    mongo_uri = os.getenv('MONGO_URI')

    if not mongo_uri:
        raise Exception("MONGO_URI not found in the backend .env file.")

    # Connect to MongoDB cluster
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    db = client.get_default_database() 
    
    # Collections
    students_coll = db['students']
    attendances_coll = db['attendances']
    users_coll = db['users']
    
    # Fetch all students, attendances, and users
    students = list(students_coll.find({}))
    sessions = list(attendances_coll.find({}).sort("date", 1))
    users = list(users_coll.find({}))
    
    # Mapping moduleId to adminName (Faculty)
    module_to_faculty = {}
    for u in users:
        mod_id = u.get('moduleId')
        name = u.get('adminName', u.get('username', 'Unknown Faculty'))
        if mod_id:
            module_to_faculty[mod_id] = name
    
    # Get unique dates
    date_set = []
    for s in sessions:
        date_val = s.get('date')
        if date_val and date_val not in date_set:
            date_set.append(date_val)
            
    date_set.sort()
    total_sessions = len(date_set)
    
    # Map: date -> set of present enrollments
    date_to_present = {}
    for s in sessions:
        date_val = s.get('date')
        present_students = set(s.get('presentStudents', []))
        if date_val not in date_to_present:
            date_to_present[date_val] = set()
        date_to_present[date_val].update(present_students)
        
    result_data = {}
    
    for student in students:
        en = student.get('enrollmentNumber')
        if not en:
            continue
            
        email = student.get('email', 'N/A')
        mod_id = student.get('moduleId')
        faculty_name = module_to_faculty.get(mod_id, 'Unknown Faculty')
        
        name = student.get('name', 'N/A')
        
        present_dates = []
        absent_dates = []
        
        present_count = 0
        for d in date_set:
            if en in date_to_present.get(d, set()):
                present_dates.append(d)
                present_count += 1
            else:
                absent_dates.append(d)
                
        percentage = round((present_count / total_sessions) * 100) if total_sessions > 0 else 0
        
        result_data[en] = {
            "name": name,
            "percentage": percentage,
            "email": email,
            "absent_dates": absent_dates,
            "present_dates": present_dates,
            "Faculty_name": faculty_name,
            "enrollment": en
        }
        
    return result_data

if __name__ == "__main__":
    import json
    print(json.dumps(get_attendance_data(), indent=4))
