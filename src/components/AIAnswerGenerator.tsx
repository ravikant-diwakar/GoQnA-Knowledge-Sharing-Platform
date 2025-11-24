import React, { useState } from 'react';
import { Sparkles, X, AlertCircle } from 'lucide-react';
import { generateAnswer } from '../services/groq';
import MarkdownEditor from './MarkdownEditor';

interface AIAnswerGeneratorProps {
  question: string;
  onAnswerGenerated: (answer: string) => void;
  onClose: () => void;
}

const AIAnswerGenerator: React.FC<AIAnswerGeneratorProps> = ({
  question,
  onAnswerGenerated,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAnswer, setGeneratedAnswer] = useState('');

  const handleGenerateAnswer = async () => {
    setLoading(true);
    setError(null);

    try {
      const answer = await generateAnswer(question);
      setGeneratedAnswer(answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate answer');
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnswer = () => {
    onAnswerGenerated(generatedAnswer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 text-red-600 mr-2" />
            AI Answer Generator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Question:</h3>
            <div className="bg-gray-50 p-3 rounded-md text-gray-700">
              {question}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!generatedAnswer ? (
            <button
              onClick={handleGenerateAnswer}
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating answer...
                </span>
              ) : (
                'Generate AI Answer'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              <MarkdownEditor
                value={generatedAnswer}
                onChange={setGeneratedAnswer}
                height={200}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setGeneratedAnswer('')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Generate Another
                </button>
                <button
                  onClick={handleUseAnswer}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Use This Answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnswerGenerator;