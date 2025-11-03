
// pages/api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // API 키 체크
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY가 설정되지 않았습니다. Vercel 환경변수를 확인해주세요.',
      details: 'Google Gemini API 키가 필요합니다. https://makersuite.google.com/app/apikey 에서 발급받으세요.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ text });
  } catch (error) {
    console.error('Gemini API Error:', error);

    // 에러 타입별 상세 메시지
    let errorMessage = 'Failed to generate content';
    let errorDetails = error.message;

    if (error.message?.includes('API key')) {
      errorMessage = 'API 키 오류';
      errorDetails = 'Google Gemini API 키가 유효하지 않습니다.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API 할당량 초과';
      errorDetails = 'Google Gemini API 할당량이 초과되었습니다.';
    } else if (error.message?.includes('blocked')) {
      errorMessage = '콘텐츠 차단';
      errorDetails = '생성 요청이 안전 필터에 의해 차단되었습니다.';
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails
    });
  }
}
