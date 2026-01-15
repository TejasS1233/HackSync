import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const avatarStyles = [
  {
    id: "realistic",
    label: "Realistic",
    description: "Lifelike human appearance",
    icon: User,
  },
  {
    id: "animated",
    label: "Animated",
    description: "Stylized cartoon look",
    icon: Wand2,
  },
];

const modelTypes = [
  {
    id: "therapist",
    name: "Therapist",
    description: "Empathetic support for mental wellness and emotional guidance",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    shadowColor: "shadow-rose-500/25",
    badge: "Supportive",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    characterId: "a0c12d8e-f20c-11f0-b456-42010a7be027",
    avatarModel: "/Therapy_Female.glb",
  },
  {
    id: "friend",
    name: "AI Friend",
    description: "Casual conversations and friendly companionship",
    icon: Users,
    color: "from-sky-500 to-blue-500",
    shadowColor: "shadow-sky-500/25",
    badge: "Friendly",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    characterId: "44294a2c-f1e7-11f0-9d2e-42010a7be027",
    avatarModel: "/avatar.glb",
  },
  {
    id: "tutor",
    name: "AI Tutor",
    description: "Patient teaching and adaptive learning assistance",
    icon: GraduationCap,
    color: "from-emerald-500 to-green-500",
    shadowColor: "shadow-emerald-500/25",
    badge: "Educational",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    characterId: "961589ec-f20d-11f0-a4e3-42010a7be027",
    avatarModel: "/Tutor_Female.glb",
  },
  {
    id: "interviewer",
    name: "AI Interviewer",
    description: "Professional interview practice and feedback",
    icon: Briefcase,
    color: "from-violet-500 to-purple-500",
    shadowColor: "shadow-violet-500/25",
    badge: "Professional",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    characterId: "44294a2c-f1e7-11f0-9d2e-42010a7be027",
    avatarModel: "/avatar.glb",
  },
];

