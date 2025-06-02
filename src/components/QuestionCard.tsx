import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ThumbsUp, Eye, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const navigate = useNavigate();
  
  // Format date
  const formattedDate = question.createdAt ? 
    formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 
    'recently';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on a link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    navigate(`/questions/${question.id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <h2 className="text-xl font-semibold text-gray-900 hover:text-red-600 transition-colors duration-300 line-clamp-2">
            {question.title}
          </h2>
          
          {/* Replace the plain text paragraph with ReactMarkdown */}
          <div className="mt-2 prose prose-sm max-w-none line-clamp-3">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({node, ...props}) => <p className="mb-3" {...props} />,
                pre: ({node, ...props}) => (
                  <pre className="mb-3 p-2 bg-gray-100 rounded-md overflow-x-auto" {...props} />
                ),
                code: ({node, ...props}) => (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                )
              }}
            >
              {question.body}
            </ReactMarkdown>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {question.tags && question.tags.map((tag, index) => (
              <Link 
                key={index} 
                to={`/tags/${tag}`}
                className="inline-block bg-red-50 text-red-600 px-2 py-1 text-xs font-medium rounded-md hover:bg-red-100 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
        
        {question.isSolved && (
          <div className="ml-4 flex-shrink-0">
            <div className="flex items-center text-green-600" title="This question has an accepted answer">
              <CheckCircle className="h-5 w-5" />
              <span className="sr-only">Solved</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center" title="Answers">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>{question.answerCount || 0}</span>
          </div>
          
          <div className="flex items-center" title="Upvotes">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{question.upvotes || 0}</span>
          </div>
          
          <div className="flex items-center" title="Views">
            <Eye className="h-4 w-4 mr-1" />
            <span>{question.views || 0}</span>
          </div>
        </div>
        
        <div className="flex items-center text-sm">
          <div className="flex items-center text-gray-500">
            <span className="mr-1">Asked</span>
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          
          <div className="hidden sm:flex items-center ml-4">
            <span className="mr-1 text-gray-500">by</span>
            <Link 
              to={`/profile/${question.userId}`}
              className="flex items-center text-red-600 hover:text-red-800"
              onClick={(e) => e.stopPropagation()}
            >
              {question.userPhotoURL ? (
                <img 
                  src={question.userPhotoURL} 
                  alt={question.userName}
                  className="h-5 w-5 rounded-full mr-1" 
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-1">
                  <span className="text-xs text-red-600">
                    {question.userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span>{question.userName}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;