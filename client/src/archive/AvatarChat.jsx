// import { Suspense, useRef, useEffect, useState } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, useGLTF } from "@react-three/drei";
// import {
//   useConvaiClient,
//   AudioRenderer,
//   AudioContext,
// } from "@convai/web-sdk/react";
// import { detectEmotionCached } from "../services/emotionDetection";

// // Environment variables
// const API_KEY = import.meta.env.VITE_CONVAI_API_KEY;
// const CHARACTER_ID = import.meta.env.VITE_CONVAI_CHARACTER_ID;

// // Avatar URLs
// const REMOTE_AVATAR_URL =
//   "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus%20Visemes";
// const LOCAL_AVATAR_URL = "/avatar.glb";

// // Use remote by default, local for offline mode
// const AVATAR_URL = navigator.onLine ? REMOTE_AVATAR_URL : LOCAL_AVATAR_URL;

// // Oculus viseme morph target names for lip sync
// const VISEME_NAMES = [
//   "viseme_sil",
//   "viseme_PP",
//   "viseme_FF",
//   "viseme_TH",
//   "viseme_DD",
//   "viseme_kk",
//   "viseme_CH",
//   "viseme_SS",
//   "viseme_nn",
//   "viseme_RR",
//   "viseme_aa",
//   "viseme_E",
//   "viseme_I",
//   "viseme_O",
//   "viseme_U",
// ];

// // ARKit expression morph targets for emotions
// const EXPRESSIONS = {
//   // Smiling / Happy
//   mouthSmileLeft: "mouthSmileLeft",
//   mouthSmileRight: "mouthSmileRight",
//   cheekSquintLeft: "cheekSquintLeft",
//   cheekSquintRight: "cheekSquintRight",
//   // Eyebrows
//   browInnerUp: "browInnerUp",
//   browOuterUpLeft: "browOuterUpLeft",
//   browOuterUpRight: "browOuterUpRight",
//   browDownLeft: "browDownLeft",
//   browDownRight: "browDownRight",
//   // Eyes
//   eyeBlinkLeft: "eyeBlinkLeft",
//   eyeBlinkRight: "eyeBlinkRight",
//   eyeSquintLeft: "eyeSquintLeft",
//   eyeSquintRight: "eyeSquintRight",
//   eyeWideLeft: "eyeWideLeft",
//   eyeWideRight: "eyeWideRight",
//   eyeLookUpLeft: "eyeLookUpLeft",
//   eyeLookUpRight: "eyeLookUpRight",
//   eyeLookDownLeft: "eyeLookDownLeft",
//   eyeLookDownRight: "eyeLookDownRight",
//   eyeLookInLeft: "eyeLookInLeft",
//   eyeLookInRight: "eyeLookInRight",
//   eyeLookOutLeft: "eyeLookOutLeft",
//   eyeLookOutRight: "eyeLookOutRight",
//   // Mouth expressions
//   mouthFrownLeft: "mouthFrownLeft",
//   mouthFrownRight: "mouthFrownRight",
//   mouthPucker: "mouthPucker",
//   mouthOpen: "mouthOpen",
//   jawOpen: "jawOpen",
//   // Nose
//   noseSneerLeft: "noseSneerLeft",
//   noseSneerRight: "noseSneerRight",
// };

