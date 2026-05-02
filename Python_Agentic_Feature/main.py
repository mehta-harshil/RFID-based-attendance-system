import json
from fetch_attendance import get_attendance_data
from email_drafter import soft_reminder, strict_warning, urgent_warning
from email_formatter import send_attendance_email

def decide_action(attendance, warning_count=0):
    if attendance >= 75:
        return "no email"
    elif attendance >= 60:
        return "soft reminder"
    elif attendance >= 40:
        return "strict warning"
    else:
        return "urgent warning"

def main():
    try:
        print("Fetching attendance data...")
        attendance_data = get_attendance_data()
        
        print(f"Successfully fetched data for {len(attendance_data)} students.\n")
        
        for enrollment, data in attendance_data.items():
            percentage = data.get("percentage", 0)
            email = data.get("email", "N/A")
            name = data.get("name", "Student")
            faculty_name = data.get("Faculty_name", "Faculty")
            
            warning_type = decide_action(percentage, 0)
            
            print(f"Enrollment: {enrollment}")
            print(f"Name: {name}")
            print(f"Email: {email}")
            print(f"Percentage: {percentage}%")
            print(f"Action required: {warning_type}")
            
            if warning_type == "no email":
                print("Skipping email drafting.")
            else:
                if email == "N/A":
                    print("No email address found, cannot send email.")
                else:
                    print("Drafting email using Gemini...")
                    
                    # Generate email body based on warning type
                    if warning_type == "soft reminder":
                        email_text = soft_reminder(name, enrollment, percentage, faculty_name)
                    elif warning_type == "strict warning":
                        email_text = strict_warning(name, enrollment, percentage, faculty_name)
                    elif warning_type == "urgent warning":
                        email_text = urgent_warning(name, enrollment, percentage, faculty_name)
                    else:
                        email_text = ""
                    
                    if email_text.startswith("Error"):
                        print(f"Failed to draft email: {email_text}")
                    else:
                        print("Sending email...")
                        # Call formatter/sender with the generated text
                        success = send_attendance_email(email, email_text, faculty_name, data)
                        if success:
                            print("Email sent successfully.")
            
            print("-" * 40)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
