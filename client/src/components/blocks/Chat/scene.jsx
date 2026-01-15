import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

const AVATAR_URL_ONLINE = "/avatar.glb";
const AVATAR_URL_OFFLINE = "/avatar.glb";

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

const EXPRESSIONS = {
  mouthSmileLeft: "mouthSmileLeft",
  mouthSmileRight: "mouthSmileRight",
  cheekSquintLeft: "cheekSquintLeft",
  cheekSquintRight: "cheekSquintRight",
  browInnerUp: "browInnerUp",
  browOuterUpLeft: "browOuterUpLeft",
  browOuterUpRight: "browOuterUpRight",
  browDownLeft: "browDownLeft",
  browDownRight: "browDownRight",
  eyeBlinkLeft: "eyeBlinkLeft",
  eyeBlinkRight: "eyeBlinkRight",
  eyeSquintLeft: "eyeSquintLeft",
  eyeSquintRight: "eyeSquintRight",
  eyeWideLeft: "eyeWideLeft",
  eyeWideRight: "eyeWideRight",
  eyeLookDownLeft: "eyeLookDownLeft",
  eyeLookDownRight: "eyeLookDownRight",
  mouthFrownLeft: "mouthFrownLeft",
  mouthFrownRight: "mouthFrownRight",
  mouthOpen: "mouthOpen",
  jawOpen: "jawOpen",
  noseSneerLeft: "noseSneerLeft",
  noseSneerRight: "noseSneerRight",
};

const EMOTION_MAPPINGS = {
  joy: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    cheekSquintLeft: 0.4,
    cheekSquintRight: 0.4,
    eyeSquintLeft: 0.3,
    eyeSquintRight: 0.3,
  },
  happiness: {
    mouthSmileLeft: 0.6,
    mouthSmileRight: 0.6,
    cheekSquintLeft: 0.3,
    cheekSquintRight: 0.3,
  },
  sadness: {
    mouthFrownLeft: 0.5,
    mouthFrownRight: 0.5,
    browInnerUp: 0.6,
    browDownLeft: 0.3,
    browDownRight: 0.3,
  },
  anger: {
    browDownLeft: 0.7,
    browDownRight: 0.7,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    noseSneerLeft: 0.4,
    noseSneerRight: 0.4,
  },
  fear: {
    eyeWideLeft: 0.6,
    eyeWideRight: 0.6,
    browInnerUp: 0.7,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
  },
  surprise: {
    eyeWideLeft: 0.7,
    eyeWideRight: 0.7,
    browInnerUp: 0.6,
    mouthOpen: 0.3,
    jawOpen: 0.2,
  },
  neutral: {},
};

