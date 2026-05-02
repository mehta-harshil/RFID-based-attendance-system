import os
from google import genai
from dotenv import load_dotenv

# Load environment variables (expecting GEMINI_API_KEY)
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', '.env')
load_dotenv(dotenv_path)

# Configure the Gemini API
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
    client = None
else:
    # Google GenAI client
    client = genai.Client(api_key=api_key)

# Using gemini-2.0-flash as requested
MODEL_NAME = "gemini-2.5-flash"

def generate_email_with_gemini(prompt):
    if not client:
        return "Error: Gemini client not configured due to missing API key."
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )
        return response.text
    except Exception as e:
        return f"Error generating email: {e}"

def soft_reminder(name, enrollment, percentage, faculty_name="Faculty"):
    prompt = f"""Generate a professional email from faculty to student for soft reminder to student.
    Faculty Name: {faculty_name}
    Student Name: {name}
    Attendance: {percentage}%
    Keep email professional and concise.
    
    Be aware that i have only above details no course name,id or any other student or faculty or anything new details so don't include extra details that i should change or add later because this is auto sender mail so after generating it will directly send to student 
    and also exculde subject line.
    """
    return generate_email_with_gemini(prompt)

def strict_warning(name, enrollment, percentage, faculty_name="Faculty"):
    prompt = f"""Generate a professional email from faculty to student for strict warning to student.
    Faculty Name: {faculty_name}
    Student Name: {name}
    Attendance: {percentage}%
    Keep email professional and concise.
    
    Be aware that i have only above details no course name,id or any other student or faculty or anything new details so don't include extra details that i should change or add later because this is auto sender mail so after generating it will directly send to student 
    and also exculde subject line.
    """
    return generate_email_with_gemini(prompt)

def urgent_warning(name, enrollment, percentage, faculty_name="Faculty"):
    prompt = f"""Generate a professional email from faculty to student for urgent warning to student.
    Faculty Name: {faculty_name}
    Student Name: {name}
    Attendance: {percentage}%
    Keep email professional and concise.
    Be aware that i have only above details no course name,id or any other student or faculty or anything new details so don't include extra details that i should change or add later because this is auto sender mail so after generating it will directly send to student 
    and also exculde subject line.
    """
    return generate_email_with_gemini(prompt)

if __name__ == "__main__":
    # Simple tests for the functions
    print("--- Soft Reminder ---")
    print(soft_reminder("Harshil Mehta", "240433116023", 65, "Dr. John Doe"))
    
    # print("\n--- Strict Warning ---")
    # print(strict_warning("John Doe", "123456789", 45, "Dr. John Doe"))
    
    # print("\n--- Urgent Warning ---")
    # print(urgent_warning("Jane Smith", "987654321", 20, "Dr. John Doe"))