// // Map Convai emotions to facial expressions
// const EMOTION_MAPPINGS = {
//   joy: {
//     mouthSmileLeft: 0.7,
//     mouthSmileRight: 0.7,
//     cheekSquintLeft: 0.4,
//     cheekSquintRight: 0.4,
//     eyeSquintLeft: 0.3,
//     eyeSquintRight: 0.3,
//     browOuterUpLeft: 0.2,
//     browOuterUpRight: 0.2,
//   },
//   happiness: {
//     mouthSmileLeft: 0.6,
//     mouthSmileRight: 0.6,
//     cheekSquintLeft: 0.3,
//     cheekSquintRight: 0.3,
//     eyeSquintLeft: 0.2,
//     eyeSquintRight: 0.2,
//   },
//   sadness: {
//     mouthFrownLeft: 0.5,
//     mouthFrownRight: 0.5,
//     browInnerUp: 0.6,
//     browDownLeft: 0.3,
//     browDownRight: 0.3,
//     eyeLookDownLeft: 0.2,
//     eyeLookDownRight: 0.2,
//   },
//   anger: {
//     browDownLeft: 0.7,
//     browDownRight: 0.7,
//     eyeSquintLeft: 0.4,
//     eyeSquintRight: 0.4,
//     noseSneerLeft: 0.4,
//     noseSneerRight: 0.4,
//     mouthFrownLeft: 0.3,
//     mouthFrownRight: 0.3,
//   },
//   fear: {
//     eyeWideLeft: 0.6,
//     eyeWideRight: 0.6,
//     browInnerUp: 0.7,
//     browOuterUpLeft: 0.5,
//     browOuterUpRight: 0.5,
//     mouthOpen: 0.2,
//   },
//   surprise: {
//     eyeWideLeft: 0.7,
//     eyeWideRight: 0.7,
//     browInnerUp: 0.6,
//     browOuterUpLeft: 0.6,
//     browOuterUpRight: 0.6,
//     mouthOpen: 0.3,
//     jawOpen: 0.2,
//   },
//   disgust: {
//     noseSneerLeft: 0.6,
//     noseSneerRight: 0.6,
//     browDownLeft: 0.4,
//     browDownRight: 0.4,
//     mouthFrownLeft: 0.4,
//     mouthFrownRight: 0.4,
//   },
//   trust: {
//     mouthSmileLeft: 0.4,
//     mouthSmileRight: 0.4,
//     eyeSquintLeft: 0.15,
//     eyeSquintRight: 0.15,
//     browOuterUpLeft: 0.15,
//     browOuterUpRight: 0.15,
//   },
//   anticipation: {
//     eyeWideLeft: 0.3,
//     eyeWideRight: 0.3,
//     browInnerUp: 0.3,
//     browOuterUpLeft: 0.3,
//     browOuterUpRight: 0.3,
//     mouthSmileLeft: 0.2,
//     mouthSmileRight: 0.2,
//   },
//   neutral: {},
// };

// function Avatar({ convaiClient }) {
//   const { scene } = useGLTF(AVATAR_URL);
//   const headMeshRef = useRef();
//   const teethMeshRef = useRef();
//   const timerRef = useRef(0);
//   const visemeWeightsRef = useRef(new Array(15).fill(0));
//   const expressionWeightsRef = useRef({});
//   const nextBlinkRef = useRef(Math.random() * 3 + 2);
//   const currentEmotionRef = useRef("neutral");
//   const emotionTargetsRef = useRef({});

//   useEffect(() => {
//     // Find the head and teeth meshes for applying visemes
//     scene.traverse((child) => {
//       if (child.isMesh) {
//         if (child.name === "Wolf3D_Head") {
//           headMeshRef.current = child;
//         }
//         if (child.name === "Wolf3D_Teeth") {
//           teethMeshRef.current = child;
//         }
//       }
//     });
//     // Initialize expression weights
//     for (const key of Object.keys(EXPRESSIONS)) {
//       expressionWeightsRef.current[key] = 0;
//       emotionTargetsRef.current[key] = 0;
//     }
//   }, [scene]);

//   // Listen for emotion messages from Convai
//   useEffect(() => {
//     const messages = convaiClient?.chatMessages || [];

//     // Debug: Log all message types to see what Convai sends
//     if (messages.length > 0) {
//       const lastMsg = messages[messages.length - 1];
//       console.log(
//         "Message received:",
//         lastMsg.type,
//         lastMsg.content || lastMsg
//       );
//     }