function OnlineAvatar({ convaiClient, emotion = "neutral", avatarModel = "/avatar.glb" }) {
  const { scene } = useGLTF(avatarModel);
  const headMeshRef = useRef();
  const teethMeshRef = useRef();
  const timerRef = useRef(0);
  const visemeWeightsRef = useRef(new Array(15).fill(0));
  const expressionWeightsRef = useRef({});
  const currentEmotionRef = useRef("neutral");
  const emotionTargetsRef = useRef({});

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        if (child.name === "Wolf3D_Head") headMeshRef.current = child;
        if (child.name === "Wolf3D_Teeth") teethMeshRef.current = child;
      }
    });
    Object.keys(EXPRESSIONS).forEach((key) => {
      expressionWeightsRef.current[key] = 0;
      emotionTargetsRef.current[key] = 0;
    });
  }, [scene]);

  useEffect(() => {
    // Map detector emotion names to EMOTION_MAPPINGS keys
    const EMOTION_NAME_MAP = {
      happy: "happiness",
      sad: "sadness",
      angry: "anger",
      fearful: "fear",
      surprised: "surprise",
    };

    const mappedEmotion = EMOTION_NAME_MAP[emotion] || emotion;
    console.log("🎭 Avatar emotion mapping:", emotion, "→", mappedEmotion);

    const targetMapping =
      EMOTION_MAPPINGS[mappedEmotion] || EMOTION_MAPPINGS["neutral"];
    currentEmotionRef.current = mappedEmotion;

    Object.keys(EXPRESSIONS).forEach((key) => {
      emotionTargetsRef.current[key] = 0;
    });
    Object.entries(targetMapping).forEach(([key, value]) => {
      emotionTargetsRef.current[key] = value;
    });
  }, [emotion]);

  useFrame((state, delta) => {
    const agentState = convaiClient?.state?.agentState;
    const time = state.clock.elapsedTime;

    // Faster transition speed for more responsive emotion changes (0.15 instead of 0.05)
    Object.keys(EXPRESSIONS).forEach((key) => {
      const target = emotionTargetsRef.current[key] || 0;
      const current = expressionWeightsRef.current[key] || 0;
      expressionWeightsRef.current[key] = current + (target - current) * 0.15;
    });

    if (agentState === "speaking") {
      timerRef.current += delta;
      const speakTime = timerRef.current * 12;

      VISEME_NAMES.forEach((_, i) => {
        const individualWave = Math.sin(speakTime + i * 0.5);
        const mouthEmotionActive =
          (expressionWeightsRef.current.mouthSmileLeft || 0) * 0.5;
        const multiplier = 1.0 - mouthEmotionActive;
        const targetWeight = Math.max(
          0,
          individualWave * (i >= 10 ? 0.25 : 0.15) * multiplier
        );
        visemeWeightsRef.current[i] +=
          (targetWeight - visemeWeightsRef.current[i]) * 0.15;
      });
    } else {
      timerRef.current = 0;
      VISEME_NAMES.forEach((_, i) => {
        visemeWeightsRef.current[i] *= 0.8;
      });
    }

    [headMeshRef.current, teethMeshRef.current].forEach((mesh) => {
      if (!mesh) return;

      VISEME_NAMES.forEach((name, i) => {
        const idx = mesh.morphTargetDictionary[name];
        if (idx !== undefined)
          mesh.morphTargetInfluences[idx] = visemeWeightsRef.current[i];
      });

      Object.entries(expressionWeightsRef.current).forEach(([key, weight]) => {
        const idx = mesh.morphTargetDictionary[EXPRESSIONS[key]];
        if (idx !== undefined) mesh.morphTargetInfluences[idx] = weight;
      });

      const jawIdx = mesh.morphTargetDictionary["jawOpen"];
      if (jawIdx !== undefined && agentState === "speaking") {
        const jawBounce = Math.sin(timerRef.current * 12) * 0.1;
        mesh.morphTargetInfluences[jawIdx] = Math.max(
          mesh.morphTargetInfluences[jawIdx],
          jawBounce
        );
      }
    });

    if (scene) {
      // GESTURE ANIMATIONS
      const agentState = convaiClient?.state?.agentState;

      // Base breathing animation (subtle scale pulse)
      const breathingScale = 1 + Math.sin(time * 1.5) * 0.003;
      scene.scale.set(breathingScale, breathingScale, breathingScale);

      // Head nod when listening (gentle up-down)
      const isListening = agentState === 'listening';
      const nodAmount = isListening ? Math.sin(time * 2) * 0.015 : 0;

      // Gentle side-to-side sway when speaking
      const isSpeaking = agentState === 'speaking';
      const speakSway = isSpeaking ? Math.sin(time * 3) * 0.01 : 0;

      // Emotion-based head tilts
      const sadnessTilt = currentEmotionRef.current === "sadness" ? 0.1 : 0;
      const joyTilt = (currentEmotionRef.current === "joy" || currentEmotionRef.current === "happiness") ? -0.05 : 0;
      const angerTilt = currentEmotionRef.current === "anger" ? 0.03 : 0;
      const fearLean = currentEmotionRef.current === "fear" ? -0.02 : 0;
      const surpriseLean = currentEmotionRef.current === "surprise" ? -0.04 : 0;

      // Combine all rotations
      scene.rotation.z = Math.sin(time * 0.5) * 0.02 + sadnessTilt + joyTilt + angerTilt + speakSway;
      scene.rotation.x = nodAmount + fearLean + surpriseLean;

      // Subtle forward lean when engaged
      const engagedLean = (isListening || isSpeaking) ? 0.02 : 0;
      scene.position.z = engagedLean;
    }
  });

  return <primitive object={scene} position={[0, -1.55, 0]} scale={1} />;
}

function OfflineAvatar({ isSpeaking }) {
  const { scene } = useGLTF(AVATAR_URL_OFFLINE);
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
    if (isSpeaking) {
      timerRef.current += delta;
      const speakTime = timerRef.current * 10;

      for (const [i] of VISEME_NAMES.entries()) {
        const wave = Math.sin(speakTime + i * 0.5);
        const targetWeight =
          i >= 10 ? Math.max(0, wave * 0.3) : Math.max(0, wave * 0.15);
        visemeWeightsRef.current[i] +=
          (targetWeight - visemeWeightsRef.current[i]) * 0.15;
      }
    } else {
      timerRef.current = 0;
      for (const [i] of VISEME_NAMES.entries()) {
        visemeWeightsRef.current[i] *= 0.8;
      }
    }

    for (const mesh of [headMeshRef.current, teethMeshRef.current]) {
      if (!mesh?.morphTargetDictionary) continue;
      for (const [i, name] of VISEME_NAMES.entries()) {
        const idx = mesh.morphTargetDictionary[name];
        if (idx !== undefined) {
          mesh.morphTargetInfluences[idx] = visemeWeightsRef.current[i];
        }
      }
    }

    if (scene) {
      scene.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return <primitive object={scene} position={[0, -1.55, 0]} scale={1} />;
}

export function Scene({ convaiClient, emotion, isOfflineMode, isSpeaking, avatarModel }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0.6], fov: 35 }}
      className="!bg-transparent"
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <Suspense fallback={null}>
        {isOfflineMode ? (
          <OfflineAvatar isSpeaking={isSpeaking} />
        ) : (
          <OnlineAvatar convaiClient={convaiClient} emotion={emotion} avatarModel={avatarModel} />
        )}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={0.4}
        maxDistance={1.5}
        target={[0, 0.05, 0]}
      />
    </Canvas>
  );
}
