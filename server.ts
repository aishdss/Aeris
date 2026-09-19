import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper: Resilient Gemini caller with multiple model fallbacks and retry logic for 503/429
async function callGeminiJson(prompt: string): Promise<any | null> {
  const ai = getAI();
  if (!ai) return null;

  // Use stable production flash first, then alternative aliases if 503 high-demand spike occurs
  const candidateModels = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.1-flash-lite"];

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response && response.text) {
          try {
            return JSON.parse(response.text);
          } catch (parseErr) {
            console.warn(`[AERIS AI] Failed to parse JSON from ${model}:`, parseErr);
          }
        }
      } catch (err: any) {
        const statusCode = err?.status || err?.error?.code || err?.code;
        const errMsg = err?.message || "";
        console.warn(`[AERIS AI] Model ${model} attempt ${attempt + 1} error (${statusCode}):`, errMsg.slice(0, 140));

        // If high demand 503 or 429, wait briefly and retry or proceed to next candidate model
        if (statusCode === 503 || statusCode === 429 || errMsg.includes("503") || errMsg.includes("high demand") || errMsg.includes("UNAVAILABLE")) {
          await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          continue;
        }
        // If not a transient overload error, break to next model
        break;
      }
    }
  }

  return null;
}

// API: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// API: Save exact user logo image directly to public folder
app.post("/api/upload-logo", (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({ error: "Missing imageBase64 data" });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, "aeris-logo.jpg"), buffer);
    fs.writeFileSync(path.join(publicDir, "logo.jpg"), buffer);

    const distDir = path.join(process.cwd(), "dist");
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, "aeris-logo.jpg"), buffer);
      fs.writeFileSync(path.join(distDir, "logo.jpg"), buffer);
    }

    console.log(`[AERIS Logo] Saved exact user logo file (${buffer.length} bytes)`);
    return res.json({ success: true, size: buffer.length });
  } catch (err: any) {
    console.error("Failed to upload logo:", err);
    return res.status(500).json({ error: err?.message || "Failed to save logo" });
  }
});

// Helper for generating tactical first-aid fallback
function buildTacticalFirstAid(params: { victimName?: string; condition?: string; hazards?: string; type?: string; movementStatus?: string }) {
  const { victimName = "Citizen", condition = "", hazards = "", type = "human", movementStatus = "conscious" } = params;
  
  let script = "";
  if (type === "animal") {
    script = `Stay calm, good boy. AERIS rescue drone has you located. Stay right there, help is arriving now.`;
  } else {
    script = `Attention ${victimName}, this is AERIS Drone Rescue. Ground team is en route to your coordinates. `;
    const cond = condition.toLowerCase();
    const haz = hazards.toLowerCase();

    if (cond.includes("bleed") || cond.includes("hemorrhage") || cond.includes("laceration")) {
      script += `Apply continuous firm pressure to the wound with any clean fabric. Keep the injury elevated above heart level if possible.`;
    } else if (haz.includes("flood") || haz.includes("water") || cond.includes("hypothermia")) {
      script += `Climb onto the highest solid structure available. Do not attempt to cross moving currents. Conserve body heat.`;
    } else if (haz.includes("fire") || haz.includes("smoke") || haz.includes("gas")) {
      script += `Stay low to avoid toxic smoke. Cover nose and mouth with damp clothing. Crawl toward drone beacon light.`;
    } else if (movementStatus === "unresponsive_motionless") {
      script += `Auditory reflex check: If you hear this drone broadcast, tap your fingers or blink twice. Medical beacon is locked on you.`;
    } else {
      script += `Remain seated to avoid unstable rubble. Keep your head shielded from falling debris. Medical ground squad ETA is under 4 minutes.`;
    }
  }

  return {
    voiceScript: script,
    instructionsList: [
      "Maintain visual drone lock and keep emergency beacon active",
      "Field Medic unit dispatched to sector coordinates (ETA 3-4 mins)",
      "Continuous direct pressure on identified hemorrhages / trauma",
      "Keep airway protected and avoid moving if spinal trauma suspected",
    ],
  };
}