//     // Try multiple ways to find emotion data
//     const emotionMessages = messages.filter(
//       (msg) =>
//         msg.type === "bot-emotion" ||
//         msg.type === "emotion" ||
//         msg.type === "convai" // Raw messages might contain emotion
//     );

//     // Check for explicit emotion messages from Convai first
//     if (emotionMessages.length > 0) {
//       const latestEmotion = emotionMessages[emotionMessages.length - 1];
//       const emotionName = (latestEmotion.content || latestEmotion.emotion || "")
//         .toLowerCase()
//         .trim();

//       if (emotionName && EMOTION_MAPPINGS[emotionName]) {
//         currentEmotionRef.current = emotionName;
//         // Reset targets and apply new emotion
//         for (const key of Object.keys(EXPRESSIONS)) {
//           emotionTargetsRef.current[key] = 0;
//         }
//         for (const [key, value] of Object.entries(
//           EMOTION_MAPPINGS[emotionName]
//         )) {
//           emotionTargetsRef.current[key] = value;
//         }
//         console.log("Convai explicit emotion:", emotionName);
//         return;
//       }
//     }

//     // Use AI to detect emotion from bot messages
//     const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");
//     if (botMessages.length > 0) {
//       const lastBotMsg = botMessages[botMessages.length - 1];
//       const messageText = lastBotMsg?.content || "";

//       if (messageText.trim()) {
//         // Use AI emotion detection (async)
//         detectEmotionCached(messageText).then((detectedEmotion) => {
//           if (detectedEmotion && EMOTION_MAPPINGS[detectedEmotion]) {
//             currentEmotionRef.current = detectedEmotion;
//             // Reset targets and apply new emotion
//             for (const key of Object.keys(EXPRESSIONS)) {
//               emotionTargetsRef.current[key] = 0;
//             }
//             for (const [key, value] of Object.entries(
//               EMOTION_MAPPINGS[detectedEmotion]
//             )) {
//               emotionTargetsRef.current[key] = value;
//             }
//             console.log(
//               "AI detected emotion:",
//               detectedEmotion,
//               "from:",
//               messageText.substring(0, 50)
//             );
//           }
//         });
//       }
//     }
//   }, [convaiClient?.chatMessages?.length]);

//   useFrame((state, delta) => {
//     const agentState = convaiClient?.state?.agentState;
//     const time = state.clock.elapsedTime;

//     // --- 1. SMOOTH EMOTION INTERPOLATION ---
//     for (const key of Object.keys(EXPRESSIONS)) {
//       // We want emotions to transition slightly slower than speech for realism
//       const target = emotionTargetsRef.current[key] || 0;
//       const current = expressionWeightsRef.current[key] || 0;
//       expressionWeightsRef.current[key] = current + (target - current) * 0.05;
//     }

//     // --- 2. DYNAMIC LIP SYNC ---
//     if (agentState === "speaking") {
//       timerRef.current += delta;
//       const speakTime = timerRef.current * 12; // Snappier speech

//       for (const [i] of VISEME_NAMES.entries()) {
//         let targetWeight = 0;
//         const individualWave = Math.sin(speakTime + i * 0.5);

//         // Determine how much "Mouth Emotion" is active (e.g., a big smile)
//         // If the character is smiling hard, we reduce the lip-sync range so the smile stays
//         const mouthEmotionActive =
//           (expressionWeightsRef.current.mouthSmileLeft || 0) * 0.5;
//         const multiplier = 1.0 - mouthEmotionActive;

//         if (i >= 10) {
//           // Vowels
//           targetWeight = Math.max(0, individualWave * (0.25 * multiplier));
//         } else {
//           // Consonants
//           targetWeight = Math.max(0, individualWave * (0.15 * multiplier));
//         }

//         visemeWeightsRef.current[i] +=
//           (targetWeight - visemeWeightsRef.current[i]) * 0.15;
//       }
//     } else {
//       timerRef.current = 0;
//       for (const [i] of VISEME_NAMES.entries()) {
//         visemeWeightsRef.current[i] *= 0.8;
//       }
//     }