const genderOptions = [
  {
    id: "male",
    label: "Male Voice",
    description: "Deep and calm tone",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "female",
    label: "Female Voice",
    description: "Warm and gentle tone",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "neutral",
    label: "Neutral Voice",
    description: "Balanced and clear tone",
    gradient: "from-slate-500 to-zinc-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export default function ChatSelection({ onStartChat }) {
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId);
    setDirection(1);
    setTimeout(() => setStep(2), 50);
  };

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setDirection(1);
    setTimeout(() => setStep(3), 50);
  };

  const handleBack = () => {
    setDirection(-1);
    setTimeout(() => setStep(step - 1), 50);
  };

  const handleGenderSelect = (genderId) => {
    setSelectedGender(genderId);
  };

  const handleStartChat = () => {
    if (onStartChat && selectedModelData) {
      onStartChat({
        style: selectedStyle,
        model: selectedModel,
        modelName: selectedModelData.name,
        characterId: selectedModelData.characterId,
        avatarModel: selectedModelData.avatarModel,
        gender: selectedGender,
      });
    }
  };

  const canStart = selectedModel && selectedGender;
  const selectedModelData = modelTypes.find((m) => m.id === selectedModel);
  const selectedStyleData = avatarStyles.find((s) => s.id === selectedStyle);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 md:p-6 overflow-auto">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative w-full max-w-4xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Sparkles className="size-4" />
            New Conversation
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            {step === 1 ? "Choose Avatar Style" : step === 2 ? "Choose Your Companion" : "Select Voice Style"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {step === 1
              ? "Pick between a realistic or animated avatar"
              : step === 2
                ? "Pick an AI personality that matches your needs"
                : "Choose how your AI companion will sound"}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-3"
        >
          <motion.div
            layout
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              step >= 1
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground"
            )}
          >
            <motion.div
              initial={false}
              animate={{ rotate: step > 1 ? 0 : 360 }}
              transition={{ duration: 0.3 }}
            >
              {step > 1 ? <Check className="size-4" /> : <span className="size-4 flex items-center justify-center">1</span>}
            </motion.div>
            <span className="hidden sm:inline">Style</span>
          </motion.div>

          <motion.div
            className="h-0.5 w-8 rounded-full bg-border overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: step >= 2 ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.div>

          <motion.div
            layout
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              step >= 2
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground"
            )}
          >
            <motion.div
              initial={false}
              animate={{ rotate: step > 2 ? 0 : 360 }}
              transition={{ duration: 0.3 }}
            >
              {step > 2 ? <Check className="size-4" /> : <span className="size-4 flex items-center justify-center">2</span>}
            </motion.div>
            <span className="hidden sm:inline">Companion</span>
          </motion.div>

          <motion.div
            className="h-0.5 w-8 rounded-full bg-border overflow-hidden"
          >
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: step >= 3 ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </motion.div>

          <motion.div
            layout
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
              step >= 3
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className="size-4 flex items-center justify-center">3</span>
            <span className="hidden sm:inline">Voice</span>
          </motion.div>
        </motion.div>

        {/* Content Area */}
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0"
              >
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2 max-w-xl mx-auto"
                >
                  {avatarStyles.map((style) => {
                    const Icon = style.icon;
                    const isSelected = selectedStyle === style.id;
                    return (
                      <motion.div
                        key={style.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleStyleSelect(style.id)}
                          className={cn(
                            "relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6 cursor-pointer transition-all duration-300",
                            isSelected && "ring-2 ring-primary shadow-lg shadow-primary/20"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                {style.id === "realistic" ? "Human-like" : "Stylized"}
                              </p>
                              <p className="font-mono text-3xl font-bold tracking-tighter">
                                {style.label}
                              </p>
                            </div>
                            <Icon className="size-5 text-muted-foreground" />
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            {style.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 space-y-4"
              >
                {/* Selected Style Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedStyleData && (
                        <>
                          <selectedStyleData.icon className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-sm">{selectedStyleData.label} Avatar</p>
                            <p className="text-xs text-muted-foreground">{selectedStyleData.description}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="shrink-0 gap-1"
                    >
                      <ArrowLeft className="size-4" />
                      <span className="hidden sm:inline">Change</span>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-2"
                >
                  {modelTypes.map((model) => {
                    const Icon = model.icon;
                    const isSelected = selectedModel === model.id;
                    return (
                      <motion.div
                        key={model.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleModelSelect(model.id)}
                          className={cn(
                            "relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6 cursor-pointer transition-all duration-300",
                            isSelected && "ring-2 ring-primary shadow-lg shadow-primary/20"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                {model.badge}
                              </p>
                              <p className="font-mono text-2xl font-bold tracking-tighter">
                                {model.name}
                              </p>
                            </div>
                            <Icon className="size-5 text-muted-foreground" />
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            {model.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 space-y-4"
              >
                {/* Selected Model Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedModelData && (
                        <>
                          <selectedModelData.icon className="size-5 text-muted-foreground" />
                          <div>
                            <p className="font-semibold text-sm">{selectedModelData.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedModelData.description}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="shrink-0 gap-1"
                    >
                      <ArrowLeft className="size-4" />
                      <span className="hidden sm:inline">Change</span>
                    </Button>
                  </div>
                </motion.div>

                {/* Gender Selection */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-4 sm:grid-cols-3"
                >
                  {genderOptions.map((option) => {
                    const isSelected = selectedGender === option.id;
                    return (
                      <motion.div
                        key={option.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div
                          onClick={() => handleGenderSelect(option.id)}
                          className={cn(
                            "relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-primary/10 p-6 cursor-pointer transition-all duration-300",
                            isSelected && "ring-2 ring-primary shadow-lg shadow-primary/20"
                          )}
                        >
                          <div className="flex flex-col items-center text-center gap-3">
                            <div className="flex items-start justify-between w-full">
                              <div className="space-y-1 text-left">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Voice
                                </p>
                                <p className="font-mono text-xl font-bold tracking-tighter">
                                  {option.label.replace(" Voice", "")}
                                </p>
                              </div>
                              {isSelected && <Check className="size-5 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground w-full text-left">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Start Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center pt-2"
                >
                  <motion.div
                    whileHover={canStart ? { scale: 1.02 } : {}}
                    whileTap={canStart ? { scale: 0.98 } : {}}
                  >
                    <Button
                      size="lg"
                      disabled={!canStart}
                      onClick={handleStartChat}
                      className={cn(
                        "gap-2 px-6 py-5 text-sm font-semibold rounded-xl transition-all duration-300",
                        canStart
                          ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                          : "opacity-50"
                      )}
                    >
                      Start Conversation
                      <motion.div
                        animate={canStart ? { x: [0, 4, 0] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <ArrowRight className="size-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
