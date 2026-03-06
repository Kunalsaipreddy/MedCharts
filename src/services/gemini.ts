import { GoogleGenAI } from "@google/genai";
import { VitalReading } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeVitals(readings: VitalReading[]) {
  const latest = readings[readings.length - 1];
  const previous = readings.slice(-5);

  const prompt = `
    As a clinical AI assistant, analyze the following patient vital signs and provide a concise clinical summary and any urgent alerts.
    
    Latest Vitals:
    - Heart Rate: ${latest.heartRate} bpm
    - Blood Pressure: ${latest.systolicBP}/${latest.diastolicBP} mmHg
    - SpO2: ${latest.spo2}%
    - Temp: ${latest.temperature}°C
    
    Recent Trend (Last 5 readings):
    ${JSON.stringify(previous)}
    
    Provide your response in JSON format:
    {
      "summary": "A brief 2-sentence clinical summary of the patient's current state.",
      "alerts": [
        {
          "issue": "Short name of the issue (e.g., Tachycardia)",
          "explanation": "Brief clinical explanation of why this is happening or why it's a concern.",
          "severity": "warning" | "critical"
        }
      ],
      "status": "stable" | "warning" | "critical",
      "recommendation": "A single actionable recommendation for the nursing staff."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Unable to generate AI analysis at this time.",
      alerts: [],
      status: "stable",
      recommendation: "Continue standard monitoring protocols."
    };
  }
}

export async function chatWithAI(message: string, readings: VitalReading[]) {
  const latest = readings[readings.length - 1];
  const context = `
    You are a clinical AI assistant. You have access to the following patient data:
    Latest Vitals:
    - Heart Rate: ${latest?.heartRate} bpm
    - Blood Pressure: ${latest?.systolicBP}/${latest?.diastolicBP} mmHg
    - SpO2: ${latest?.spo2}%
    - Temp: ${latest?.temperature}°C
    
    Patient Name: ${latest?.patientName || 'Unknown'}
    Patient ID: ${latest?.patientId || 'Unknown'}
    
    Answer the user's question based on this data. Be professional, concise, and clinical.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        { role: "user", parts: [{ text: context }] },
        { role: "user", parts: [{ text: message }] }
      ],
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to my clinical knowledge base right now.";
  }
}
