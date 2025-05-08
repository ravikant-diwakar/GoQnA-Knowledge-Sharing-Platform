import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';

interface AnswerCardProps {
  answer: Answer;
  questionId: string;
  questionUserId: string;
  onAcceptAnswer?: (answerId: string) => Promise<void>;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  questionId, 
  questionUserId,
  onAcceptAnswer 
}) => {
  const { currentUser } = useAuth();
  const { incrementField } = useFirestore('answers');
  
  // Format date with validation
  const formattedDate = React.useMemo(() => {
    if (!answer.createdAt) return 'recently';
    
    try {
      const date = typeof answer.createdAt === 'string' 
        ? new Date(answer.createdAt)
        : answer.createdAt;
        
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'recently';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'recently';
    }
  }, [answer.createdAt]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return;
    
    try {
      if (voteType === 'upvote') {
        await incrementField(answer.id, 'upvotes');
      } else {
        await incrementField(answer.id, 'downvotes');
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAccept = async () => {
    if (onAcceptAnswer) {
      await onAcceptAnswer(answer.id);
    }
  };

  // Check if current user is the question author (can accept answer)
  const canAcceptAnswer = currentUser && currentUser.uid === questionUserId;

  return (
    <div className={`border ${answer.isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-200'} rounded-lg p-6 my-4`}>
      <div className="flex">
        {/* Voting buttons */}
        <div className="flex flex-col items-center mr-4">
          <button 
            onClick={() => handleVote('upvote')}
            disabled={!currentUser}
            className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            title={currentUser ? "Upvote this answer" : "Login to vote"}
          >
            <ThumbsUp className="h-6 w-6 text-gray-500" />
          </button>
          <span className="text-center my-1 font-medium">
            {(answer.upvotes || 0) - (answer.downvotes || 0)}
          </span>
          <button 
            onClick={() => handleVote('downvote')}
            disabled={!currentUser}
            className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            title={currentUser ? "Downvote this answer" : "Login to vote"}
          >
            <ThumbsDown className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {/* Answer content */}
        <div className="flex-1">
          <div className="mb-4 relative">
            {answer.isAccepted && (
              <div className="absolute -left-12 top-0 flex items-center text-green-600" title="Accepted answer">
                <CheckCircle className="h-6 w-6 fill-green-100" />
              </div>
            )}
            <div className="prose max-w-none">
              {answer.body}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
            {canAcceptAnswer && !answer.isAccepted && (
              <button
                onClick={handleAccept}
                className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept this answer
              </button>
            )}
            
            {answer.isAccepted && (
              <div className="text-green-600 font-medium text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Accepted answer
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500 ml-auto">
              <span>Answered {formattedDate}</span>
              <span className="mx-2">•</span>
              <Link 
                to={`/profile/${answer.userId}`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                {answer.userPhotoURL ? (
                  <img 
                    src={answer.userPhotoURL} 
                    alt={answer.userName}
                    className="h-5 w-5 rounded-full mr-1" 
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center mr-1">
                    <span className="text-xs text-blue-600">
                      {answer.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span>{answer.userName}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;