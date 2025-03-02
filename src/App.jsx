import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import DetectUtils from "./utils/detect";


const { detect, detectVideo, startLogging, getDetectionLogs } = DetectUtils;

import "./style/App.css";


const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const [model, setModel] = useState({ net: null, inputShape: [1, 0, 0, 3] });
  const [sessionActive, setSessionActive] = useState(false);
  const [summary, setSummary] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);

  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const modelName = "yolov8n";

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov8 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}_web_model/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions });
          },
        }
      );

      const dummyInput = tf.ones(yolov8.inputs[0].shape);
      const warmupResults = yolov8.execute(dummyInput);

      setLoading({ loading: false, progress: 1 });
      setModel({ net: yolov8, inputShape: yolov8.inputs[0].shape });

      tf.dispose([warmupResults, dummyInput]);
    });
  }, []);

  const toggleSession = () => {
    if (!sessionActive) {
      startLogging();
      setSummary("");
      setSessionLogs([]);
      setSessionActive(true);
      setStartTime(new Date());
    } else {
      setSessionActive(false);
      const detections = getDetectionLogs();
      setSessionLogs(detections);
      const endTime = new Date();

      let duration = "00:00:00";
      if (startTime) {
        const diff = Math.floor((endTime - startTime) / 1000);
        const hours = String(Math.floor(diff / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
        const seconds = String(diff % 60).padStart(2, "0");
        duration = `${hours}:${minutes}:${seconds}`;
      }

      if (detections.length > 0) {
        const realCount = detections.filter(d => d.class === "real").length;
        const spoofCount = detections.filter(d => d.class === "spoof").length;
        const total = realCount + spoofCount;

        let realPercentage = 0.0;
        let spoofPercentage = 0.0;

        if (total > 0) {
          realPercentage = ((realCount / total) * 100).toFixed(2);
          spoofPercentage = ((spoofCount / total) * 100).toFixed(2);
        }

        setSummary(prevSummary => `Session Summary: Real: ${realPercentage}%, Spoof: ${spoofPercentage}%, Duration: ${duration}`);
        console.log("📊 Nouveau summary mis à jour dans App.jsx :", summary);


      } else {
        setSummary(`No detections recorded. Duration: ${duration}`);
      }
    }
  };

  return (
    <div className="app-container">
      {loading.loading && (
        <Loader>
          <span className="loading-text">
            Loading... Please wait. 🚀 {Math.round(loading.progress * 100)}%
          </span>
        </Loader>
      )}

      <div className="app-card">
        <div className="header">
          <h1>AI-powered Proctor</h1>
          <p>Welcome to the Automated Online Test Monitoring System</p>
          <p>
            Powered by <code className="code">YOLOv11</code>, trained on the <code className="code">CelebA_Spoof</code> dataset.
          </p>
        </div>

        <div className="content">
          <video autoPlay muted ref={cameraRef} onPlay={() => detectVideo(cameraRef.current, model, canvasRef.current)} />
          <canvas ref={canvasRef} width={model.inputShape[1]} height={model.inputShape[2]} />
        </div>

        {/* ✅ Passer les résultats YOLO à `ButtonHandler` */}
        <ButtonHandler 
          imageRef={imageRef} 
          cameraRef={cameraRef} 
          videoRef={videoRef} 
          toggleSession={toggleSession} 
          sessionActive={sessionActive} 
          summary={summary}  // ✅ Maintenant, ButtonHandler reçoit les résultats
        />

        {summary && (
          <div className="summary-box">
            <p dangerouslySetInnerHTML={{ __html: summary }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
