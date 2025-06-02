import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateAnswer = async (question: string, context?: string): Promise<string> => {
  try {
    const prompt = context 
      ? `Given the following context and question, provide a detailed, accurate answer:
         
         Context: ${context}
         
         Question: ${question}
         
         Please provide a comprehensive answer that directly addresses the question while incorporating relevant information from the context.`
      : `Please provide a detailed, accurate answer to the following question:
         
         Question: ${question}
         
         Provide a comprehensive answer that directly addresses the question.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable AI assistant specializing in providing accurate, detailed answers to questions. Your responses should be clear, well-structured, and include relevant examples or explanations when appropriate.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mistral-saba-24b',  // Updated model ID
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    return completion.choices[0]?.message?.content || 'Unable to generate an answer.';
  } catch (error) {
    console.error('Error generating answer:', error);
    throw new Error('Failed to generate AI answer. Please try again later.');
  }
};