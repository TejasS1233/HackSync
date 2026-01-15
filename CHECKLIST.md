# Project MIRAGE - Checklist

## Overview

MIRAGE advances human–AI interaction through lifelike, expressive AI avatars that listen, reason, speak, and visually react in an emotionally engaging manner.

**Use Cases:** Teachers, assistants, customer service agents, companions.

---

## Required Features

- [ ] **Multimodal Input** — Accept user input via text, speech, or both
- [ ] **Intelligent Response** — Generate responses using LLM, RAG, or rule-based approaches
- [ ] **Voice Synthesis** — Convert AI responses to audio via TTS or synthesized voice
- [ ] **Visual Avatar** — Display avatar with facial expressions and motion *(no gestures)*
- [ ] **Real-time Response** — Maintain smooth conversational flow without delays

---

## Bonus Features

- [ ] **Emotion Mapping** — Detect user sentiment and adjust avatar's tone and expressions *(facial + text emotion detection active)*
- [ ] **Personalized Memory** — Retain context and preferences across sessions

---

## Doable Features

> **Tech Stack:** Convai (avatar + TTS + lip-sync), React, shadcn/ui, PWA

### 🟢 Easy

- [ ] **Interruption Response** — Avatar closes mouth and widens eyes when user speaks (surprise/attention)
- [ ] **Real-Time Sentiment HUD** — Semi-transparent display showing User Sentiment + AI State graphs
- [ ] **God Mode (Dev Toggle)** — Reveals live latency, raw prompts, and token usage *(pinned to right side)*

### 🟡 Medium

- [ ] **Active Listening (Backchanneling)** — Avatar nods, tilts head in real-time as user speaks *(requires custom animation mapping)*
- [ ] **Storage + Context-Based Response** — Persist conversation history across sessions
- [ ] **Post-Interaction Report Card** — Summary card with topics, mood, and action items
- [ ] **Contextual Tone Shift** — Avatar can whisper or shout based on LLM's dramatic tags
- [ ] **The Reflection (User Analytics Dashboard)** — Vocabulary heatmap, sentiment trends, clarity score

### 🔴 Hard

- [ ] **Volume/Pitch Mirroring** — TTS matches user's whisper/shout volume
- [ ] **Dynamic Environment** — Background changes based on conversation topic
- [ ] **Avatar Mirroring (Psychological Sync)** — Avatar matches user's pitch/speed for rapport
- [ ] **The Echo Gallery (Community Showcase)** — Grid of top interactions + shareable avatar presets

---

## Offline Fallback (PWA-Only)

> No Convai required. Fully client-side with cached models.

### Components

- [ ] **STT** — Vosk WASM (~50MB)
- [ ] **TTS** — Web Speech API / Piper WASM
- [ ] **Avatar** — Three.js + Ready Player Me GLB (~5-15MB)
- [ ] **LLM** — SmolLM / TinyLlama / Qwen via Transformers.js

### Configurations

- [ ] **Minimum Viable** — SmolLM-360M + Vosk + Web Speech API (~250MB)
- [ ] **Best Balance** — TinyLlama-1.1B + Vosk + Piper (~750MB)
- [ ] **Best Quality** — Llama-3.2-1B + Vosk + Piper (~850MB, WebGPU)

### Limitations (Acknowledged)

- [ ] No Convai emotion detection (build custom or skip)
- [ ] No managed avatar expressions (manual morph target control)
- [ ] WebGPU required for best LLMs
- [ ] Large initial download (cache with Service Worker)
