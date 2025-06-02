import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import { useFirestore } from '../hooks/useFirestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const formattedDate = React.useMemo(() => {
    if (!answer.createdAt) return 'recently';
    try {
      const date = typeof answer.createdAt === 'string'
        ? new Date(answer.createdAt)
        : answer.createdAt;
      if (isNaN(date.getTime())) return 'recently';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'recently';
    }
  }, [answer.createdAt]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser) return;
    try {
      await incrementField(answer.id, voteType === 'upvote' ? 'upvotes' : 'downvotes');
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleAccept = async () => {
    if (onAcceptAnswer) {
      await onAcceptAnswer(answer.id);
    }
  };

  const canAcceptAnswer = currentUser && currentUser.uid === questionUserId;

  return (
    <div className={`border ${answer.isAccepted ? 'border-green-300 bg-green-50' : 'border-gray-200'} rounded-lg p-4 sm:p-6 my-4`}>
      <div className="flex flex-col sm:flex-row">
        {/* Voting buttons */}
        <div className="flex sm:flex-col items-center sm:mr-4 mb-4 sm:mb-0">
          <button
            onClick={() => handleVote('upvote')}
            disabled={!currentUser}
            className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            title={currentUser ? "Upvote this answer" : "Login to vote"}
          >
            <ThumbsUp className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
          <span className="mx-2 sm:my-1 font-medium">
            {(answer.upvotes || 0) - (answer.downvotes || 0)}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            disabled={!currentUser}
            className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
            title={currentUser ? "Downvote this answer" : "Login to vote"}
          >
            <ThumbsDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
          </button>
        </div>

        {/* Answer content */}
        <div className="flex-1">
          <div className="mb-4 relative">
            {answer.isAccepted && (
              <div className="absolute -left-8 top-0 hidden sm:flex items-center text-green-600" title="Accepted answer">
                <CheckCircle className="h-6 w-6 fill-green-100" />
              </div>
            )}
            <div className="prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                  code: ({ inline, className, children, ...props }) =>
                    inline ? (
                      <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ),
                  a: ({ node, ...props }) => (
                    <a className="text-blue-600 hover:underline" {...props} />
                  )
                }}
              >
                {answer.body}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center mt-4 pt-2 border-t border-gray-100 gap-2">
            {answer.isAccepted && (
              <div className="sm:hidden text-green-600 font-medium text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Accepted
              </div>
            )}

            {canAcceptAnswer && !answer.isAccepted && (
              <button
                onClick={handleAccept}
                className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </button>
            )}

            <div className="flex items-center text-sm text-gray-500 ml-auto">
              <span className="whitespace-nowrap">Answered {formattedDate}</span>
              <span className="mx-2">•</span>
              <Link
                to={`/profile/${answer.userId}`}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                {answer.userPhotoURL ? (
                  <img
                    src={answer.userPhotoURL}
                    alt={answer.userName}
                    className="h-5 w-5 rounded-full mr-1"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-1">
                    <span className="text-xs text-red-600">
                      {answer.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hover:underline">{answer.userName}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;