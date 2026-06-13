import React, { useState, useRef } from "react";
import { X } from "lucide-react";

const VideoCall = ({ close }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  let localStream;

  const startCall = async () => {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = localStream;
      setIsCallStarted(true);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setIsCallStarted(false);
    close();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[800px] h-[800px] flex flex-col items-center">
        <div className="flex justify-between w-full px-4">
          <h2 className="text-2xl font-semibold">Video Call</h2>
          <button onClick={endCall} className="text-red-500">
            <X size={30} />
          </button>
        </div>

        <video ref={localVideoRef} autoPlay playsInline className="w-full h-72 bg-black mt-3 rounded-lg" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-72 bg-gray-400 mt-3 rounded-lg" />

        <div className="mt-5 flex gap-6">
          {!isCallStarted ? (
            <button onClick={startCall} className="bg-green-500 text-white px-8 py-3 text-lg rounded-md">Start Call</button>
          ) : (
            <button onClick={endCall} className="bg-red-500 text-white px-8 py-3 text-lg rounded-md">End Call</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
