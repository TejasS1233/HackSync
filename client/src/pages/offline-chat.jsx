import { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { useOffline } from "../services/offline";

// Use local avatar for offline mode
const AVATAR_URL = "/avatar.glb";

// Simplified viseme names for lip-sync
const VISEME_NAMES = [
    "viseme_sil",
    "viseme_PP",
    "viseme_FF",
    "viseme_TH",
    "viseme_DD",
    "viseme_kk",
    "viseme_CH",
    "viseme_SS",
    "viseme_nn",
    "viseme_RR",
    "viseme_aa",
    "viseme_E",
    "viseme_I",
    "viseme_O",
    "viseme_U",
];

function OfflineAvatar({ isSpeaking }) {
    const { scene } = useGLTF(AVATAR_URL);
    const headMeshRef = useRef();
    const teethMeshRef = useRef();
    const timerRef = useRef(0);
    const visemeWeightsRef = useRef(new Array(15).fill(0));

    useEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                if (child.name === "Wolf3D_Head") headMeshRef.current = child;
                if (child.name === "Wolf3D_Teeth") teethMeshRef.current = child;
            }
        });
    }, [scene]);

    useFrame((state, delta) => {
        // Simple lip-sync animation when speaking
        if (isSpeaking) {
            timerRef.current += delta;
            const speakTime = timerRef.current * 10;

            for (const [i] of VISEME_NAMES.entries()) {
                const wave = Math.sin(speakTime + i * 0.5);
                const targetWeight = i >= 10 ? Math.max(0, wave * 0.3) : Math.max(0, wave * 0.15);
                visemeWeightsRef.current[i] += (targetWeight - visemeWeightsRef.current[i]) * 0.15;
            }
        } else {
            timerRef.current = 0;
            for (const [i] of VISEME_NAMES.entries()) {
                visemeWeightsRef.current[i] *= 0.8;
            }
        }

        // Apply to meshes
        for (const mesh of [headMeshRef.current, teethMeshRef.current]) {
            if (!mesh?.morphTargetDictionary) continue;
            for (const [i, name] of VISEME_NAMES.entries()) {
                const idx = mesh.morphTargetDictionary[name];
                if (idx !== undefined) {
                    mesh.morphTargetInfluences[idx] = visemeWeightsRef.current[i];
                }
            }
        }

        // Subtle idle animation
        if (scene) {
            scene.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        }
    });

    return <primitive object={scene} position={[0, -1.55, 0]} scale={1} />;
}

function Scene({ isSpeaking }) {
    return (
        <Canvas camera={{ position: [0, 0, 0.6], fov: 35 }} style={{ background: "#1a1a2e" }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            <Suspense fallback={null}>
                <OfflineAvatar isSpeaking={isSpeaking} />
            </Suspense>
            <OrbitControls enablePan={false} enableZoom={true} minDistance={0.4} maxDistance={1.5} target={[0, 0.05, 0]} />
        </Canvas>
    );
}

function LoadingOverlay({ progress, status }) {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                zIndex: 100,
            }}
        >
            <div style={{ fontSize: "24px", marginBottom: "20px" }}>Loading Offline AI...</div>
            <div style={{ width: "300px", height: "8px", background: "#333", borderRadius: "4px", overflow: "hidden" }}>
                <div
                    style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        transition: "width 0.3s",
                    }}
                />
            </div>
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#888" }}>{status}</div>
            <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>~200MB model download (cached for future use)</div>
        </div>
    );
}

