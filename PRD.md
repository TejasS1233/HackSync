# Project MIRAGE - Product Requirements Document

## Overview

MIRAGE advances human–AI interaction through lifelike, expressive AI avatars that listen, reason, speak, and visually react in an emotionally engaging manner. The focus is on synchronized multimodal interaction—where speech, facial animation, and expressive feedback align naturally with AI reasoning.

**Use Cases:** Teachers, assistants, customer service agents, companions.

## Required Features

| Feature | Description |
|---------|-------------|
| **Multimodal Input** | Accept user input via text, speech, or both |
| **Intelligent Response** | Generate responses using LLM, RAG, or rule-based approaches |
| **Voice Synthesis** | Convert AI responses to audio via TTS or synthesized voice |
| **Visual Avatar** | Display avatar with facial expressions, motion, and gestures |
| **Real-time Response** | Maintain smooth conversational flow without delays |

## Bonus Features

- **Emotion Mapping** — Detect user sentiment and adjust avatar's tone, expressions, and gestures accordingly
- **Personalized Memory** — Retain context and preferences across sessions for personalized interactions

## Doable / Miscellaneous Features

> **Tech Stack:** Convai (avatar + TTS + lip-sync), React, shadcn/ui, PWA

### 🟢 Easy

| Feature | Description | Implementation Notes |
|---------|-------------|---------------------|
| **Interruption Response** | The moment the user speaks (VAD trigger), the avatar immediately closes its mouth and widens its eyes (surprise/attention), mimicking a human being interrupted | ✅ **Convai native:** Voice interruption supported. Hook `client.on('userTranscriptionChange')` → trigger expression change via `enableFacialData: true` |
| **Real-Time Sentiment HUD** | A sleek, semi-transparent Heads-Up Display next to the avatar showing real-time graphs: **User Sentiment** (e.g., "70% Happy, 30% Confused") and **AI State** (e.g., "Listening," "Reasoning," "Generating Empathy") | ✅ **Convai native:** Emits `bot-emotion` message type + `character_emotions` in responses. Pipe to shadcn `<Chart />`. Pure frontend work |
| **God Mode (Dev Toggle)** | A toggle switch labeled "Dev Mode" that reveals: **Live Latency** (STT → LLM → TTS timing), **Raw Prompts** (actual text + system instructions sent to LLM), **Token Usage** (counter for session tokens). Shows confidence in your system and makes architecture demos easy for judges | shadcn `<Switch />` + `<Card />` overlay. Track timestamps at each pipeline stage, store prompts in state. Pure React state + UI |

### 🟡 Medium

| Feature | Description | Implementation Notes |
|---------|-------------|---------------------|
| **Active Listening (Backchanneling)** | Avatar nods, tilts head, or shows confusion in real-time as the user speaks, driven by real-time sentiment analysis of the incoming audio stream | ⚠️ **Partial Convai:** No native backchanneling. Use `userTranscriptionChange` event → manually trigger avatar animations via animation controller. Requires custom animation mapping |
| **Storage + Context-Based Response** | Persist conversation history and user preferences to provide contextually relevant responses across sessions | ✅ **Convai native:** Long-Term Memory built-in (`memory_settings.enabled: true`). Chat History API retrieves past sessions. Add IndexedDB for PWA offline fallback |
| **Post-Interaction Report Card** | On "End Session," generate a summary card showing: **Topics Discussed** (e.g., "Space, Python, Coffee"), **Dominant Mood** (e.g., "Curious"), **Action Items** (promises/suggestions from AI). Turns the conversation into a tangible takeaway | ✅ **Convai native:** Use Chat History API for transcript. Single LLM call for summarization. Dominant mood = aggregate `bot-emotion` data. Render with shadcn `<Card />` |
| **Contextual Tone Shift** | Dynamic switching where the same avatar can whisper a secret or shout a warning within the same conversation based on the LLM's dramatic tags | ⚠️ **Partial Convai:** No native tone tags. Parse LLM output for markers → dynamically switch between voice presets (large voice library: ElevenLabs, Azure, etc.) + adjust facial expression intensity (-1 to 1 slider) |
| **The Reflection (User Analytics Dashboard)** | A separate dashboard page exposing AI analysis back to the user as a **communication coaching tool**: **Vocabulary Heatmap** (overused words), **Sentiment Trends** (mood over time, e.g., "20% more stressed on Mondays"), **Clarity Score** (speech articulation quality). Shifts focus from "AI is smart" → "AI helps me get smarter" | ⚠️ **Partial Convai:** Use Chat History API + `bot-emotion` data for historical sentiment. Vocabulary analysis = word frequency on transcripts (custom JS). Clarity score = filler word ratio + sentence completeness. Store in IndexedDB for PWA. Render with shadcn charts (`<LineChart />`, heatmap via CSS grid) |

