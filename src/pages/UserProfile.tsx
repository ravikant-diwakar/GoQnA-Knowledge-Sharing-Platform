import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  User as UserIcon, 
  Calendar, 
  Mail, 
  Edit, 
  Award, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle
} from 'lucide-react';
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User, Question, Answer } from '../types';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'questions' | 'answers'>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get user
        const userDoc = await getDoc(doc(db, 'users', id));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser({
            ...userData,
            createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt)
          });
          
          // Get user's questions
          const questionsQuery = query(
            collection(db, 'questions'),
            where('userId', '==', id),
            orderBy('createdAt', 'desc'),
            orderBy('__name__', 'desc'),
            limit(5)
          );
          
          const questionsSnapshot = await getDocs(questionsQuery);
          const questionsData: Question[] = [];
          
          questionsSnapshot.forEach((doc) => {
            const data = doc.data();
            questionsData.push({
              id: doc.id,
              title: data.title,
              body: data.body,
              tags: data.tags,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
              userId: data.userId,
              userName: data.userName,
              userPhotoURL: data.userPhotoURL,
              views: data.views || 0,
              answerCount: data.answerCount || 0,
              upvotes: data.upvotes || 0,
              downvotes: data.downvotes || 0,
              isSolved: data.isSolved || false
            });
          });
          
          setQuestions(questionsData);
          
          // Get user's answers
          const answersQuery = query(
            collection(db, 'answers'),
            where('userId', '==', id),
            orderBy('createdAt', 'desc'),
            orderBy('__name__', 'desc'),
            limit(5)
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
          
          setAnswers(answersData);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'User not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentUser = currentUser && currentUser.uid === id;
  const memberSince = user.createdAt instanceof Date && !isNaN(user.createdAt.getTime())
  ? formatDistanceToNow(user.createdAt, { addSuffix: true })
  : 'Invalid date'; // Fallback in case the date is invalid

  console.log(user.createdAt);


  // Calculate stats
  const questionCount = questions.length;
  const answerCount = answers.length;
  const acceptedAnswers = answers.filter(a => a.isAccepted).length;
  const totalUpvotes = questions.reduce((total, q) => total + (q.upvotes || 0), 0) + 
                       answers.reduce((total, a) => total + (a.upvotes || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* User header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-sm" 
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm">
                  <UserIcon className="h-12 w-12 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
                {isCurrentUser && (
                  <Link 
                    to="/settings/profile" 
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit profile
                  </Link>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Member {memberSince}</span>
              </div>
              
              {user.email && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{user.email}</span>
                </div>
              )}
              
              {user.bio && (
                <p className="mt-2 text-gray-600">
                  {user.bio}
                </p>
              )}
              
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Questions</div>
                  <div className="font-bold text-gray-900">{questionCount}</div>
                </div>
                <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Answers</div>
                  <div className="font-bold text-gray-900">{answerCount}</div>
                </div>
                <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Accepted</div>
                  <div className="font-bold text-gray-900">{acceptedAnswers}</div>
                </div>
                <div className="bg-white shadow-sm rounded-lg px-4 py-2 border border-gray-200">
                  <div className="text-xs text-gray-500">Upvotes</div>
                  <div className="font-bold text-gray-900">{totalUpvotes}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon className="w-5 h-5 inline-block mr-1" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline-block mr-1" />
              Questions <span className="text-xs ml-1">({questionCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('answers')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'answers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ThumbsUp className="w-5 h-5 inline-block mr-1" />
              Answers <span className="text-xs ml-1">({answerCount})</span>
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                {user.bio ? (
                  <p className="text-gray-600">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">No bio provided</p>
                )}
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Badges</h2>
                <div className="flex flex-wrap gap-2">
                  {acceptedAnswers > 0 && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Helpful ({acceptedAnswers})
                    </div>
                  )}
                  {questionCount > 0 && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Curious ({questionCount})
                    </div>
                  )}
                  {totalUpvotes > 0 && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Liked ({totalUpvotes})
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Top Questions
                  </h2>
                  {questions.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {questions.slice(0, 3).map((question) => (
                        <li key={question.id} className="py-3">
                          <Link 
                            to={`/questions/${question.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {question.title}
                          </Link>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>{question.upvotes || 0} upvotes</span>
                            <span className="mx-2">•</span>
                            <span>{question.answerCount || 0} answers</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No questions yet</p>
                  )}
                </div>
                
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Recent Answers
                  </h2>
                  {answers.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {answers.slice(0, 3).map((answer) => (
                        <li key={answer.id} className="py-3">
                          <Link 
                            to={`/questions/${answer.questionId}`}
                            className="text-blue-600 hover:text-blue-800 font-medium line-clamp-1"
                          >
                            {answer.body.substring(0, 50)}...
                          </Link>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>{answer.upvotes || 0} upvotes</span>
                            {answer.isAccepted && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Accepted
                                </span>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">No answers yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'questions' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                All Questions
              </h2>
              {questions.length > 0 ? (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard key={question.id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
                  <p className="text-gray-500">When this user asks questions, they will be listed here.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'answers' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                All Answers
              </h2>
              {answers.length > 0 ? (
                <div className="space-y-4 divide-y divide-gray-200">
                  {answers.map((answer) => (
                    <div key={answer.id} className="pt-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 flex flex-col items-center mr-4">
                          <div className="bg-gray-100 rounded-full p-2">
                            <ThumbsUp className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium mt-1">{answer.upvotes || 0}</span>
                        </div>
                        <div>
                          <div className="prose prose-sm max-w-none mb-2 line-clamp-3">
                            {answer.body}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Link 
                              to={`/questions/${answer.questionId}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View question
                            </Link>
                            <span className="text-gray-500">
                              Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                            </span>
                            {answer.isAccepted && (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accepted answer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No answers yet</h3>
                  <p className="text-gray-500">When this user answers questions, they will be listed here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;