export default function OfflineChat() {
    const offline = useOffline();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    // Initialize offline services
    const handleInit = async () => {
        await offline.initOfflineServices();
    };

    // Send text message
    const handleSend = async () => {
        if (!inputText.trim() || isGenerating) return;

        const userMessage = inputText.trim();
        setInputText("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsGenerating(true);

        try {
            const response = await offline.generateResponse(userMessage);
            setMessages((prev) => [...prev, { role: "assistant", content: response }]);

            // Speak the response
            setIsSpeaking(true);
            await offline.speak(response, {
                onEnd: () => setIsSpeaking(false),
            });
        } catch (error) {
            console.error("Generation error:", error);
            setMessages((prev) => [...prev, { role: "error", content: error.message }]);
        } finally {
            setIsGenerating(false);
            setIsSpeaking(false);
        }
    };

    // Handle voice input
    const handleVoice = () => {
        if (isListening) {
            offline.stopListening();
            setIsListening(false);
        } else {
            setIsListening(true);
            offline.startListening({
                onResult: (text) => {
                    setInputText((prev) => prev + text);
                    setIsListening(false);
                },
                onError: () => setIsListening(false),
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", background: "#1a1a2e" }}>
            {/* Loading overlay */}
            {offline.isLoading && <LoadingOverlay progress={offline.loadProgress.progress} status={offline.loadProgress.status} />}

            {/* 3D Avatar Scene */}
            <div style={{ flex: 1, position: "relative" }}>
                <Scene isSpeaking={isSpeaking} />

                {/* Status badge */}
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "20px",
                        color: "#fff",
                        background: "rgba(0,0,0,0.5)",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: offline.isReady ? "#4ade80" : "#fbbf24" }} />
                    {offline.isReady ? (isSpeaking ? "Speaking" : isGenerating ? "Thinking..." : "Ready") : "Offline Mode"}
                </div>

                {/* Online/Offline indicator */}
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        color: "#fff",
                        background: offline.isOnline ? "rgba(74, 222, 128, 0.3)" : "rgba(251, 191, 36, 0.3)",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "12px",
                    }}
                >
                    {offline.isOnline ? "🌐 Online" : "📴 Offline"}
                </div>
            </div>

            {/* Chat Panel */}
            <div
                style={{
                    width: "380px",
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(0,0,0,0.3)",
                    borderLeft: "1px solid rgba(255,255,255,0.1)",
                }}
            >
                {/* Header */}
                <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
                    <h2 style={{ margin: 0, color: "#fff", fontSize: "18px", fontWeight: "600" }}>Offline Assistant</h2>
                    <div style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>SmolLM-360M • Local AI</div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    {!offline.isReady && (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🤖</div>
                            <div style={{ color: "#fff", fontSize: "16px", marginBottom: "8px" }}>Offline AI Assistant</div>
                            <div style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>
                                Runs entirely in your browser. No internet required after setup.
                            </div>
                            <button
                                onClick={handleInit}
                                type="button"
                                style={{
                                    padding: "12px 32px",
                                    borderRadius: "24px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                }}
                            >
                                Download AI Model (~200MB)
                            </button>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div
                            key={`msg-${msg.role}-${index}`}
                            style={{
                                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                maxWidth: "80%",
                                padding: "12px 16px",
                                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                background: msg.role === "user" ? "rgba(255,255,255,0.15)" : msg.role === "error" ? "rgba(255,100,100,0.3)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "#fff",
                                fontSize: "14px",
                                lineHeight: "1.5",
                            }}
                        >
                            {msg.content}
                        </div>
                    ))}

                    {isGenerating && (
                        <div style={{ alignSelf: "flex-start", color: "#888", fontSize: "14px", padding: "8px" }}>Thinking...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {offline.isReady && (
                    <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: "8px" }}>
                        <button
                            onClick={handleVoice}
                            type="button"
                            style={{
                                padding: "12px",
                                borderRadius: "50%",
                                border: "none",
                                background: isListening ? "rgba(255,100,100,0.5)" : "rgba(255,255,255,0.1)",
                                color: "#fff",
                                cursor: "pointer",
                            }}
                        >
                            {isListening ? "⏹️" : "🎤"}
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            disabled={isGenerating}
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: "24px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.1)",
                                color: "#fff",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isGenerating || !inputText.trim()}
                            type="button"
                            style={{
                                padding: "12px 20px",
                                borderRadius: "24px",
                                border: "none",
                                background: inputText.trim() && !isGenerating ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "rgba(255,255,255,0.1)",
                                color: "#fff",
                                cursor: inputText.trim() && !isGenerating ? "pointer" : "not-allowed",
                                fontSize: "14px",
                            }}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
