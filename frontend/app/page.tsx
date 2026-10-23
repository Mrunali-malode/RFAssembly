"use client";

import { useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Detection = {
  label: string;
  confidence: number;
  box: number[];
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function selectFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("That doesn't look like an image.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setDetections([]);
    setError(null);
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
      setResult(data.image);
      setDetections(data.detections);
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "Can't reach the backend. Is it running on port 8000?"
          : (e as Error).message
      );
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setDetections([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="page">
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      <header className="hero">
        <span className="badge">● YOLO powered</span>
        <h1>
          RF Assembly <span className="gradient">Detector</span>
        </h1>
        <p>Drop an image of your board and let the model spot the components.</p>
      </header>

      {!preview ? (
        <div
          className={`dropzone ${dragging ? "dragging" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            selectFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="drop-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <h2>Drag & drop an image</h2>
          <p>or click to browse — PNG, JPG, WEBP</p>
        </div>
      ) : (
        <section className="workspace">
          <div className="panels">
            <figure className="panel">
              <figcaption>Original</figcaption>
              <img src={preview} alt="Uploaded" />
            </figure>

            <figure className="panel">
              <figcaption>Detected</figcaption>
              {result ? (
                <img src={result} alt="Annotated result" />
              ) : (
                <div className="placeholder">
                  {loading ? (
                    <>
                      <div className="spinner" />
                      <span>Running detection…</span>
                    </>
                  ) : (
                    <span>Hit “Detect” to see results</span>
                  )}
                </div>
              )}
              {loading && <div className="scanline" />}
            </figure>
          </div>

          <div className="actions">
            <button className="btn primary" onClick={analyze} disabled={loading}>
              {loading ? "Detecting…" : "Detect components"}
            </button>
            <button className="btn ghost" onClick={reset} disabled={loading}>
              Upload another
            </button>
          </div>

          {result && (
            <div className="results">
              <h3>
                Detections <span className="count">{detections.length}</span>
              </h3>
              {detections.length === 0 ? (
                <p className="muted">No objects detected (or no model loaded yet).</p>
              ) : (
                <ul>
                  {detections.map((d, i) => (
                    <li key={i}>
                      <span className="label">{d.label}</span>
                      <div className="bar">
                        <div style={{ width: `${d.confidence * 100}%` }} />
                      </div>
                      <span className="conf">{(d.confidence * 100).toFixed(1)}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      {error && <div className="error">{error}</div>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => selectFile(e.target.files?.[0])}
      />
    </main>
  );
}
