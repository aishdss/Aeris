# Aeris

**See the unseen. Act before it's too late.**

Aeris is an AI-powered disaster response drone platform (prototype/simulation) that uses thermal imaging and computer vision to detect trapped people and animals in disaster-affected areas, then helps rescuers decide who needs help first.

> ⚠️ This is a simulation/prototype, not a live drone-control system.

---

## Overview

In a disaster, rescue teams are limited in number and time is the difference between life and death. Aeris deploys 3–4 drones over an affected area to scan for survivors using thermal and computer vision, automatically triage what they find, and feed a live command-center dashboard that tells human rescuers exactly where to go and who to help first.

---

## Core Features

### AI-Powered Rescue
Drones use thermal + computer vision to detect trapped people and animals across the disaster zone, day or night.

### Smart Triage
Each detected victim is analyzed for visible condition, surrounding hazards, and movement, then assigned a **Priority 1–5** so the most critical cases surface first. Victims may also be flagged as Critical, Injured, Responsive, Unresponsive, or Possibly Perished — the latter always requiring physical verification.

### Live Rescue Dashboard
A command-center view showing drone location, battery, health, signal strength, altitude, camera/sensor status, victim counts, disaster severity, and active alerts — all in real time.

### AI Victim Identification
Bidirectional identity matching:
- **Drone → Person:** faces detected in the field are matched against a simulated database of registered/missing individuals.
- **Person → Drone:** operators can search by name/ID or photo to direct a drone's search toward a specific missing person.

### Talk Through the Drone
Rescuers can speak directly through a drone to a victim, offering reassurance and first-aid guidance before ground teams arrive.

### Animal Rescue
Animals in danger are detected separately, with their own location, condition, priority, and rescue status.

### Dynamic Disaster Intelligence
A live Situation Report tracks hazard type, severity, escalation trend, affected/compromised routes, and recommended actions — with victim priorities automatically re-ranked as conditions change.

---

## Target Audience

| Group | Use Case |
|---|---|
| Disaster Response Teams | Faster victim detection and prioritization |
| Emergency & Medical Teams | Identify critical victims, provide early guidance |
| Police & Rescue Services | Real-time situation awareness |
| Government Authorities | Monitor large areas, coordinate response |
| Animal Rescue Teams | Locate and save animals in danger |

---

## Impact & Benefits

- **Lives saved** — faster detection shortens time-to-rescue during the critical early hours
- **Rescuer safety** — drones enter unstable or hazardous areas first
- **Resource efficiency** — limited personnel can cover larger areas faster
- **Better coordination** — live data supports multi-agency response
- **Extended reach** — covers both human and animal rescue in one system

---

## Future Implementation

- **AI-Assisted Search & Control** — AI-assisted search and navigation under human supervision
- **Autonomous Drones** — fully AI-powered, human-supervised flight
- **Live Doctor Link** — human-to-human medical consultation via drone
- **Disaster Digital Twin** — a detailed live model of the affected area

---

## Tech Stack (proposed)

| Layer | Technology |
|---|---|
| Frontend | React/Next.js, Mapbox GL / deck.gl, WebSocket client |
| Realtime Transport | MQTT / WebSockets |
| Backend | Node.js or Python (FastAPI) |
| Computer Vision | On-device YOLO-class detector (thermal + RGB fusion) |
| Face Matching | Vector embedding search (FAISS / pgvector) |
| Data Storage | PostgreSQL (structured records), InfluxDB/Timescale (telemetry history) |
| Notifications | Twilio/SMS/push, gated by confidence threshold + human sign-off |
| Infra | Edge-first architecture to tolerate degraded/lost connectivity |

---

## Disclaimer

Aeris is a conceptual prototype built for demonstration purposes. Features such as facial identification and family notification are simulated and would require strict legal, privacy, and consent frameworks before any real-world deployment.

---

## Status

🟠 Prototype / Simulation — https://aerisnexora.vercel.app/
