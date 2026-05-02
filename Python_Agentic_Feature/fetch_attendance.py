import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from the backend .env file
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', '.env')
load_dotenv(dotenv_path)

# Get MongoDB URI
mongo_uri = os.getenv('MONGO_URI')

if not mongo_uri:
    print("Error: MONGO_URI not found in the backend .env file.")
    exit(1)

print("Connecting to MongoDB...\n")

try:
    # Connect to MongoDB cluster
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
    db = client.get_default_database() 
    
    # Collections
    students_coll = db['students']
    attendances_coll = db['attendances']
    
    # Fetch all students and attendances
    students = list(students_coll.find({}))
    sessions = list(attendances_coll.find({}).sort("date", 1))
    
    if len(sessions) == 0:
        print("No attendance sessions found.")
        exit(0)
        
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
        
    # Build the header
    # 18 chars for Enrollment, 25 for name
    header = f"{'Enrollment no.':<16} | {'Student name':<25}"
    for d in date_set:
        header += f" | {d:<10}"
    header += f" | {'Present':<7} | {'Absent':<6} | {'%':<5}"
    
    print("-" * len(header))
    print(header)
    print("-" * len(header))
    
    # Process each student
    if len(students) == 0:
        print("No students enrolled yet.")
    else:
        for student in students:
            en = student.get('enrollmentNumber', 'N/A')
            name = student.get('name', 'N/A')
            
            # Truncate strings to fit columns if needed
            en_str = str(en)[:16]
            name_str = str(name)[:25]
            
            row_str = f"{en_str:<16} | {name_str:<25}"
            
            present_count = 0
            for d in date_set:
                if en in date_to_present.get(d, set()):
                    status = "P"
                    present_count += 1
                else:
                    status = "A"
                # Center the P/A under the 10-char date
                row_str += f" | {status:^10}"
                
            absent_count = total_sessions - present_count
            percentage = round((present_count / total_sessions) * 100) if total_sessions > 0 else 0
            
            row_str += f" | {present_count:<7} | {absent_count:<6} | {percentage:<4}%"
            print(row_str)
            
    print("-" * len(header))
    print(f"Total sessions: {total_sessions}")
    print(f"Total students: {len(students)}")
            
except Exception as e:
    print(f"An error occurred: {e}")