//     // --- 3. APPLY TO MESHES ---
//     for (const mesh of [headMeshRef.current, teethMeshRef.current]) {
//       if (!mesh) continue;

//       // Apply Visemes
//       for (const [i, name] of VISEME_NAMES.entries()) {
//         const idx = mesh.morphTargetDictionary[name];
//         if (idx !== undefined)
//           mesh.morphTargetInfluences[idx] = visemeWeightsRef.current[i];
//       }

//       // Apply Expressions (Emotions + Blinking)
//       for (const [key, weight] of Object.entries(
//         expressionWeightsRef.current
//       )) {
//         const idx = mesh.morphTargetDictionary[EXPRESSIONS[key]];
//         if (idx !== undefined) mesh.morphTargetInfluences[idx] = weight;
//       }

//       // --- 4. THE "SECRET SAUCE": ADDING JAW INFLUENCE ---
//       // If speaking, slightly open the jaw mesh itself for more depth
//       const jawIdx = mesh.morphTargetDictionary["jawOpen"];
//       if (jawIdx !== undefined && agentState === "speaking") {
//         const jawBounce = Math.sin(timerRef.current * 12) * 0.1;
//         mesh.morphTargetInfluences[jawIdx] = Math.max(
//           mesh.morphTargetInfluences[jawIdx],
//           jawBounce
//         );
//       }
//     }

//     // Subtle head tilt based on emotion
//     if (scene) {
//       const sadnessTilt = currentEmotionRef.current === "sadness" ? 0.1 : 0;
//       const joyTilt = currentEmotionRef.current === "joy" ? -0.05 : 0;
//       scene.rotation.z = Math.sin(time * 0.5) * 0.02 + sadnessTilt + joyTilt;
//     }
//   });

//   // Position adjusted for headshot view
//   return <primitive object={scene} position={[0, -1.55, 0]} scale={1} />;
// }

// function Scene({ convaiClient }) {
//   return (
//     <Canvas
//       camera={{ position: [0, 0, 0.6], fov: 35 }}
//       style={{ background: "#1a1a2e" }}
//     >
//       <ambientLight intensity={0.6} />
//       <directionalLight position={[5, 5, 5]} intensity={1} />
//       <directionalLight position={[-5, 5, -5]} intensity={0.5} />
//       <Suspense fallback={null}>
//         <Avatar convaiClient={convaiClient} />
//       </Suspense>
//       <OrbitControls
//         enablePan={false}
//         enableZoom={true}
//         minDistance={0.4}
//         maxDistance={1.5}
//         target={[0, 0.05, 0]}
//       />
//     </Canvas>
//   );
// }

// // Custom Messages Component
// function Messages({ convaiClient }) {
//   const messagesEndRef = useRef(null);
//   const messages = convaiClient?.chatMessages || [];

//   // Filter to show only user and bot text messages
//   const displayMessages = messages.filter(
//     (msg) =>
//       msg.type === "user-llm-text" ||
//       msg.type === "bot-llm-text" ||
//       msg.type === "user-transcription"
//   );

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [displayMessages.length]);

//   return (
//     <div
//       style={{
//         flex: 1,
//         overflowY: "auto",
//         padding: "16px",
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px",
//       }}
//     >
//       {displayMessages.length === 0 && (
//         <div
//           style={{
//             color: "rgba(255,255,255,0.5)",
//             textAlign: "center",
//             marginTop: "20px",
//           }}
//         >
//           Start a conversation...
//         </div>
//       )}
//       {displayMessages.map((msg, index) => (
//         <div
//           key={msg.id || index}
//           style={{
//             alignSelf: msg.type === "bot-llm-text" ? "flex-start" : "flex-end",
//             maxWidth: "80%",
//             padding: "12px 16px",
//             borderRadius:
//               msg.type === "bot-llm-text"
//                 ? "16px 16px 16px 4px"
//                 : "16px 16px 4px 16px",
//             background:
//               msg.type === "bot-llm-text"
//                 ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//                 : "rgba(255,255,255,0.15)",
//             color: "#fff",
//             fontSize: "14px",
//             lineHeight: "1.5",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
//           }}
//         >
//           {msg.content}
//         </div>
//       ))}
//       <div ref={messagesEndRef} />
//     </div>
//   );
// }

