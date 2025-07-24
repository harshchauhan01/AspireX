from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import base64
import os

def send_credentials_email(email, username, password, name=None):
    subject = "Welcome to AspireX! 🚀 Your Journey Begins Here"
    
    # Try to read and encode the logo
    logo_base64 = ""
    try:
        logo_path = os.path.join(settings.MEDIA_ROOT, 'logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as logo_file:
                logo_data = logo_file.read()
                logo_base64 = base64.b64encode(logo_data).decode('utf-8')
    except Exception as e:
        print(f"Error reading logo: {e}")
        logo_base64 = ""
    
    # HTML Email Template
    email_html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AspireX</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #000000;
                color: #ffffff;
                line-height: 1.6;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #000000;
                padding: 20px;
            }}
            .header {{
                text-align: center;
                padding: 30px 0;
                border-bottom: 2px solid #333333;
                margin-bottom: 30px;
            }}
            .logo {{
                max-width: 200px;
                height: auto;
                margin-bottom: 20px;
            }}
            .welcome-section {{
                text-align: center;
                margin-bottom: 40px;
                padding: 0 20px;
            }}
            .welcome-title {{
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 15px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }}
            .welcome-message {{
                font-size: 16px;
                color: #cccccc;
                margin-bottom: 20px;
                line-height: 1.8;
            }}
            .credentials-section {{
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }}
            .credentials-title {{
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 20px;
                text-align: center;
            }}
            .credential-row {{
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #333333;
            }}
            .credential-row:last-child {{
                border-bottom: none;
            }}
            .credential-label {{
                font-weight: 600;
                color: #cccccc;
                font-size: 14px;
            }}
            .credential-value {{
                font-weight: 700;
                color: #00ff00;
                font-size: 14px;
                background-color: #000000;
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #00ff00;
            }}
            .divider {{
                height: 1px;
                background: linear-gradient(90deg, transparent, #333333, transparent);
                margin: 30px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px 0;
                color: #666666;
                font-size: 12px;
            }}
            .motivational-text {{
                font-style: italic;
                color: #00ff00;
                text-align: center;
                margin: 20px 0;
                font-size: 14px;
            }}
            @media only screen and (max-width: 600px) {{
                .email-container {{
                    padding: 10px;
                    margin: 0;
                }}
                .welcome-title {{
                    font-size: 24px;
                }}
                .welcome-message {{
                    font-size: 14px;
                }}
                .credentials-section {{
                    padding: 20px;
                    margin: 20px 0;
                }}
                .credential-row {{
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 8px;
                }}
                .credential-value {{
                    width: 100%;
                    text-align: center;
                }}
                .logo {{
                    max-width: 150px;
                }}
            }}
            @media only screen and (max-width: 480px) {{
                .email-container {{
                    padding: 5px;
                }}
                .welcome-title {{
                    font-size: 20px;
                }}
                .credentials-section {{
                    padding: 15px;
                }}
                .credential-row {{
                    padding: 8px 0;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header with Logo -->
            <div class="header">
                {f'<img src="data:image/png;base64,{logo_base64}" alt="AspireX Logo" class="logo">' if logo_base64 else '<div class="logo" style="font-size: 32px; font-weight: bold; color: #00ff00;">🚀 AspireX</div>'}
                <div class="divider"></div>
            </div>
            
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h1 class="welcome-title">Welcome to AspireX! 🚀</h1>
                <p class="welcome-message">
                    Hi {name or username},<br><br>
                    Welcome to the future of learning and mentorship! You've just taken the first step towards unlocking your full potential. 
                    At AspireX, we believe that every great journey begins with a single step, and you've made that step today.
                </p>
                
                <div class="motivational-text">
                    "The only way to do great work is to love what you do." - Steve Jobs
                </div>
            </div>
            
            <!-- Credentials Section -->
            <div class="credentials-section">
                <h2 class="credentials-title">🔐 Your Login Credentials</h2>
                <div class="credential-row">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">{username}</span>
                </div>
                <div class="credential-row">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">{password}</span>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- Action Section -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #cccccc; font-size: 16px; margin-bottom: 20px;">
                    You can now log in and start exploring the amazing world of opportunities waiting for you!
                </p>
                <p style="color: #666666; font-size: 14px;">
                    Keep these credentials safe and secure. For security reasons, we recommend changing your password after your first login.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <!-- Footer -->
            <div class="footer">
                <p>© 2025 AspireX. All rights reserved.</p>
                <p style="margin-top: 10px; color: #444444;">
                    Empowering minds, connecting futures.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version for email clients that don't support HTML
    text_content = f"""
    Welcome to AspireX! 🚀
    
    Hi {name or username},
    
    Welcome to the future of learning and mentorship! You've just taken the first step towards unlocking your full potential.
    
    Your Login Credentials:
    Username: {username}
    Password: {password}
    
    You can now log in and start exploring the amazing world of opportunities waiting for you!
    
    Keep these credentials safe and secure. For security reasons, we recommend changing your password after your first login.
    
    © 2025 AspireX. All rights reserved.
    Empowering minds, connecting futures.
    """
    
    # Create the email
    email = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(text_content),  # Plain text version
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    
    # Attach the HTML version
    email.attach_alternative(email_html, "text/html")
    
    # Send the email
    email.send() 

def send_mentor_approved_email(mentor_detail):
    subject = "Your AspireX Mentor Profile is Now Public! 🎉"
    name = mentor_detail.first_name or mentor_detail.mentor.name or "Mentor"
    email_address = mentor_detail.email

    # Try to read and encode the logo
    logo_base64 = ""
    try:
        logo_path = os.path.join(settings.MEDIA_ROOT, 'logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as logo_file:
                logo_data = logo_file.read()
                logo_base64 = base64.b64encode(logo_data).decode('utf-8')
    except Exception as e:
        print(f"Error reading logo: {e}")
        logo_base64 = ""

    email_html = f"""
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>Mentor Profile Approved</title>
        <style>
            body {{ background-color: #000; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }}
            .email-container {{ max-width: 600px; margin: 0 auto; background: #000; padding: 20px; }}
            .header {{ text-align: center; padding: 30px 0; border-bottom: 2px solid #333; margin-bottom: 30px; }}
            .logo {{ max-width: 200px; height: auto; margin-bottom: 20px; }}
            .title {{ font-size: 28px; font-weight: 700; color: #00ff00; margin-bottom: 15px; }}
            .message {{ font-size: 16px; color: #cccccc; margin-bottom: 20px; line-height: 1.8; }}
            .footer {{ text-align: center; padding: 20px 0; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class=\"email-container\">
            <div class=\"header\">
                {f'<img src="data:image/png;base64,{logo_base64}" alt="AspireX Logo" class="logo">' if logo_base64 else '<div class="logo" style="font-size: 32px; font-weight: bold; color: #00ff00;">🚀 AspireX</div>'}
            </div>
            <div class=\"title\">Your Profile is Now Public!</div>
            <div class=\"message\">
                Dear {name},<br><br>
                Congratulations! Your mentor profile has been <b>approved</b> and is now <b>public</b> on AspireX.<br>
                You are ready to go and can start receiving student bookings.<br><br>
                <b>Best of luck!</b><br>
                The AspireX Team
            </div>
            <div class=\"footer\">
                © 2025 AspireX. All rights reserved.<br>
                Empowering minds, connecting futures.
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Dear {name},

    Congratulations! Your mentor profile has been approved and is now public on AspireX.
    You are ready to go and can start receiving student bookings.

    Best of luck!
    The AspireX Team
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(text_content),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_address]
    )
    email.attach_alternative(email_html, "text/html")
    email.send() 

def send_styled_notification_email(email, subject, message, name=None, user_id=None):
    # Try to read and encode the logo
    logo_base64 = ""
    try:
        logo_path = os.path.join(settings.MEDIA_ROOT, 'logo.png')
        if os.path.exists(logo_path):
            with open(logo_path, 'rb') as logo_file:
                logo_data = logo_file.read()
                logo_base64 = base64.b64encode(logo_data).decode('utf-8')
    except Exception as e:
        print(f"Error reading logo: {e}")
        logo_base64 = ""

    # HTML Email Template (same layout as credentials, but with custom content)
    email_html = f"""
    <!DOCTYPE html>
    <html lang=\"en\">
    <head>
        <meta charset=\"UTF-8\">
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <title>{subject}</title>
        <style>
            body {{
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #000000;
                color: #ffffff;
                line-height: 1.6;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #000000;
                padding: 20px;
            }}
            .header {{
                text-align: center;
                padding: 30px 0;
                border-bottom: 2px solid #333333;
                margin-bottom: 30px;
            }}
            .logo {{
                max-width: 200px;
                height: auto;
                margin-bottom: 20px;
            }}
            .welcome-section {{
                text-align: center;
                margin-bottom: 40px;
                padding: 0 20px;
            }}
            .welcome-title {{
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 15px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }}
            .welcome-message {{
                font-size: 16px;
                color: #cccccc;
                margin-bottom: 20px;
                line-height: 1.8;
            }}
            .notification-section {{
                background-color: #111111;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 25px;
                margin: 30px 0;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }}
            .notification-title {{
                font-size: 18px;
                font-weight: 600;
                color: #ffffff;
                margin-bottom: 20px;
                text-align: center;
            }}
            .notification-content {{
                color: #00ff00;
                font-size: 15px;
                background-color: #000000;
                padding: 12px 16px;
                border-radius: 4px;
                border: 1px solid #00ff00;
                margin-bottom: 10px;
                white-space: pre-line;
            }}
            .divider {{
                height: 1px;
                background: linear-gradient(90deg, transparent, #333333, transparent);
                margin: 30px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px 0;
                color: #666666;
                font-size: 12px;
            }}
            @media only screen and (max-width: 600px) {{
                .email-container {{
                    padding: 10px;
                    margin: 0;
                }}
                .welcome-title {{
                    font-size: 24px;
                }}
                .welcome-message {{
                    font-size: 14px;
                }}
                .notification-section {{
                    padding: 20px;
                    margin: 20px 0;
                }}
                .notification-content {{
                    width: 100%;
                    text-align: center;
                }}
                .logo {{
                    max-width: 150px;
                }}
            }}
            @media only screen and (max-width: 480px) {{
                .email-container {{
                    padding: 5px;
                }}
                .welcome-title {{
                    font-size: 20px;
                }}
                .notification-section {{
                    padding: 15px;
                }}
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header with Logo -->
            <div class="header">
                {f'<img src="data:image/png;base64,{logo_base64}" alt="AspireX Logo" class="logo">' if logo_base64 else '<div class="logo" style="font-size: 32px; font-weight: bold; color: #00ff00;">🚀 AspireX</div>'}
                <div class="divider"></div>
            </div>
            <!-- Welcome Section -->
            <div class="welcome-section">
                <h1 class="welcome-title">{subject}</h1>
                <p class="welcome-message">
                    Hi {name or user_id},<br>
                    You have a new notification from AspireX Admin.
                </p>
            </div>
            <!-- Notification Section -->
            <div class="notification-section">
                <h2 class="notification-title">🔔 Notification</h2>
                <div class="notification-content">{message}</div>
            </div>
            <div class="divider"></div>
            <!-- Footer -->
            <div class="footer">
                <p>© 2025 AspireX. All rights reserved.</p>
                <p style="margin-top: 10px; color: #444444;">
                    Empowering minds, connecting futures.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Plain text version
    text_content = f"""
    {subject}

    Hi {name or user_id},

    You have a new notification from AspireX Admin:
    {message}

    © 2025 AspireX. All rights reserved.
    Empowering minds, connecting futures.
    """

    email_obj = EmailMultiAlternatives(
        subject=subject,
        body=strip_tags(text_content),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email]
    )
    email_obj.attach_alternative(email_html, "text/html")
    email_obj.send() 