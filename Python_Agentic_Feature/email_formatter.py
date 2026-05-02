import os
import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

def format_date_with_day(date_str):
    try:
        if "T" in date_str:
            date_part = date_str.split("T")[0]
        else:
            date_part = date_str.strip()
            
        dt = datetime.strptime(date_part, "%Y-%m-%d")
        return dt.strftime("%d-%b-%Y (%A)")
    except Exception:
        return date_str

def send_attendance_email(email_id, text, faculty_name, attendance_data):
    """
    Combines the drafted text and attendance records into a final formatted email string,
    and then sends the email using SMTP.
    """
    # Load environment variables (expecting EMAIL_ADDRESS and EMAIL_PASSWORD)
    dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend', '.env')
    load_dotenv(dotenv_path)

    sender_email = "mehtaharshil58@gmail.com"
    sender_password = "yejv tlgr bdmk alrr"

    if not sender_email or not sender_password:
        print("Warning: EMAIL_ADDRESS or EMAIL_PASSWORD not found in environment variables.")
        return False

    # 1. Create the Subject line
    subject = f"Regarding Your Attendance Record under {faculty_name}'s subject"
    
    # Extract attendance info
    present_dates = attendance_data.get("present_dates", [])
    absent_dates = attendance_data.get("absent_dates", [])
    
    # 2. Structure the dates to look good in the email
    formatted_present = [format_date_with_day(d) for d in present_dates]
    formatted_absent = [format_date_with_day(d) for d in absent_dates]
    
    present_str = "\n".join(formatted_present) if formatted_present else "None"
    absent_str = "\n".join(formatted_absent) if formatted_absent else "None"
    
    student_name = attendance_data.get("name", "Student")
    enrollment_number = attendance_data.get("enrollment", "N/A")
    attendance_percentage = attendance_data.get("percentage", 0)
    
    attendance_summary = f"""===================================
         ATTENDANCE REPORT
===================================

Student Name : {student_name}
Enrollment No: {enrollment_number}

-----------------------------------
ATTENDANCE SUMMARY
-----------------------------------
✅ Total Present : {len(present_dates)}
❌ Total Absent  : {len(absent_dates)}

Attendance Percentage: {attendance_percentage}%

-----------------------------------
PRESENT RECORD
-----------------------------------
{present_str}

-----------------------------------
ABSENT RECORD
-----------------------------------
{absent_str}

===================================
Please ensure regular attendance to
avoid academic issues. For any
discrepancy, contact your faculty.
==================================="""
    
    # 3. Assemble the final email body
    email_body = (
        f"{text.strip()}\n\n"
        f"{attendance_summary}"
    )

    # 4. Construct the MIME structure
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = email_id
    msg['Subject'] = subject

    msg.attach(MIMEText(email_body, 'plain'))

    # 5. Send the email
    try:
        # Using Gmail's SMTP server as default
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"Email successfully sent to {email_id}")
        return True
    except Exception as e:
        print(f"Failed to send email to {email_id}. Error: {e}")
        return False

if __name__ == "__main__":
    # Simple test to verify sending
    sample_text = (
        "Dear Harshil Mehta,\n\n"
        "I am writing to you regarding your current attendance record.\n"
        "Please be mindful of the importance of regular attendance.\n\n"
        "Sincerely,\nDr. John Doe"
    )
    
    sample_data = {
        "name": "Harshil Mehta",
        "enrollment": "22IT045",
        "percentage": 50,
        "present_dates": ["2026-05-01", "2026-05-02"],
        "absent_dates": ["2026-04-28", "2026-04-29"]
    }
    
    # Uncomment the following to test if you have set your env vars
    send_attendance_email(
        email_id="mharshil533@gmail.com", 
        text=sample_text, 
        faculty_name="Dr. John Doe", 
        attendance_data=sample_data
    )
    print("Run uncommented block to test actual email sending.")