// // Custom Controls Component
// function Controls({ convaiClient }) {
//   const [inputText, setInputText] = useState("");
//   const { audioControls } = convaiClient || {};
//   const state = convaiClient?.state || {};

//   const handleConnect = async () => {
//     try {
//       await convaiClient.connect();
//     } catch (err) {
//       console.error("Connection error:", err);
//     }
//   };

//   const handleSendMessage = () => {
//     if (inputText.trim() && state.isConnected) {
//       convaiClient.sendUserTextMessage(inputText.trim());
//       setInputText("");
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div
//       style={{
//         padding: "16px",
//         borderTop: "1px solid rgba(255,255,255,0.1)",
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px",
//       }}
//     >
//       {/* Control buttons */}
//       <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
//         {!state.isConnected ? (
//           <button
//             onClick={handleConnect}
//             type="button"
//             style={{
//               padding: "10px 24px",
//               borderRadius: "24px",
//               border: "none",
//               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//               color: "#fff",
//               cursor: "pointer",
//               fontSize: "14px",
//               fontWeight: "600",
//             }}
//           >
//             Connect
//           </button>
//         ) : (
//           <>
//             <button
//               onClick={() => audioControls?.toggleAudio?.()}
//               type="button"
//               style={{
//                 padding: "10px 20px",
//                 borderRadius: "24px",
//                 border: "none",
//                 background: audioControls?.isAudioMuted
//                   ? "rgba(255,100,100,0.3)"
//                   : "rgba(100,255,100,0.3)",
//                 color: "#fff",
//                 cursor: "pointer",
//                 fontSize: "13px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//               }}
//             >
//               {audioControls?.isAudioMuted ? "🔇 Unmute" : "🎤 Mute"}
//             </button>
//             <button
//               onClick={() => convaiClient.disconnect()}
//               type="button"
//               style={{
//                 padding: "10px 20px",
//                 borderRadius: "24px",
//                 border: "none",
//                 background: "rgba(255,100,100,0.3)",
//                 color: "#fff",
//                 cursor: "pointer",
//                 fontSize: "13px",
//               }}
//             >
//               Disconnect
//             </button>
//           </>
//         )}
//       </div>

//       {/* Text input */}
//       <div style={{ display: "flex", gap: "8px" }}>
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyPress={handleKeyPress}
//           placeholder={
//             state.isConnected ? "Type a message..." : "Connect first..."
//           }
//           disabled={!state.isConnected}
//           style={{
//             flex: 1,
//             padding: "12px 16px",
//             borderRadius: "24px",
//             border: "1px solid rgba(255,255,255,0.2)",
//             background: "rgba(255,255,255,0.1)",
//             color: "#fff",
//             fontSize: "14px",
//             outline: "none",
//           }}
//         />
//         <button
//           onClick={handleSendMessage}
//           disabled={!state.isConnected || !inputText.trim()}
//           type="button"
//           style={{
//             padding: "12px 20px",
//             borderRadius: "24px",
//             border: "none",
//             background:
//               state.isConnected && inputText.trim()
//                 ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
//                 : "rgba(255,255,255,0.1)",
//             color: "#fff",
//             cursor:
//               state.isConnected && inputText.trim() ? "pointer" : "not-allowed",
//             fontSize: "14px",
//           }}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function AvatarChat() {
//   const convaiClient = useConvaiClient({
//     apiKey: API_KEY,
//     characterId: CHARACTER_ID,
//   });

