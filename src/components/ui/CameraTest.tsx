import React, { useRef } from "react";

const CameraTest = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  async function startCamera() {
    // Stop any previous stream
    if (videoRef.current && videoRef.current.srcObject) {
      const s = videoRef.current.srcObject as MediaStream;
      s.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera error: " + err);
    }
  }

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline style={{ width: 320, height: 240, border: "1px solid black" }} />
      <div>
        <button onClick={startCamera}>Start/Restart Camera</button>
      </div>
    </div>
  );
};

export default CameraTest;