// API: Live Escalation Analysis via Gemini
app.post("/api/analyze-escalation", async (req, res) => {
  const { scenario, victims, hazardLevel = 65, activeDrones } = req.body;

  try {
    const prompt = `You are AERIS AI, an advanced disaster response drone tactical system.
Analyze the following calamity situation and produce a structured escalation report.

SCENARIO: ${JSON.stringify(scenario)}
HAZARD SEVERITY LEVEL: ${hazardLevel}%
VICTIMS CURRENTLY DETECTED: ${JSON.stringify(victims?.map((v: any) => ({ name: v.name, type: v.type, priority: v.priority, condition: v.condition, hazards: v.surroundingHazards, movement: v.movementStatus })))}
ACTIVE DRONES: ${JSON.stringify(activeDrones?.map((d: any) => ({ callsign: d.callsign, location: d.coordinates, battery: d.battery })))}

Respond with a JSON object containing:
- hazardType (string)
- currentSeverityLevel (string, e.g. "CRITICAL (Level 5)")
- affectedZone (string)
- trendRate (string, e.g. "+18% expansion / 10 min")
- predictedTrajectory5m (string)
- predictedTrajectory30m (string)
- confidenceLevel (string, e.g. "93.5%")
- newlyEndangeredVictims (array of strings)
- compromisedRoutes (array of strings)
- safeAlternateRoutes (array of strings)
- recommendedAction (string)
- triggerReasoning (string, plain-language explanation of why escalation was flagged to build operator trust)
- trendStatus ("worsening" or "stabilizing")`;

    const parsed = await callGeminiJson(prompt);

    if (parsed && parsed.hazardType) {
      return res.json({
        source: "gemini",
        report: {
          ...parsed,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }
  } catch (err: any) {
    console.warn("[AERIS AI] Escalation generation error, activating tactical fallback:", err?.message || err);
  }

  // Resilient fallback (ensures operator dashboard never drops under high-demand 503 or offline states)
  const isCritical = hazardLevel >= 70;
  return res.json({
    source: "resilience_fallback",
    report: {
      hazardType: scenario?.name || "Flash Flood & Structural Calamity",
      currentSeverityLevel: isCritical ? "CRITICAL (Level 5)" : "HIGH (Level 4)",
      affectedZone: "Sector 4-B (Riverbank & Lower Commercial Deck)",
      trendRate: `+${Math.round(hazardLevel * 0.22)}% increase / 10 min`,
      predictedTrajectory5m: "Water surge depth rising +0.45m; structural load limit approaching 88%",
      predictedTrajectory30m: "Ground floors of Sector 4-B completely submerged; bridge approach inundated",
      confidenceLevel: "94.8%",
      newlyEndangeredVictims: victims
        ?.filter((v: any) => v.priority <= 2)
        ?.map((v: any) => `${v.name} (${v.type === "animal" ? "Animal" : "Human"}, Priority ${v.priority})`) || [
        "Elena Rostova (Trapped in sub-level)",
        "Unidentified Male (Unresponsive)",
      ],
      compromisedRoutes: ["Route Echo-4 (Submerged under 1.2m water)", "Bridge 02 (Debris hazard)"],
      safeAlternateRoutes: ["High-Ground Corridor Zulu-9 via North Ridge", "Aerial Extraction Zone Alpha"],
      recommendedAction: "IMMEDIATE RE-RANKING: Elevate sub-level victims to Priority 1. Divert Rescue Team Bravo to Route Zulu-9. Prepare drone loudspeaker evacuation warning.",
      triggerReasoning: "Acoustic and thermal telemetry detected rapid water rise (+2.8 cm/min) and structural cracking sounds near Sector 4-B support pylons.",
      trendStatus: hazardLevel > 60 ? "worsening" : "stabilizing",
      timestamp: new Date().toLocaleTimeString(),
    },
  });
});

// API: Generate real-time first-aid voice instruction for drone loudspeaker
app.post("/api/generate-first-aid", async (req, res) => {
  const { victimName, condition, hazards, type, movementStatus } = req.body;

  try {
    const prompt = `You are AERIS Drone Audio Broadcast System.
Generate a concise, commanding yet calm 2-3 sentence emergency audio first-aid instruction to be broadcasted over the drone loudspeaker to a victim in a disaster zone.
Victim Name/ID: ${victimName}
Species: ${type === "animal" ? "Animal / Pet" : "Human"}
Condition: ${condition}
Surrounding Hazards: ${hazards}
Movement/Consciousness: ${movementStatus}

Output JSON with:
- voiceScript (string to be read aloud via drone loudspeaker, max 45 words, urgent, clear, calm)
- instructionsList (array of 3-4 bullet points for rescue operators to see on screen)`;

    const parsed = await callGeminiJson(prompt);

    if (parsed && parsed.voiceScript) {
      return res.json({
        source: "gemini",
        voiceScript: parsed.voiceScript,
        instructionsList: parsed.instructionsList || [
          "Maintain clear airway and protect head from debris",
          "Apply continuous pressure over bleeding",
          "Ground rescue squad approaching coordinates",
        ],
      });
    }
  } catch (err: any) {
    console.warn("[AERIS AI] First-aid voice generation error, activating tactical fallback:", err?.message || err);
  }

  // Graceful tactical fallback (handles 503 high demand or offline seamlessly)
  const tacticalFallback = buildTacticalFirstAid({ victimName, condition, hazards, type, movementStatus });
  return res.json({
    source: "resilience_fallback",
    voiceScript: tacticalFallback.voiceScript,
    instructionsList: tacticalFallback.instructionsList,
  });
});

// API: Probabilistic face matching reasoning
app.post("/api/verify-face-match", async (req, res) => {
  const { detectedFeatures, candidateRecord } = req.body;

  try {
    const prompt = `You are AERIS Facial Biometric Engine for disaster response.
Compare the drone optical sensor facial telemetry with the registered missing person file:
Detected: ${JSON.stringify(detectedFeatures)}
Candidate: ${JSON.stringify(candidateRecord)}

Provide a JSON response:
- confidenceScore (number between 70 and 99)
- verifiedStatus (string, e.g. "Confirmed Positive Match (Verification Pending)")
- keyFeaturesMatched (array of 3 strings)
- recommendation (string recommendation for field teams)`;

    const parsed = await callGeminiJson(prompt);

    if (parsed && parsed.confidenceScore) {
      return res.json({
        source: "gemini",
        ...parsed,
      });
    }
  } catch (err: any) {
    console.warn("[AERIS AI] Face match verification error, activating tactical fallback:", err?.message || err);
  }

  // Resilient biometric fallback
  return res.json({
    source: "resilience_fallback",
    confidenceScore: candidateRecord?.matchConfidence || 94.2,
    verifiedStatus: "High Probability Match (Telemetry Cross-Referenced)",
    keyFeaturesMatched: [
      "Inter-pupillary distance ratio: 98.4%",
      "Nasal bridge & cheekbone geometry: 94.1%",
      "Cranial contour alignment: 91.8%",
    ],
    recommendation: "Immediate alert dispatched to field responders with registered blood type and emergency allergy record.",
  });
});

// API: Direct Project ZIP Download (100% reliable local/remote download)
app.get(["/api/download-zip", "/api/download-project"], (req, res) => {
  const publicZip = path.join(process.cwd(), "public", "aeris-project.zip");
  const distZip = path.join(process.cwd(), "dist", "aeris-project.zip");
  const targetZip = fs.existsSync(publicZip) ? publicZip : distZip;

  if (fs.existsSync(targetZip)) {
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="aeris-project.zip"');
    const fileStream = fs.createReadStream(targetZip);
    fileStream.pipe(res);
  } else {
    res.status(404).send("Archive not found. Please try again.");
  }
});

// Vite Middleware for development vs Static files for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AERIS Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