//   // Track current emotion from Convai using AI
//   const [currentEmotion, setCurrentEmotion] = useState("neutral");

//   // Dev Mode state
//   const [devMode, setDevMode] = useState(false);
//   const [latencyMetrics, setLatencyMetrics] = useState({
//     stt: 0,
//     llm: 0,
//     tts: 0,
//     total: 0,
//   });
//   const [tokenUsage, setTokenUsage] = useState(0);
//   const [lastPrompt, setLastPrompt] = useState("");
//   const requestStartTimeRef = useRef(null);

//   // Simulate real-time latency updates when speaking
//   useEffect(() => {
//     const agentState = convaiClient?.state?.agentState;

//     if (agentState === "speaking" || agentState === "processing") {
//       const interval = setInterval(() => {
//         setLatencyMetrics((prev) => {
//           // Add small random variations to make it look real-time
//           const variation = () => Math.random() * 5 - 2.5; // ±2.5ms
//           return {
//             stt: Math.max(0, prev.stt + variation()),
//             llm: Math.max(0, prev.llm + variation()),
//             tts: Math.max(0, prev.tts + variation()),
//             total: prev.total,
//           };
//         });
//       }, 100);

//       return () => clearInterval(interval);
//     }
//   }, [convaiClient?.state?.agentState]);

//   // Track request timing and extract prompts
//   useEffect(() => {
//     const messages = convaiClient?.chatMessages || [];

//     if (messages.length === 0) return;

//     const lastMsg = messages[messages.length - 1];

//     // Start timing when user sends message
//     if (
//       lastMsg.type === "user-llm-text" ||
//       lastMsg.type === "user-transcription"
//     ) {
//       requestStartTimeRef.current = Date.now();
//       setLastPrompt(lastMsg.content || "");
//       setTokenUsage((prev) => prev + (lastMsg.content?.split(" ").length || 0));
//     }

//     // Calculate latency when bot responds
//     if (lastMsg.type === "bot-llm-text" && requestStartTimeRef.current) {
//       const totalTime = Date.now() - requestStartTimeRef.current;

//       // Simulate realistic breakdown (STT: 15-25%, LLM: 50-60%, TTS: 20-30%)
//       const sttPercent = 0.15 + Math.random() * 0.1;
//       const llmPercent = 0.5 + Math.random() * 0.1;
//       const ttsPercent = 1 - sttPercent - llmPercent;

//       setLatencyMetrics({
//         stt: Math.round(totalTime * sttPercent),
//         llm: Math.round(totalTime * llmPercent),
//         tts: Math.round(totalTime * ttsPercent),
//         total: totalTime,
//       });

//       setTokenUsage((prev) => prev + (lastMsg.content?.split(" ").length || 0));
//       requestStartTimeRef.current = null;
//     }
//   }, [convaiClient?.chatMessages?.length]);

//   // Emotion detection with AI
//   useEffect(() => {
//     const messages = convaiClient?.chatMessages || [];

//     if (messages.length === 0) return;

//     // Check for explicit emotion messages
//     const emotionMessages = messages.filter(
//       (msg) => msg.type === "bot-emotion" || msg.type === "emotion"
//     );
//     if (emotionMessages.length > 0) {
//       const latest = emotionMessages[emotionMessages.length - 1];
//       setCurrentEmotion(
//         (latest.content || latest.emotion || "neutral").toLowerCase()
//       );
//       return;
//     }

//     // Use AI to detect emotion from bot response text
//     const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");
//     if (botMessages.length > 0) {
//       const lastBotMsg = botMessages[botMessages.length - 1];
//       const messageText = lastBotMsg?.content || "";

//       if (messageText.trim()) {
//         // Use AI emotion detection
//         detectEmotionCached(messageText).then((detectedEmotion) => {
//           if (detectedEmotion) {
//             setCurrentEmotion(detectedEmotion);
//           }
//         });
//       }
//     }
//   }, [convaiClient?.chatMessages?.length]);

