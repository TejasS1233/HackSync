/**
 * Exports chat messages to various formats.
 */

export function exportAsText(messages, sessionData) {
  const header = `Mirage Conversation Export
Date: ${new Date().toLocaleString()}
Duration: ${sessionData?.duration || "N/A"}
Emotion: ${sessionData?.emotions?.[0] || "N/A"}
${"=".repeat(50)}

`;

  const content = messages
    .map((msg) => {
      // Determine role label
      const role =
        msg.type === "bot-llm-text" || msg.role === "assistant" || msg.role === "model" ? "AI" : "You";
      
      // Clean content
      const cleanContent = msg.content?.trim() || "";
      if (!cleanContent) return null;

      return `[${role}]: ${cleanContent}`;
    })
    .filter(Boolean) 
    .join("\n\n");

  const footer = `

${"=".repeat(50)}
End of conversation
`;

  return header + content + footer;
}

export function exportAsJSON(messages, sessionData) {
  return JSON.stringify(
    {
      meta: {
        exportDate: new Date().toISOString(),
        ...sessionData,
      },
      messages: messages.map((msg) => ({
        role:
          msg.type === "bot-llm-text" || msg.role === "assistant" || msg.role === "model"
            ? "assistant"
            : "user",
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString(),
        type: msg.type || "text",
      })),
    },
    null,
    2
  );
}

export function downloadFile(content, filename, mimeType) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportConversation(
  messages,
  sessionData,
  format = "txt",
  onProgress = null
) {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const filenameBase = `mirage-chat-${timestamp}`;

  try {
    switch (format) {
      case "txt":
        const textContent = exportAsText(messages, sessionData);
        downloadFile(
          textContent,
          `${filenameBase}.txt`,
          "text/plain"
        );
        break;

      case "json":
        const jsonContent = exportAsJSON(messages, sessionData);
        downloadFile(
          jsonContent,
          `${filenameBase}.json`,
          "application/json"
        );
        break;

      case "mp3":
        if (onProgress) onProgress(0);
        try {
             // Note: This relies on browser specific capability to capture synth, which is often blocked.
             // We attempt the user's suggested implementation.
            const audioBlob = await exportAsMP3(messages, sessionData, onProgress);
            downloadFile(
              audioBlob,
              `${filenameBase}.webm`, // MediaRecorder usually outputs webm/opus
              "audio/webm"
            );
        } catch (e) {
            console.error("MP3 Export error", e);
            alert("Audio export failed. Your browser may not support capturing text-to-speech audio.");
        }
        if (onProgress) onProgress(100);
        break;

      default:
        console.error("Unsupported export format:", format);
        throw new Error(`Format ${format} not supported`);
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}

export async function exportAsMP3(messages, sessionData, onProgress) {
  try {
    // Check if browser supports Web Speech API
    if (!window.speechSynthesis) {
      throw new Error("Text-to-speech is not supported in this browser");
    }

    // Create audio context for recording
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    
    // NOTE: Standard SpeechSynthesis CANNOT be routed to AudioContext in most browsers.
    // This code attempts it but may result in silent files depending on browser implementation.
    // Ideally we would use a server-side TTS or a library that generates audio buffers.
    
    // Setup MediaRecorder
    const mediaRecorder = new MediaRecorder(destination.stream, {
      mimeType: "audio/webm;codecs=opus",
    });

    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    // Start recording
    mediaRecorder.start();

    // Speak each message
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role =
        msg.type === "bot-llm-text" || msg.role === "assistant" || msg.role === "model" ? "AI" : "You";
      
      // Skip empty or system messages if needed, but keeping simple for now
      if (!msg.content) continue;

      const text = `${role} said: ${msg.content}`;

      await speakText(text, role === "AI");

      if (onProgress) {
        onProgress(Math.round(((i + 1) / messages.length) * 100));
      }

      // Small pause between messages
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Stop recording
    mediaRecorder.stop();

    return new Promise((resolve, reject) => {
      mediaRecorder.onstop = async () => {
        try {
          // Create blob from chunks
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };
    });
  } catch (error) {
    console.error("Error exporting as MP3:", error);
    throw error;
  }
}

function speakText(text, isAI) {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Different voices for user vs AI
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Simple voice selection: first voice for AI (usually robotic/default), second for User (if available)
      utterance.voice = isAI ? voices[0] : voices[1] || voices[0];
    }

    utterance.rate = 1.0;
    utterance.pitch = isAI ? 1.0 : 1.1; // Slight pitch diff
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    window.speechSynthesis.speak(utterance);
  });
}
