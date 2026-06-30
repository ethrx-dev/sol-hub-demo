"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type Pillar = "innovators" | "mentors" | "investors";

interface Question {
  label: string;
}

const QUESTIONS: Record<Pillar, Question[]> = {
  innovators: [
    { label: "What's the problem? What do you feel is wrong?" },
    { label: "Describe your solution or why it's important to solve" },
    { label: "What kind of help do you need?" },
  ],
  mentors: [
    { label: "What skills or experience do you have?" },
    { label: "How do you like communicating with people? (1-1, groups, writing, in person)" },
    { label: "What's your motivation for mentoring?" },
  ],
  investors: [
    { label: "How involved do you want to be?" },
    { label: "What resources do you have? (Land, capital, experience)" },
    { label: "Besides money, what do you see as your Return on Investment?" },
  ],
};

const SECONDS_PER_QUESTION = 30; // 30s per question = 90s total
const TOTAL_SECONDS = SECONDS_PER_QUESTION * 3;

type RecorderState = "idle" | "countdown" | "recording" | "preview" | "uploading" | "done";

export default function VideoRecorder({ pillar }: { pillar: Pillar }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<RecorderState>("idle");
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraReadyRef = useRef(false);

  const questions = QUESTIONS[pillar];

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    chunksRef.current = [];
  }, [recordedUrl]);

  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    setSupported(
      typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined"
    );
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return stream;
    } catch {
      setError("Camera access is required. Please allow camera and microphone permissions.");
      return null;
    }
  }, []);

  const startRecording = useCallback((stream: MediaStream) => {
    setActiveQuestion(0);
    setElapsed(0);

    const mimeTypes = [
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
    ];
    let mimeType = "";
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) {
        mimeType = mt;
        break;
      }
    }

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onerror = () => {
      setError("Recording failed due to a browser error. Please try again.");
      if (recorder.state === "recording") recorder.stop();
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setState("preview");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    recorder.start();
    setState("recording");

    let seconds = 0;
    timerRef.current = setInterval(() => {
      seconds++;
      setElapsed(seconds);
      setActiveQuestion(Math.min(Math.floor(seconds / SECONDS_PER_QUESTION), 2));

      if (seconds >= TOTAL_SECONDS) {
        if (recorder.state === "recording") recorder.stop();
      }
    }, 1000);
  }, []);

  const startCountdown = useCallback(() => {
    setError(null);
    setCountdown(3);
    setState("countdown");
    cameraReadyRef.current = false;
    startCamera().then((stream) => {
      cameraReadyRef.current = true;
      if (stream) streamRef.current = stream;
    });
  }, [startCamera]);

  useEffect(() => {
    if (state !== "countdown" || countdown <= 0) return;
    const id = setTimeout(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          if (cameraReadyRef.current && streamRef.current) {
            startRecording(streamRef.current);
          } else {
            setError("Camera access is required. Please allow camera and microphone permissions.");
            setState("idle");
          }
        }
        return next;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [state, countdown]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!recordedBlob) return;
    setState("uploading");

    try {
      const formData = new FormData();
      formData.append("pillar", pillar);
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      formData.append("video", recordedBlob, `intro.${ext}`);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const token = localStorage.getItem("auth_token");
      const res = await fetch(apiBase + "/pillars/submit-video", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Upload failed");
      }

      setState("done");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setState("preview");
    }
  }, [recordedBlob, pillar]);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setRecordedBlob(null);
    setRecordedUrl(null);
    setError(null);
    setActiveQuestion(0);
    setElapsed(0);
  }, [cleanup]);

  const remaining = TOTAL_SECONDS - elapsed;
  const questionSeconds = SECONDS_PER_QUESTION - (elapsed % SECONDS_PER_QUESTION);

  if (!mounted) return null;

  if (!supported) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Your browser does not support video recording. Please use Chrome, Safari, Firefox, or Edge.
      </div>
    );
  }

  if (state === "idle") {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold font-heading">Record Your Intro</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Record a 90-second video introducing yourself. Three questions, 30 seconds each.
        </p>
        {error && (
          <p className="mt-3 text-sm text-destructive bg-destructive/5 rounded p-2">{error}</p>
        )}
        <ol className="mt-3 space-y-1 text-sm text-muted-foreground">
          {questions.map((q, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-bold text-primary shrink-0">Q{i + 1}:</span>
              <span>{q.label}</span>
            </li>
          ))}
        </ol>
        <button
          onClick={startCountdown}
          className="btn-sol btn-sol-primary text-sm mt-4 w-full"
        >
          Start Recording
        </button>
      </div>
    );
  }

  if (state === "countdown") {
    return (
      <div className="rounded-lg border bg-black text-white overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-8xl font-bold font-heading">{countdown}</span>
          </div>
        </div>
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div className="rounded-lg border bg-black text-white overflow-hidden relative">
        <div className="flex items-center justify-center h-64">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium">REC</span>
            <span className="text-xs tabular-nums ml-2">
              {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="text-xs bg-white/20 rounded-full px-2.5 py-1">
              {activeQuestion + 1} / 3
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
            <p className="text-sm font-medium text-white/90">{questions[activeQuestion].label}</p>
            <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${((SECONDS_PER_QUESTION - questionSeconds) / SECONDS_PER_QUESTION) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <button
          onClick={stopRecording}
          className="absolute bottom-4 right-4 rounded-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          Stop
        </button>
      </div>
    );
  }

  if (state === "preview" && recordedUrl) {
    return (
      <div className="rounded-lg border bg-white overflow-hidden">
        <video ref={previewRef} src={recordedUrl} controls playsInline className="w-full" />
        <div className="p-4 space-y-3">
          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded p-2">{error}</p>
          )}
          <div className="flex gap-3">
            <button onClick={reset} className="btn-sol btn-sol-outline text-sm flex-1">
              Re-record
            </button>
            <button onClick={handleSubmit} className="btn-sol btn-sol-primary text-sm flex-1">
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "uploading") {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Uploading your video...</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <span className="text-2xl font-bold text-primary">✓</span>
        </div>
        <h3 className="mt-4 text-lg font-bold font-heading">Thank You!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your introduction has been submitted successfully.
        </p>
        <button onClick={reset} className="btn-sol btn-sol-outline text-sm mt-6">
          Record Again
        </button>
      </div>
    );
  }

  return null;
}
