import { useState, useRef, useEffect } from "react";
import { Webcam } from "../utils/webcam";

const ButtonHandler = ({ imageRef, cameraRef, videoRef, toggleSession, sessionActive, summary }) => {
  const [streaming, setStreaming] = useState(null);
  const inputImageRef = useRef(null);
  const inputVideoRef = useRef(null);
  const webcam = new Webcam();

  // States for the modal and emails
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [controlEmail, setControlEmail] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);  // Track if the session has ended

  // Check when `summary` is updated and the session has ended
  useEffect(() => {
    if (sessionEnded && summary) {
      console.log("Summary ready to be sent:", summary);
      sendEmail();  // Send results only after the session
    }
  }, [summary, sessionEnded]);  // Execute only if `summary` is updated AND the session has ended

  // Function to send the email via Flask
  const sendEmail = async () => {
    if (!userEmail || !controlEmail || !summary) {
      alert("Please fill in all the information.");
      return;
    }

    console.log("Sending results to Flask:", { user_email: userEmail, control_email: controlEmail, session_results: summary });

    const sessionResults = {
      user_email: userEmail,
      control_email: controlEmail,
      session_results: summary,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionResults),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Email sent successfully!");
      } else {
        alert("Error sending email: " + data.error);
      }
    } catch (error) {
      alert("Unable to send email: " + error.message);
    }
  };

  // Open the front camera after validating the emails
  const openFrontCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      cameraRef.current.srcObject = stream;
      cameraRef.current.style.display = "block";
      setStreaming("frontCamera");
      toggleSession();
      setSessionEnded(false);  // Indicate that the session is starting
    } catch (error) {
      alert("Error accessing the camera: " + error.message);
    }
  };

  // Close the front camera and prepare to send the email
  const closeFrontCamera = () => {
    const tracks = cameraRef.current.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    cameraRef.current.srcObject = null;
    cameraRef.current.style.display = "none";
    setStreaming(null);
    toggleSession();
    setSessionEnded(true);  // Indicate that the session has ended, `useEffect()` will then send the email
  };

  // Handle form submission in the modal
  const handleStartSession = () => {
    if (!userEmail || !controlEmail) {
      alert("Please fill in both email addresses.");
      return;
    }
    setShowModal(false); // Close the modal window
    openFrontCamera(); // Start the camera after validation
  };

  return (
    <div className="btn-container">
      <button
        onClick={() => {
          if (streaming === null || streaming !== "frontCamera") {
            setShowModal(true);
          } else {
            closeFrontCamera();
          }
        }}
      >
        {streaming === "frontCamera" ? "Close Session" : "Start Session"}
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Session Information</h2>
            <input
              type="email"
              placeholder="Your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Control email"
              value={controlEmail}
              onChange={(e) => setControlEmail(e.target.value)}
              required
            />
            <button onClick={handleStartSession}>Start Session</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonHandler;
