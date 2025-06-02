import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Share2,
  AlertTriangle,
  Bookmark,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { doc, getDoc, collection, query, where, orderBy, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import AnswerCard from '../components/AnswerCard';
import { useFirestore } from '../hooks/useFirestore';
import MarkdownEditor from '../components/MarkdownEditor';
import AIAnswerGenerator from '../components/AIAnswerGenerator';

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const { currentUser } = useAuth();
  const { addDocument, incrementField } = useFirestore<Answer>('answers');

  // Fetch question and its answers
  useEffect(() => {
    const fetchQuestionAndAnswers = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Get question
        const docRef = doc(db, 'questions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const questionData = docSnap.data();
          setQuestion({
            id: docSnap.id,
            title: questionData.title,
            body: questionData.body,
            tags: questionData.tags,
            createdAt: questionData.createdAt?.toDate(),
            updatedAt: questionData.updatedAt?.toDate(),
            userId: questionData.userId,
            userName: questionData.userName,
            userPhotoURL: questionData.userPhotoURL,
            views: questionData.views || 0,
            answerCount: questionData.answerCount || 0,
            upvotes: questionData.upvotes || 0,
            downvotes: questionData.downvotes || 0,
            isSolved: questionData.isSolved || false
          });

          // Increment view count
          await updateDoc(docRef, {
            views: increment(1)
          });

          // Get answers - simplified query to avoid complex indexing
          const answersQuery = query(
            collection(db, 'answers'),
            where('questionId', '==', id),
            orderBy('upvotes', 'desc')
          );

          const answersSnapshot = await getDocs(answersQuery);
          const answersData: Answer[] = [];

          answersSnapshot.forEach((doc) => {
            const data = doc.data();
            answersData.push({
              id: doc.id,
              questionId: data.questionId,
              body: data.body,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              userId: data.userId,
              userName: data.userName,
              userPhotoURL: data.userPhotoURL,
              upvotes: data.upvotes || 0,
              downvotes: data.downvotes || 0,
              isAccepted: data.isAccepted || false
            });
          });

          // Sort accepted answers to the top after fetching
          const sortedAnswers = answersData.sort((a, b) => {
            if (a.isAccepted && !b.isAccepted) return -1;
            if (!a.isAccepted && b.isAccepted) return 1;
            return 0;
          });

          setAnswers(sortedAnswers);
        } else {
          setError('Question not found');
        }
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionAndAnswers();
  }, [id]);

  // Handle voting
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!currentUser || !question) return;

    try {
      const questionRef = doc(db, 'questions', question.id);

      if (voteType === 'upvote') {
        await updateDoc(questionRef, {
          upvotes: increment(1)
        });
        setQuestion(prev => prev ? { ...prev, upvotes: (prev.upvotes || 0) + 1 } : null);
      } else {
        await updateDoc(questionRef, {
          downvotes: increment(1)
        });
        setQuestion(prev => prev ? { ...prev, downvotes: (prev.downvotes || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Handle answer submission
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !question || !newAnswer.trim()) return;

    setSubmitting(true);

    try {
      const answer: Omit<Answer, 'id'> = {
        questionId: question.id,
        body: newAnswer,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || undefined,
        upvotes: 0,
        downvotes: 0,
        isAccepted: false
      };

      const newAnswerDoc = await addDocument(answer);

      // Update answer count on question
      const questionRef = doc(db, 'questions', question.id);
      await updateDoc(questionRef, {
        answerCount: increment(1)
      });

      // Update local state
      setAnswers(prev => [...prev, newAnswerDoc]);
      setQuestion(prev => prev ? { ...prev, answerCount: (prev.answerCount || 0) + 1 } : null);
      setNewAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle accept answer
  const handleAcceptAnswer = async (answerId: string) => {
    if (!currentUser || !question) return;

    // Verify user is the question owner
    if (currentUser.uid !== question.userId) return;

    try {
      // Update the answer
      const answerRef = doc(db, 'answers', answerId);
      await updateDoc(answerRef, {
        isAccepted: true
      });

      // Update the question
      const questionRef = doc(db, 'questions', question.id);
      await updateDoc(questionRef, {
        isSolved: true
      });

      // Update local state
      setAnswers(prev =>
        prev.map(answer =>
          answer.id === answerId
            ? { ...answer, isAccepted: true }
            : answer
        )
      );

      setQuestion(prev => prev ? { ...prev, isSolved: true } : null);
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Question not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = formatDistanceToNow(new Date(question.createdAt), { addSuffix: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Question header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{question.title}</h1>

          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50">
              <Bookmark className="h-4 w-4 mr-1" />
              Save
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </button>
            <button className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md bg-white text-red-600 hover:bg-red-50">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Report
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center text-sm text-gray-500 mt-2 gap-x-6 gap-y-2">
          <div>
            Asked {formattedDate}
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Viewed {question.views} times
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 mr-1" />
            {question.answerCount} answers
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((tag, index) => (
            <Link
              key={index}
              to={`/tags/${tag}`}
              className="inline-block bg-red-50 text-red-600 px-2 py-1 text-xs font-medium rounded-md hover:bg-red-100 transition-colors duration-200"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex">
          {/* Voting buttons */}
          <div className="flex flex-col items-center mr-4">
            <button
              onClick={() => handleVote('upvote')}
              disabled={!currentUser}
              className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              title={currentUser ? "Upvote this question" : "Login to vote"}
            >
              <ThumbsUp className="h-6 w-6 text-gray-500" />
            </button>
            <span className="text-center my-1 font-medium">
              {(question.upvotes || 0) - (question.downvotes || 0)}
            </span>
            <button
              onClick={() => handleVote('downvote')}
              disabled={!currentUser}
              className={`p-1 rounded-full ${currentUser ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
              title={currentUser ? "Downvote this question" : "Login to vote"}
            >
              <ThumbsDown className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Question body */}
          <div className="flex-1">
            <div className="prose max-w-none">
              {question.body}
            </div>

            <div className="mt-6 flex justify-end items-center">
              <div className="flex items-center text-sm">
                <span className="text-gray-500 mr-2">Asked by</span>
                <Link
                  to={`/profile/${question.userId}`}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  {question.userPhotoURL ? (
                    <img
                      src={question.userPhotoURL}
                      alt={question.userName}
                      className="h-8 w-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
                      <span className="text-sm text-red-600">
                        {question.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{question.userName}</div>
                    <div className="text-xs text-gray-500">
                      {/* This would show reputation/badges */}
                      Member
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length > 0 ? (
          <div>
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                questionId={question.id}
                questionUserId={question.userId}
                onAcceptAnswer={handleAcceptAnswer}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      {/* Post answer form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Answer</h2>

        {currentUser ? (
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="answer" className="text-sm font-medium text-gray-700">
                  Write your answer
                </label>
                {/* <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                >
                  <Sparkles className="w-4 h-4 mr-1 text-red-600" />
                  Generate AI Answer
                </button> */}
                <button
                  type="button"
                  onClick={() => setShowAIGenerator(true)}
                  className="relative inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white rounded-lg 
             bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 
             hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 
             shadow-lg shadow-purple-300/40 
             hover:shadow-xl hover:shadow-purple-400/50 
             transition-all duration-300 ease-in-out 
             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                >
                  <Sparkles className="w-5 h-5 mr-2 text-white animate-pulse" />
                  Generate AI Answer
                </button>

              </div>
              <MarkdownEditor
                value={newAnswer}
                onChange={setNewAnswer}
                height={300}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newAnswer.trim()}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${submitting || !newAnswer.trim()
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
              >
                {submitting ? 'Posting...' : 'Post Your Answer'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You need to log in to post an answer.</p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        {showAIGenerator && (
          <AIAnswerGenerator
            question={question.title + "\n\n" + question.body}
            onAnswerGenerated={(answer) => setNewAnswer(answer)}
            onClose={() => setShowAIGenerator(false)}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;