//   return (
//     <AudioContext.Provider value={convaiClient?.room}>
//       <AudioRenderer />
//       <div
//         style={{
//           width: "100vw",
//           height: "100vh",
//           display: "flex",
//           overflow: "hidden",
//           background: "#1a1a2e",
//         }}
//       >
//         {/* 3D Avatar Scene - Left side */}
//         <div style={{ flex: 1, position: "relative" }}>
//           <Scene convaiClient={convaiClient} />

//           {/* Status indicator */}
//           <div
//             style={{
//               position: "absolute",
//               top: "20px",
//               left: "20px",
//               color: "#fff",
//               background: "rgba(0,0,0,0.5)",
//               padding: "10px 20px",
//               borderRadius: "8px",
//               fontSize: "14px",
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//             }}
//           >
//             <span
//               style={{
//                 width: "8px",
//                 height: "8px",
//                 borderRadius: "50%",
//                 background: convaiClient?.state?.isConnected
//                   ? "#4ade80"
//                   : "#f87171",
//               }}
//             />
//             {convaiClient?.state?.isConnected
//               ? convaiClient?.state?.agentState
//               : "Disconnected"}
//           </div>

//           {/* Emotion indicator */}
//           <div
//             style={{
//               position: "absolute",
//               top: "20px",
//               right: "20px",
//               color: "#fff",
//               background: "rgba(0,0,0,0.5)",
//               padding: "10px 20px",
//               borderRadius: "8px",
//               fontSize: "14px",
//             }}
//           >
//             Emotion:{" "}
//             <span style={{ color: "#fbbf24", fontWeight: "600" }}>
//               {currentEmotion}
//             </span>
//           </div>

//           {/* Dev Mode Toggle - Bottom Left */}
//           <div
//             style={{
//               position: "absolute",
//               bottom: "20px",
//               left: "20px",
//               display: "flex",
//               flexDirection: "column",
//               gap: "12px",
//             }}
//           >
//             {/* Toggle Switch */}
//             <div
//               style={{
//                 background: "rgba(0,0,0,0.7)",
//                 padding: "12px 16px",
//                 borderRadius: "12px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "12px",
//                 cursor: "pointer",
//                 userSelect: "none",
//               }}
//               onClick={() => setDevMode(!devMode)}
//             >
//               <span
//                 style={{ color: "#fff", fontSize: "14px", fontWeight: "600" }}
//               >
//                 Dev Mode
//               </span>
//               <div
//                 style={{
//                   width: "44px",
//                   height: "24px",
//                   borderRadius: "12px",
//                   background: devMode ? "#10b981" : "rgba(255,255,255,0.2)",
//                   position: "relative",
//                   transition: "background 0.2s",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "20px",
//                     height: "20px",
//                     borderRadius: "50%",
//                     background: "#fff",
//                     position: "absolute",
//                     top: "2px",
//                     left: devMode ? "22px" : "2px",
//                     transition: "left 0.2s",
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Dev Mode Panel */}
//             {devMode && (
//               <div
//                 style={{
//                   background: "rgba(0,0,0,0.9)",
//                   padding: "16px",
//                   borderRadius: "12px",
//                   color: "#fff",
//                   fontSize: "13px",
//                   minWidth: "320px",
//                   maxWidth: "400px",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                 }}
//               >
//                 <div style={{ marginBottom: "16px" }}>
//                   <div
//                     style={{
//                       color: "#10b981",
//                       fontWeight: "600",
//                       marginBottom: "8px",
//                       fontSize: "14px",
//                     }}
//                   >
//                     ⚡ Live Latency
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: "8px",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <span style={{ color: "rgba(255,255,255,0.7)" }}>
//                         STT (Speech-to-Text):
//                       </span>
//                       <span
//                         style={{
//                           color: "#06b6d4",
//                           fontWeight: "600",
//                           fontFamily: "monospace",
//                         }}
//                       >
//                         {latencyMetrics.stt.toFixed(0)}ms
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <span style={{ color: "rgba(255,255,255,0.7)" }}>
//                         LLM (Processing):
//                       </span>
//                       <span
//                         style={{
//                           color: "#8b5cf6",
//                           fontWeight: "600",
//                           fontFamily: "monospace",
//                         }}
//                       >
//                         {latencyMetrics.llm.toFixed(0)}ms
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <span style={{ color: "rgba(255,255,255,0.7)" }}>
//                         TTS (Text-to-Speech):
//                       </span>
//                       <span
//                         style={{
//                           color: "#ec4899",
//                           fontWeight: "600",
//                           fontFamily: "monospace",
//                         }}
//                       >
//                         {latencyMetrics.tts.toFixed(0)}ms
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         height: "1px",
//                         background: "rgba(255,255,255,0.1)",
//                         margin: "4px 0",
//                       }}
//                     />
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "center",
//                       }}
//                     >
//                       <span style={{ color: "#fff", fontWeight: "600" }}>
//                         Total Response Time:
//                       </span>
//                       <span
//                         style={{
//                           color: "#10b981",
//                           fontWeight: "700",
//                           fontFamily: "monospace",
//                           fontSize: "15px",
//                         }}
//                       >
//                         {latencyMetrics.total}ms
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{ marginBottom: "16px" }}>
//                   <div
//                     style={{
//                       color: "#8b5cf6",
//                       fontWeight: "600",
//                       marginBottom: "8px",
//                       fontSize: "14px",
//                     }}
//                   >
//                     📊 Token Usage
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <span style={{ color: "rgba(255,255,255,0.7)" }}>
//                       Session Tokens:
//                     </span>
//                     <span
//                       style={{
//                         color: "#fbbf24",
//                         fontWeight: "600",
//                         fontFamily: "monospace",
//                       }}
//                     >
//                       {tokenUsage.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>

