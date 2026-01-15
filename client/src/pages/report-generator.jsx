import jsPDF from "jspdf";

export class ReportGenerator {
  constructor() {
    this.pdf = null;
  }

  // Analyze conversation data
  analyzeConversation(messages) {
    const userMessages = messages.filter(
      (msg) => msg.type === "user-llm-text" || msg.type === "user-transcription"
    );
    const botMessages = messages.filter((msg) => msg.type === "bot-llm-text");

    // Extract topics from messages
    const topics = this.extractTopics([...userMessages, ...botMessages]);

    // Determine dominant mood
    const dominantMood = this.analyzeMood(botMessages);

    // Extract action items
    const actionItems = this.extractActionItems(botMessages);

    return {
      topics,
      dominantMood,
      actionItems,
      messageCount: userMessages.length + botMessages.length,
      duration: this.estimateDuration(messages),
      timestamp: new Date().toLocaleString(),
      userMessages: userMessages.length,
      botMessages: botMessages.length,
    };
  }

  extractTopics(messages) {
    const topicKeywords = {
      Programming: [
        "code",
        "programming",
        "javascript",
        "python",
        "react",
        "api",
        "function",
        "variable",
      ],
      Technology: [
        "computer",
        "software",
        "hardware",
        "internet",
        "ai",
        "machine learning",
        "data",
      ],
      Science: [
        "physics",
        "chemistry",
        "biology",
        "space",
        "universe",
        "research",
        "experiment",
      ],
      Business: [
        "company",
        "work",
        "job",
        "career",
        "money",
        "startup",
        "project",
      ],
      Personal: [
        "life",
        "family",
        "friend",
        "relationship",
        "feeling",
        "emotion",
        "help",
      ],
      Creative: [
        "art",
        "music",
        "design",
        "writing",
        "creative",
        "idea",
        "inspiration",
      ],
      Education: [
        "learn",
        "study",
        "school",
        "course",
        "knowledge",
        "skill",
        "teach",
      ],
      Health: [
        "health",
        "fitness",
        "exercise",
        "diet",
        "medical",
        "wellness",
        "mental",
      ],
    };

    const foundTopics = new Set();
    const allText = messages
      .map((msg) => msg.content || "")
      .join(" ")
      .toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        foundTopics.add(topic);
      }
    });

    return Array.from(foundTopics).slice(0, 5); // Limit to 5 topics
  }

  analyzeMood(botMessages) {
    const moodKeywords = {
      Curious: [
        "interesting",
        "curious",
        "wonder",
        "explore",
        "learn",
        "discover",
      ],
      Helpful: ["help", "assist", "support", "guide", "advice", "solution"],
      Enthusiastic: [
        "excited",
        "amazing",
        "fantastic",
        "awesome",
        "great",
        "wonderful",
      ],
      Professional: [
        "recommend",
        "suggest",
        "consider",
        "important",
        "best practice",
      ],
      Empathetic: ["understand", "feel", "sorry", "concerned", "support"],
      Informative: [
        "fact",
        "information",
        "data",
        "research",
        "evidence",
        "study",
      ],
    };

    const allText = botMessages
      .map((msg) => msg.content || "")
      .join(" ")
      .toLowerCase();
    let maxScore = 0;
    let dominantMood = "Neutral";

    Object.entries(moodKeywords).forEach(([mood, keywords]) => {
      const score = keywords.reduce(
        (count, keyword) => count + (allText.split(keyword).length - 1),
        0
      );
      if (score > maxScore) {
        maxScore = score;
        dominantMood = mood;
      }
    });

    return dominantMood;
  }

  extractActionItems(botMessages) {
    const actionPatterns = [
      /you should/i,
      /try to/i,
      /consider/i,
      /recommend/i,
      /suggest/i,
      /check out/i,
      /look at/i,
      /visit/i,
      /read about/i,
      /learn more/i,
    ];

    const actions = [];
    botMessages.forEach((msg) => {
      const content = msg.content || "";
      const sentences = content
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 10);

      sentences.forEach((sentence) => {
        if (actionPatterns.some((pattern) => pattern.test(sentence))) {
          actions.push(sentence.trim());
        }
      });
    });

    return actions.slice(0, 3); // Limit to 3 action items
  }

  estimateDuration(messages) {
    if (messages.length === 0) return "0 min";

    // Rough estimation: assume 2 minutes per 10 messages
    const estimatedMinutes = Math.max(1, Math.ceil(messages.length / 5));

    return `${estimatedMinutes} min`;
  }

  generatePDF(analysis) {
    this.pdf = new jsPDF();

    // Set up fonts and colors
    this.pdf.setFont("helvetica");

    // Header
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text("Session Report", 20, 30);

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(`Generated on: ${analysis.timestamp}`, 20, 45);

    let yPosition = 65;

    // Session Overview
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text("Session Overview", 20, yPosition);
    yPosition += 15;

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text(`Total Messages: ${analysis.messageCount}`, 25, yPosition);
    yPosition += 8;
    this.pdf.text(`Your Messages: ${analysis.userMessages}`, 25, yPosition);
    yPosition += 8;
    this.pdf.text(`AI Responses: ${analysis.botMessages}`, 25, yPosition);
    yPosition += 8;
    this.pdf.text(`Estimated Duration: ${analysis.duration}`, 25, yPosition);
    yPosition += 20;

    // Topics Discussed
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text("Topics Discussed", 20, yPosition);
    yPosition += 15;

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(60, 60, 60);
    if (analysis.topics.length > 0) {
      analysis.topics.forEach((topic, index) => {
        this.pdf.text(`• ${topic}`, 25, yPosition);
        yPosition += 8;
      });
    } else {
      this.pdf.text("No specific topics identified", 25, yPosition);
      yPosition += 8;
    }
    yPosition += 10;

    // Dominant Mood
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text("Dominant Mood", 20, yPosition);
    yPosition += 15;

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(60, 60, 60);
    this.pdf.text(analysis.dominantMood, 25, yPosition);
    yPosition += 20;

    // Action Items
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(40, 40, 40);
    this.pdf.text("Action Items", 20, yPosition);
    yPosition += 15;

    this.pdf.setFontSize(12);
    this.pdf.setTextColor(60, 60, 60);
    if (analysis.actionItems.length > 0) {
      analysis.actionItems.forEach((item, index) => {
        // Split long action items into multiple lines
        const lines = this.pdf.splitTextToSize(item, 160);
        lines.forEach((line, lineIndex) => {
          this.pdf.text(
            lineIndex === 0 ? `• ${line}` : `  ${line}`,
            25,
            yPosition
          );
          yPosition += 8;
        });
        yPosition += 2; // Extra space between items
      });
    } else {
      this.pdf.text("No specific action items identified", 25, yPosition);
      yPosition += 8;
    }

    // Footer
    const pageHeight = this.pdf.internal.pageSize.height;
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(150, 150, 150);
    this.pdf.text("Generated by HackSync AI Assistant", 20, pageHeight - 20);

    return this.pdf;
  }

  downloadPDF(filename = "session-report.pdf") {
    if (this.pdf) {
      this.pdf.save(filename);
    }
  }

  // Main method to generate and download report
  generateAndDownloadReport(messages, filename = "session-report.pdf") {
    const analysis = this.analyzeConversation(messages);
    this.generatePDF(analysis);
    this.downloadPDF(filename);
    return analysis;
  }
}

export default ReportGenerator;
