// @/lib/emotionClassifier.js
import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

const classifierConfig = {
    task: "text-classification",
    model: "Cohee/roberta-base-go_emotions-onnx",
};

let classifierPromise = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

async function getClassifier() {
    if (!classifierPromise) {
        try {
            loadAttempts++;
            console.log(`Loading emotion classifier (attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS})...`);
            
            classifierPromise = pipeline(classifierConfig.task, classifierConfig.model);
            await classifierPromise;
            
            console.log("Emotion classifier loaded successfully");
            loadAttempts = 0;
        } catch (error) {
            console.error("Failed to load emotion classifier:", error);
            classifierPromise = null;
            
            if (loadAttempts < MAX_LOAD_ATTEMPTS) {
                console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                return getClassifier();
            }
            
            throw new Error(`Failed to load emotion classifier after ${MAX_LOAD_ATTEMPTS} attempts: ${error.message}`);
        }
    }
    return classifierPromise;
}

const labelMap = {
    admiration: "happy",
    amusement: "happy",
    joy: "happy",
    love: "happy",
    excitement: "happy",
    gratitude: "happy",
    optimism: "happy",
    pride: "happy",
    relief: "happy",
    caring: "happy",
    desire: "happy",
    approval: "happy",
    sadness: "sad",
    grief: "sad",
    disappointment: "sad",
    remorse: "sad",
    anger: "angry",
    annoyance: "angry",
    disapproval: "angry",
    disgust: "angry",
    fear: "fearful",
    nervousness: "fearful",
    embarrassment: "fearful",
    surprise: "surprised",
    realization: "surprised",
    curiosity: "surprised",
    confusion: "neutral",
    neutral: "neutral",
};

export async function classifyEmotion(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
        console.warn("classifyEmotion: Invalid or empty text input");
        return "neutral";
    }

    try {
        const model = await getClassifier();
        const results = await model(text.trim(), { topk: 1 });
        
        if (!results || results.length === 0) {
            console.warn("classifyEmotion: No results returned from model");
            return "neutral";
        }
        
        const result = results[0];
        const mappedEmotion = labelMap[result.label] ?? "neutral";
        
        console.log("classifyEmotion result:", {
            text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
            label: result.label,
            score: result.score.toFixed(4),
            mappedEmotion
        });
        
        return mappedEmotion;
    } catch (error) {
        console.error("classifyEmotion error:", error);
        return "neutral";
    }
}

export async function getEmotionScores(text) {
    if (!text || typeof text !== 'string' || !text.trim()) {
        console.warn("getEmotionScores: Invalid or empty text input");
        return {};
    }

    try {
        const model = await getClassifier();
        const results = await model(text.trim(), { topk: null });

        if (!results || results.length === 0) {
            console.warn("getEmotionScores: No results returned from model");
            return {};
        }

        const scores = {
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            surprised: 0,
            neutral: 0,
        };

        for (const result of results) {
            const mappedLabel = labelMap[result.label];
            if (mappedLabel && scores.hasOwnProperty(mappedLabel)) {
                scores[mappedLabel] += result.score;
            }
        }

        const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
        if (total > 0) {
            for (const key in scores) {
                scores[key] = scores[key] / total;
            }
        }

        console.log("getEmotionScores result:", {
            text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
            scores: Object.fromEntries(
                Object.entries(scores).map(([k, v]) => [k, v.toFixed(4)])
            ),
            dominant: Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        });

        return scores;
    } catch (error) {
        console.error("getEmotionScores error:", error);
        return {};
    }
}

export async function preloadClassifier() {
    try {
        await getClassifier();
        return true;
    } catch (error) {
        console.error("Failed to preload classifier:", error);
        return false;
    }
}

export function resetClassifier() {
    classifierPromise = null;
    loadAttempts = 0;
    console.log("Emotion classifier reset");
}