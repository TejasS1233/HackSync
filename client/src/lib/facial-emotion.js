import { pipeline, env, RawImage } from "@xenova/transformers";

// Configuration to ensure models are fetched correctly
env.allowLocalModels = false;
env.remoteHost = "https://huggingface.co/";

class FacialEmotionAnalyzer {
  constructor() {
    this.model = null;
    this.loading = false;
    this.modelName = "Xenova/facial_emotions_image_detection";
    this.emotionMap = {
      happiness: "happy",
      joy: "happy",
      sadness: "sad",
      anger: "angry",
      fear: "fearful",
      surprise: "surprised",
      disgust: "disgusted",
    };
  }

  async load() {
    if (this.model) return;
    if (this.loading) return; // Prevent double loading

    try {
      this.loading = true;
      console.log("Loading facial emotion model...");

      this.model = await pipeline("image-classification", this.modelName);

      console.log("Facial emotion model loaded successfully!");
      this.loading = false;
    } catch (error) {
      console.error("Failed to load facial emotion model:", error);
      this.loading = false;
      throw error;
    }
  }

  async analyze(videoElement, canvasElement) {
    if (!this.model || !videoElement || !canvasElement) return null;

    try {
      // Sync canvas dimensions
      if (canvasElement.width !== videoElement.videoWidth) {
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
      }

      const ctx = canvasElement.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

      const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
      const image = new RawImage(
        new Uint8ClampedArray(imageData.data),
        canvasElement.width,
        canvasElement.height,
        4
      );

      const output = await this.model(image);

      if (output && output.length > 0) {
        const topResult = output[0];
        const CONFIDENCE_THRESHOLD = 0.4;

        // Skip if confidence is below threshold
        if (topResult.score < CONFIDENCE_THRESHOLD) {
          return null;
        }

        const rawLabel = topResult.label.toLowerCase();
        const mappedLabel = this.emotionMap[rawLabel] || rawLabel;

        return {
          emotion: mappedLabel,
          confidence: topResult.score
        };
      }
      return null;

    } catch (error) {
      console.error("Error analyzing face:", error);
      return null;
    }
  }
}

// Singleton instance
export const facialEmotionAnalyzer = new FacialEmotionAnalyzer();
