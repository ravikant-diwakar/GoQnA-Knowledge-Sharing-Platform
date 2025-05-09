import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import { Question } from '../types';

const AskQuestion: React.FC = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addDocument } = useFirestore<Question>('questions');

  // Check if user is logged in
  if (!currentUser) {
    navigate('/login', { state: { from: '/ask' } });
    return null;
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    if (!title.trim() || !body.trim() || tags.length === 0) {
      setError('Please fill all required fields');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const questionData: Omit<Question, 'id'> = {
        title: title.trim(),
        body: body.trim(),
        tags,
        titleLowercase: title.trim().toLowerCase(), // For case-insensitive search
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || undefined,
        views: 0,
        answerCount: 0,
        upvotes: 0,
        downvotes: 0,
        isSolved: false
      };
      
      const newQuestion = await addDocument(questionData);
      
      // Redirect to the new question
      navigate(`/questions/${newQuestion.id}`);
    } catch (err) {
      console.error('Error submitting question:', err);
      setError('Failed to submit question. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        <p className="mt-2 text-gray-600">
          Get help from the community by asking a clear, concise question
        </p>
      </div>
      
      {/* Writing guidelines */}
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <HelpCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Writing a good question</h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Summarize your problem in a clear, concise title</li>
                <li>Describe what you've tried and what you expected</li>
                <li>Add relevant tags to help others find your question</li>
                <li>Check for similar questions before posting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-1">
            Be specific and concise (max 150 characters)
          </p>
          <input
            type="text"
            id="title"
            maxLength={150}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            placeholder="e.g., How to implement authentication with Firebase in React?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Body <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-1">
            Include all details someone would need to answer your question
          </p>
          <textarea
            id="body"
            rows={10}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            placeholder="Describe your question in detail. What have you tried? What's not working? Include any relevant code."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-1">
            Add up to 5 tags to describe what your question is about
          </p>
          <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500">
            {tags.map((tag, index) => (
              <div 
                key={index} 
                className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm flex items-center"
              >
                <span>{tag}</span>
                <button 
                  type="button" 
                  onClick={() => handleRemoveTag(tag)} 
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  &times;
                </button>
              </div>
            ))}
            <input
              type="text"
              id="tags"
              className={`flex-grow min-w-[120px] border-0 p-0 focus:ring-0 text-sm ${tags.length >= 5 ? 'opacity-50' : ''}`}
              placeholder={tags.length >= 5 ? "Max tags reached" : "Add tags..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              disabled={tags.length >= 5}
            />
          </div>
        </div>
        
        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !body.trim() || tags.length === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isSubmitting || !title.trim() || !body.trim() || tags.length === 0
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Post Your Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;