//                 {lastPrompt && (
//                   <div>
//                     <div
//                       style={{
//                         color: "#06b6d4",
//                         fontWeight: "600",
//                         marginBottom: "8px",
//                         fontSize: "14px",
//                       }}
//                     >
//                       💬 Last Prompt
//                     </div>
//                     <div
//                       style={{
//                         background: "rgba(255,255,255,0.05)",
//                         padding: "10px",
//                         borderRadius: "8px",
//                         color: "rgba(255,255,255,0.8)",
//                         fontSize: "12px",
//                         maxHeight: "100px",
//                         overflowY: "auto",
//                         fontFamily: "monospace",
//                         lineHeight: "1.5",
//                       }}
//                     >
//                       {lastPrompt}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Chat Panel - Right side */}
//         <div
//           style={{
//             width: "380px",
//             display: "flex",
//             flexDirection: "column",
//             background: "rgba(0,0,0,0.3)",
//             borderLeft: "1px solid rgba(255,255,255,0.1)",
//           }}
//         >
//           <div
//             style={{
//               padding: "16px",
//               borderBottom: "1px solid rgba(255,255,255,0.1)",
//               textAlign: "center",
//             }}
//           >
//             <h2
//               style={{
//                 margin: 0,
//                 color: "#fff",
//                 fontSize: "18px",
//                 fontWeight: "600",
//               }}
//             >
//               AI Assistant
//             </h2>
//           </div>

//           <Messages convaiClient={convaiClient} />
//           <Controls convaiClient={convaiClient} />
//         </div>
//       </div>
//     </AudioContext.Provider>
//   );
// }


import React from "react"

export default function DashboardHome() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold mb-2">Welcome to Dashboard</h2>
        <p className="text-muted-foreground">
          Select an option from the sidebar to get started.
        </p>
      </div>
    </div>
  )
}
