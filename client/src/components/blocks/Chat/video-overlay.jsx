import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { facialEmotionAnalyzer } from "@/lib/facial-emotion";

export function VideoOverlay({ isVideoOn, onEmotionDetected }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const containerRef = useRef(null);
    const [position, setPosition] = useState({ x: null, y: null });
    const [isDragging, setIsDragging] = useState(false);
    const [corner, setCorner] = useState("bottom-right");
    const dragOffset = useRef({ x: 0, y: 0 });
    const analysisTimeoutRef = useRef(null);
    const ANALYSIS_INTERVAL_MS = 1000; // Analyze 1 frame per second

    const cornerClasses = {
        "bottom-right": "bottom-24 right-4",
        "bottom-left": "bottom-24 left-4",
        "top-left": "top-16 left-4",
        "top-right": "top-16 right-4",
    };

    // Load Model
    useEffect(() => {
        if (isVideoOn) {
            facialEmotionAnalyzer.load().catch(err => console.error("Model load failed", err));
        }
    }, [isVideoOn]);

    // Camera & Analysis Loop
    useEffect(() => {
        const analyzeFrame = async () => {
            if (!videoRef.current || !canvasRef.current || !isVideoOn) return;

            // Run analysis
            const result = await facialEmotionAnalyzer.analyze(videoRef.current, canvasRef.current);

            if (result && onEmotionDetected) {
                onEmotionDetected(result);
            }

            // Schedule next analysis after interval (not every frame!)
            analysisTimeoutRef.current = setTimeout(analyzeFrame, ANALYSIS_INTERVAL_MS);
        };

        if (isVideoOn) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Start analysis once video is playing
                        videoRef.current.onloadeddata = () => {
                            analyzeFrame();
                        };
                    }
                })
                .catch((err) => {
                    console.error("Error accessing camera:", err);
                });
        } else {
            if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }

        return () => {
            if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, [isVideoOn, onEmotionDetected]);

    const handleMouseDown = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        setIsDragging(true);
        setPosition({ x: rect.left, y: rect.top });
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            setPosition({
                x: e.clientX - dragOffset.current.x,
                y: e.clientY - dragOffset.current.y,
            });
        };

        const handleMouseUp = (e) => {
            setIsDragging(false);

            const centerX = e.clientX;
            const centerY = e.clientY;
            const midX = window.innerWidth / 2;
            const midY = window.innerHeight / 2;

            if (centerX < midX && centerY < midY) {
                setCorner("top-left");
            } else if (centerX >= midX && centerY < midY) {
                setCorner("top-right");
            } else if (centerX < midX && centerY >= midY) {
                setCorner("bottom-left");
            } else {
                setCorner("bottom-right");
            }
            setPosition({ x: null, y: null });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    if (!isVideoOn) return null;

    const style =
        isDragging && position.x !== null
            ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
            : {};

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute z-20 cursor-grab overflow-hidden rounded-xl border border-border bg-card shadow-lg",
                isDragging
                    ? "cursor-grabbing opacity-90 scale-105"
                    : "transition-all duration-300",
                !isDragging && cornerClasses[corner]
            )}
            style={style}
            onMouseDown={handleMouseDown}
        >
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-32 w-44 -scale-x-100 object-cover pointer-events-none"
            />
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
