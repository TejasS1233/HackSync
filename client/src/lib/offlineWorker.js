
import { pipeline, env } from "@xenova/transformers";

// Configurations
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let generator = null;

self.addEventListener("message", async (event) => {
    const { type, payload } = event.data;

    switch (type) {
        case "init":
            await initializeModel(payload);
            break;
        case "generate":
            await generateResponse(payload);
            break;
    }
});

async function initializeModel(config) {
    try {
        self.postMessage({ type: "status", payload: { status: "loading", progress: 0 } });

        generator = await pipeline("text2text-generation", "Xenova/LaMini-Flan-T5-783M", {
            progress_callback: (data) => {
                if (data.status === "progress") {
                    self.postMessage({
                        type: "progress",
                        payload: {
                            progress: Math.round(data.progress || 0),
                            file: data.file,
                            status: data.status
                        }
                    });
                } else if (data.status === "ready") {
                    // handled by pipeline promise completion
                } else {
                    self.postMessage({ type: "progress", payload: data });
                }
            }
        });

        self.postMessage({ type: "status", payload: { status: "ready" } });
    } catch (error) {
        self.postMessage({ type: "error", payload: error.message });
    }
}

async function generateResponse(prompt) {
    if (!generator) {
        self.postMessage({ type: "error", payload: "Model not initialized" });
        return;
    }

    try {
        const formattedPrompt = `Answer the following question concisely: ${prompt}`;
        const output = await generator(formattedPrompt, {
            max_new_tokens: 100,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
        });

        self.postMessage({
            type: "response",
            payload: output[0].generated_text.trim()
        });
    } catch (error) {
        self.postMessage({ type: "error", payload: error.message });
    }
}
