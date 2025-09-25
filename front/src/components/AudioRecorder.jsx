import { useState, useRef } from "react";

const AudioRecorder = ({ onSave, existingAudio = null }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(existingAudio);
  const mediaRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert("Votre navigateur ne supporte pas l'enregistrement audio.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        if (onSave) onSave(blob, url);

        // 🔴 stop micro
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement audio :", err);
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    setRecording(false);
  };

  const resetRecording = () => {
    setAudioURL(null);
    if (onSave) onSave(null, null);
    setRecording(false);
  };

  return (
    <div className="space-y-2">
      {recording ? (
        <button
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Arrêter l'enregistrement
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Enregistrer un audio
        </button>
      )}

      {audioURL && (
        <div className="mt-2 flex flex-col gap-2">
          <audio controls src={audioURL} />
          <button
            onClick={resetRecording}
            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
