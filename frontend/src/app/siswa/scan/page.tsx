"use client";

import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";

const SCANNER_ELEMENT_ID = "qr-scanner-box";

export default function ScanQrPage() {
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef<import("html5-qrcode").Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!scanning) return;

    let mounted = true;

    import("html5-qrcode").then(({ Html5QrcodeScanner }) => {
      if (!mounted) return;

      const scanner = new Html5QrcodeScanner(
        SCANNER_ELEMENT_ID,
        { fps: 10, qrbox: 250 },
        false
      );

      scanner.render(
        async (decodedText: string) => {
          if (processingRef.current) return;
          processingRef.current = true;

          try {
            await api.post("/absen/scan", { token: decodedText });
            setResult({ type: "success", message: "Absen berhasil dicatat." });
          } catch (err) {
            setResult({ type: "error", message: apiErrorMessage(err) });
          } finally {
            setScanning(false);
          }
        },
        () => {
          // ignore scan failures (frame without a readable QR)
        }
      );

      scannerRef.current = scanner;
    });

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [scanning]);

  function handleScanAgain() {
    processingRef.current = false;
    setResult(null);
    setScanning(true);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Scan QR Absensi</h1>
      <p className="text-slate-500 mt-1">Arahkan kamera ke QR yang ditampilkan guru.</p>

      <div className="mt-4 bg-white rounded-lg shadow p-4 max-w-md">
        {scanning && <div id={SCANNER_ELEMENT_ID} />}

        {result && (
          <div className="py-8 text-center">
            <p className={result.type === "success" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
              {result.message}
            </p>
            <button
              onClick={handleScanAgain}
              className="mt-4 rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Scan Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
