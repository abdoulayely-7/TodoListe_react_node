import { useState, useRef } from "react";

const AudioRecorder = ({ onSave, existingAudio = null }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(existingAudio);
  const [elapsed, setElapsed] = useState(0);
  const MAX_SECONDS = 30;
  const mediaRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

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

        // stop timers
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setElapsed(0);

        // stop mic
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setElapsed(0);
      // Start UI timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            if (mediaRef.current && mediaRef.current.state !== "inactive") {
              mediaRef.current.stop();
            }
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
      // Hard stop after MAX_SECONDS
      timeoutRef.current = setTimeout(() => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
          mediaRef.current.stop();
        }
        setRecording(false);
      }, MAX_SECONDS * 1000);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement audio :", err);
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRecording(false);
  };

  const resetRecording = () => {
    setAudioURL(null);
    if (onSave) onSave(null, null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setElapsed(0);
    setRecording(false);
  };

  return (
    <div className="space-y-2">
      {recording ? (
        <button
          type="button"
          onClick={stopRecording}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Arrêter l'enregistrement
        </button>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Enregistrer un audio
        </button>
      )}

      {recording && (
        <div className="text-xs text-gray-500">{elapsed}s / {MAX_SECONDS}s</div>
      )}

      {audioURL && (
        <div className="mt-2 flex flex-col gap-2">
          <audio controls src={audioURL} />
          <button
            type="button"
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
