import os
from flask import Flask, request, jsonify
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SENDGRID_API_KEY = "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"  # Replace with your SendGrid key



@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    user_email = data.get("user_email")
    control_email = data.get("control_email")
    session_results = data.get("session_results")  # Corresponds to the key name sent from React

    if not user_email or not control_email or not session_results:
        return jsonify({"error": "Missing data"}), 400

    message = Mail(
        from_email="fmoquet@mun.ca",
        to_emails=control_email,
        subject="Session Results",
        plain_text_content=f"""
        Hello,

        Candidate ID: {user_email}
        Session Results: {session_results}

        Best regards,
        Test Monitoring System
        """,
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        return jsonify({"message": "Email sent successfully!"}), response.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

