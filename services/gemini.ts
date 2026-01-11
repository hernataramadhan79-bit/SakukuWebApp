import { GoogleGenAI } from "@google/genai";
import { Transaction, LanguageCode, CurrencyCode } from "../types";

// Initialize Gemini
// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpendingInsight = async (
  transactions: Transaction[], 
  language: LanguageCode = 'id',
  currency: CurrencyCode = 'IDR'
): Promise<string> => {
  if (!transactions || transactions.length === 0) {
    return language === 'id' 
      ? "Belum ada transaksi untuk dianalisis." 
      : "No transactions available for analysis.";
  }

  // Prepare a summary for the AI to reduce token usage and improve relevance
  const recentTransactions = transactions.slice(0, 50); // Analyze last 50
  const summary = JSON.stringify(recentTransactions.map(t => ({
    date: t.date.split('T')[0],
    amount: t.amount,
    category: t.category,
    type: t.type
  })));

  const langInstruction = language === 'id' 
    ? "Gunakan Bahasa Indonesia yang santai, profesional, dan futuristik." 
    : "Use casual, professional, and futuristic English.";

  const prompt = `
    Role: You are a smart personal financial assistant called "Sakuku AI".
    Task: Analyze transaction data and give concise financial insights.
    Context: Currency is ${currency}.
    Language: ${langInstruction}

    Data: ${summary}

    Output Format (Markdown):
    
    ### 📊 Status Keuangan
    [Status: Aman/Waspada/Kritis] - [Ringkasan 1 kalimat tentang kondisi saat ini]

    ### 📉 Pola Pengeluaran
    [Analisis singkat mengenai kategori pengeluaran terbesar atau tren yang mencolok]

    ### 💡 Saran Cerdas
    [1-2 saran praktis dan dapat ditindaklanjuti untuk berhemat]

    Keep the tone encouraging, professional, and futuristic. Use bold text for emphasis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || (language === 'id' ? "Tidak dapat membuat analisis saat ini." : "Cannot generate analysis at this time.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return language === 'id' 
      ? "Gagal terhubung ke layanan AI. Periksa koneksi internet Anda." 
      : "Failed to connect to AI service. Check your internet connection.";
  }
};