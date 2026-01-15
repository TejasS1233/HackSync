
import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

// --- Visual: AI Core (Pulse) ---
// Uses concentric circles with varying animation speeds to simulate a "breathing" AI core.
export const VisualCore = ({ className }) => {
  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute w-24 h-24 border border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
      <div className="absolute w-16 h-16 border border-primary/50 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
      <div className="absolute w-8 h-8 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary),0.8)] animate-pulse" />
      {/* Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: '50%',
            left: '50%',
            transform: `rotate(${i * 60}deg) translate(40px)`,
            animation: `orbit 3s linear infinite`,
            opacity: 0.6
          }}
        />
      ))}
      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translate(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(40px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

// --- Visual: Emotion Blob (Morphing Gradient) ---
// A fluid, organic shape that changes color, representing emotional shifts.
export const VisualEmotion = () => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black/5 flex items-center justify-center">
      <div className="relative w-32 h-32">
         {/* Layered blobs with mix-blend-mode for ethereal effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl animate-[morph_8s_ease-in-out_infinite] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-orange-500 rounded-full blur-2xl animate-[morph_8s_ease-in-out_infinite_reverse] opacity-50 mix-blend-screen" 
             style={{ animationDelay: '-4s' }} />
      </div>
      <style>{`
        @keyframes morph {
          0% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; transform: scale(1); }
          50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; transform: scale(1.1); }
          100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// --- Visual: Natural Voice (Waveform) ---
// Simple animated bars to represent voice data.
export const VisualVoice = () => {
    return (
        <div className="w-full h-full flex items-center justify-center gap-1 bg-black/5">
            {[...Array(7)].map((_, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-primary/80 rounded-full"
                    style={{
                        height: '24px',
                        animation: `wave 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
            <style>{`
                @keyframes wave {
                    0%, 100% { height: 16px; opacity: 0.5; }
                    50% { height: 48px; opacity: 1; }
                }
            `}</style>
        </div>
    );
};

// --- Visual: Contextual Memory (Network) ---
// Nodes connecting to each other.
export const VisualMemory = () => {
    return (
        <div className="relative w-full h-full bg-black/5 flex items-center justify-center overflow-hidden">
             {/* Central Node */}
            <div className="absolute w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.6)] z-10" />
            
            {/* Orbiting Nodes */}
            {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute inset-0 animate-[spin_12s_linear_infinite]" style={{ animationDelay: `-${i * 2}s` }}>
                     <div 
                        className="absolute w-2 h-2 bg-primary/60 rounded-full"
                        style={{ 
                            top: '50%', 
                            left: '50%', 
                            transform: `rotate(${i * 72}deg) translate(${30 + (i%2)*20}px)` 
                        }} 
                     />
                     {/* Connecting Line (Simulated via skinny div) */}
                     <div 
                         className="absolute h-[1px] bg-primary/30 origin-left"
                         style={{
                             top: '50%',
                             left: '50%',
                             width: `${30 + (i%2)*20}px`,
                             transform: `rotate(${i * 72}deg)`
                         }}
                     />
                </div>
            ))}
        </div>
    );
};


// --- Visual: Analytics Dashboard (Glass Stack) ---
// Isometric stacked cards.
export const VisualDashboard = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-[1000px] overflow-hidden">
      <div className="relative w-32 h-40 transform rotate-x-[20deg] rotate-y-[-20deg] rotate-z-[10deg] preserve-3d">
         {/* Back Card */}
         <div className="absolute inset-0 bg-slate-800/80 rounded-lg border border-white/10 translate-z-[-20px] scale-95 shadow-xl" />
         {/* Middle Card */}
         <div className="absolute inset-0 bg-slate-700/80 rounded-lg border border-white/10 translate-z-[-10px] scale-[0.98] shadow-xl flex flex-col p-2 gap-2">
             <div className="w-1/2 h-2 bg-white/20 rounded" />
             <div className="w-full h-8 bg-white/10 rounded" />
             <div className="w-full h-8 bg-white/10 rounded" />
         </div>
         {/* Front Card */}
         <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-lg border border-primary/30 shadow-2xl flex flex-col p-3 gap-2 translate-z-[10px]">
             <div className="flex justify-between items-center mb-1">
                 <div className="w-8 h-2 bg-white/40 rounded" />
                 <div className="w-2 h-2 bg-green-500 rounded-full" />
             </div>
             <div className="w-full h-16 bg-gradient-to-br from-primary/20 to-transparent rounded border border-white/5 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-primary/20 skew-y-6" />
             </div>
             <div className="w-3/4 h-2 bg-white/20 rounded mt-auto" />
         </div>
      </div>
    </div>
  );
};


export const VisualAvatarCustom = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black/5">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-[spin_20s_linear_infinite]" />
               <div className="absolute inset-2 border-2 border-primary/20 rounded-full" />
               <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-16 bg-gradient-to-b from-primary/80 to-primary/20 rounded-full mask-image-gradient" 
                        style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}/>
               </div>
            </div>
        </div>
    )
}

export const VisualOffline = () => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-black/5">
             <div className="flex gap-2">
                 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                 <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
             </div>
        </div>
    )
}

// Map for dynamic selection based on Feature ID
export const FEATURE_VISUAL_MAP = {
    'emotion-detection': VisualEmotion,
    'voice-synthesis': VisualVoice,
    'avatar-customization': VisualAvatarCustom,
    'analytics-dashboard': VisualDashboard,
    'offline-mode': VisualOffline
};