### 🔴 Hard

| Feature | Description | Implementation Notes |
|---------|-------------|---------------------|
| **Volume/Pitch Mirroring** | Analyze the user's volume and pitch. If the user whispers, the TTS output is tagged with `<style="whisper">`. If the user shouts, the avatar adopts a calming, firmer tone | ❌ **Custom only:** Web Audio API for pitch/volume analysis → select different Convai voice presets dynamically. No native whisper/shout styles—requires voice switching logic |
| **Dynamic Environment** | Since a "Mirage" changes based on perspective, the environment around the avatar should change based on the conversation topic | ❌ **Custom only:** Topic classification (NLP) → map to environment presets (Three.js backgrounds or CSS/canvas effects). Fully outside Convai scope |
| **Avatar Mirroring (Psychological Sync)** | Analyze the user's voice pitch/speed (audio prosody) to build rapport. If the user is excited/fast → quicker gestures, wider eyes, faster TTS rate. If the user is sad/slow → avatar slows down, softens face, uses smaller gestures | ❌ **Custom only:** Real-time prosody analysis (pitch, tempo, energy via Web Audio API or ML model) → map to Convai's facial expression intensity + animation triggers. Heavy custom integration |
| **The Echo Gallery (Community Showcase)** | A grid-layout page showing **Top Interactions** and **Featured Avatars**. Users can submit clips of funny/smart AI moments + share custom avatar presets (e.g., "Cyberpunk Detective," "Victorian Teacher") that others can "Clone" to their account. Creates community + proves system versatility | ❌ **Custom only:** Requires backend for user submissions (Supabase/Firebase), video clip storage (S3/Cloudflare R2), moderation system, avatar preset JSON schema. Clone = duplicate Convai character config via Character API. Grid UI with shadcn + video player. Significant infrastructure work |

---

## Offline Fallback (PWA-Only)

> **No Convai required.** Fully client-side with cached models. Graceful degradation when offline.

### Tech Stack

| Component | Technology | Size | Notes |
|-----------|------------|------|-------|
| **STT** | Vosk WASM | ~50MB | Runs fully client-side, good accuracy |
| **TTS** | Web Speech API / Piper WASM | 0 / ~30-100MB | Web Speech is free but limited voices; Piper has better quality |
| **Avatar** | Three.js + Ready Player Me GLB | ~5-15MB | Cache avatar model, custom lip-sync via morph targets |

### LLM Options (Browser-Compatible)

| Model | Size (Q4) | Library | Runs On | Quality |
|-------|-----------|---------|---------|---------|
| **SmolLM-135M** | ~70MB | Transformers.js | CPU ✅ | ⭐ Basic |
| **SmolLM-360M** | ~200MB | Transformers.js | CPU ✅ | ⭐⭐ Okay |
| **Qwen2-0.5B** | ~300MB | Transformers.js / WebLLM | CPU ✅ | ⭐⭐ Okay |
| **TinyLlama-1.1B** | ~600MB | Transformers.js / WebLLM | CPU ✅ | ⭐⭐⭐ Decent |
| **SmolLM-1.7B** | ~1GB | Transformers.js | CPU ✅ | ⭐⭐⭐ Decent |
| **Llama-3.2-1B** | ~700MB | WebLLM | WebGPU ⚠️ | ⭐⭐⭐⭐ Good |
| **Phi-3-mini-4B** | ~2.2GB | WebLLM | WebGPU ⚠️ | ⭐⭐⭐⭐⭐ Great |

### Recommended Config

| Priority | Model | Total Download | Target Device |
|----------|-------|----------------|---------------|
| **Minimum Viable** | SmolLM-360M + Vosk + Web Speech API | ~250MB | Low-end laptops, tablets |
| **Best Balance** | TinyLlama-1.1B + Vosk + Piper | ~750MB | Mid-range devices |
| **Best Quality** | Llama-3.2-1B + Vosk + Piper | ~850MB | WebGPU-enabled browsers |

### Limitations

- ❌ No Convai emotion detection (build custom or skip)
- ❌ No managed avatar expressions (manual morph target control)
- ⚠️ WebGPU required for best LLMs (no iOS Safari, older browsers)
- ⚠️ Large initial download (cache with Service Worker)
