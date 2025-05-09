import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Clock, Siren as Fire, Filter } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question } from '../types';
import QuestionCard from '../components/QuestionCard';

const Homepage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'trending' | 'hot'>('latest');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let q;
        
        switch (sort) {
          case 'trending':
            q = query(
              collection(db, 'questions'),
              orderBy('views', 'desc'),
              limit(20)
            );
            break;
          case 'hot':
            q = query(
              collection(db, 'questions'),
              orderBy('upvotes', 'desc'),
              limit(20)
            );
            break;
          case 'latest':
          default:
            q = query(
              collection(db, 'questions'),
              orderBy('createdAt', 'desc'),
              limit(20)
            );
            break;
        }
        
        const querySnapshot = await getDocs(q);
        const questionData: Question[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          questionData.push({
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
        
        setQuestions(questionData);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">All Questions</h1>
          <p className="text-gray-600 mt-1">
            {questions.length > 0 ? `${questions.length} questions` : 'Loading questions...'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setSort('latest')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border border-gray-300 ${
                sort === 'latest'
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="inline-block w-4 h-4 mr-1" />
              Latest
            </button>
            <button
              onClick={() => setSort('trending')}
              className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                sort === 'trending'
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="inline-block w-4 h-4 mr-1" />
              Trending
            </button>
            <button
              onClick={() => setSort('hot')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border border-gray-300 ${
                sort === 'hot'
                  ? 'bg-red-50 text-red-700 border-red-300'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Fire className="inline-block w-4 h-4 mr-1" />
              Hot
            </button>
          </div>
          
          <Link
            to="/ask"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Ask Question
          </Link>
        </div>
      </div>

      {/* Filter options */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center text-gray-700">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium">Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
            Unanswered
          </button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
            No accepted answer
          </button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
            Has bounty
          </button>
        </div>
        
        {/* Tags filter dropdown would go here */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
          <p className="mt-2 text-gray-500">Be the first to ask a question!</p>
          <div className="mt-6">
            <Link
              to="/ask"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
            >
              Ask a Question
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Load more questions
          </button>
        </div>
      )}
    </div>
  );
};

export default Homepage;