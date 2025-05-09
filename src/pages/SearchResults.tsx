import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question } from '../types';
import QuestionCard from '../components/QuestionCard';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const { tag } = useParams<{ tag: string }>();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [sort, setSort] = useState<'relevance' | 'newest' | 'votes'>('relevance');
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let q;
        
        // If searching by tag
        if (tag) {
          q = query(
            collection(db, 'questions'),
            where('tags', 'array-contains', tag.toLowerCase()),
            orderBy(sort === 'newest' ? 'createdAt' : 'upvotes', 'desc'),
            limit(20)
          );
        } 
        // If searching by query term
        else if (queryParam) {
          // NOTE: This is a simple implementation. For a production app,
          // you would use a more sophisticated search solution like Algolia or Elasticsearch
          
          // Convert query to lowercase for case-insensitive search
          const lowerQuery = queryParam.toLowerCase();
          
          q = query(
            collection(db, 'questions'),
            where('titleLowercase', '>=', lowerQuery),
            where('titleLowercase', '<=', lowerQuery + '\uf8ff'),
            orderBy('titleLowercase'),
            orderBy(sort === 'newest' ? 'createdAt' : 'upvotes', 'desc'),
            limit(20)
          );
        } else {
          // No search parameters provided
          setQuestions([]);
          setLoading(false);
          return;
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
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [tag, queryParam, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.pushState({}, '', newUrl);
      // Trigger the useEffect
      searchParams.set('q', searchQuery.trim());
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const searchTitle = tag 
    ? `Questions tagged [${tag}]` 
    : queryParam 
      ? `Search results for "${queryParam}"` 
      : 'Search';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">{searchTitle}</h1>
          <p className="text-gray-600 mt-1">
            {questions.length} {questions.length === 1 ? 'result' : 'results'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-white rounded-lg border border-gray-300 py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Filter and sort options */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center text-gray-700">
          <Filter className="w-5 h-5 mr-2" />
          <span className="font-medium">Filter by:</span>
          <div className="ml-4 flex space-x-2">
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
              All
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
              Answered
            </button>
            <button className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50">
              Unanswered
            </button>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-700 font-medium mr-2">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'relevance' | 'newest' | 'votes')}
            className="rounded-md border-gray-300 py-1 pl-3 pr-8 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="votes">Votes</option>
          </select>
        </div>
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
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
          <p className="text-gray-500 mb-6">
            {tag 
              ? `No questions found with the tag "${tag}".` 
              : queryParam 
                ? `No questions found matching "${queryParam}".` 
                : 'Please enter a search term to find questions.'}
          </p>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-500">Try:</p>
            <ul className="list-disc text-left text-sm text-gray-600 pl-6">
              <li>Using different or fewer keywords</li>
              <li>Checking your spelling</li>
              <li>Browsing popular tags</li>
              <li>Browsing the most recent questions</li>
            </ul>
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
            Load more results
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;