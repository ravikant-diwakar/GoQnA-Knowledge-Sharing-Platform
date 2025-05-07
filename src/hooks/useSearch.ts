import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Question } from '../types';

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchQuestions = async (searchTerm: string, maxResults = 20) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return [];
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Convert search term to lowercase for case-insensitive matching
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      
      // Query by title first
      const titleQuery = query(
        collection(db, 'questions'),
        where('titleLowercase', '>=', lowerSearchTerm),
        where('titleLowercase', '<=', lowerSearchTerm + '\uf8ff'),
        orderBy('titleLowercase'),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      
      // Then query by tags
      const tagQuery = query(
        collection(db, 'questions'),
        where('tags', 'array-contains', lowerSearchTerm),
        orderBy('createdAt', 'desc'),
        limit(maxResults)
      );
      
      // Execute queries
      const [titleSnapshot, tagSnapshot] = await Promise.all([
        getDocs(titleQuery),
        getDocs(tagQuery)
      ]);
      
      // Combine results and remove duplicates
      const titleResults: Question[] = [];
      const tagResults: Question[] = [];
      
      titleSnapshot.forEach(doc => {
        titleResults.push({ id: doc.id, ...doc.data() } as Question);
      });
      
      tagSnapshot.forEach(doc => {
        if (!titleResults.some(q => q.id === doc.id)) {
          tagResults.push({ id: doc.id, ...doc.data() } as Question);
        }
      });
      
      const combinedResults = [...titleResults, ...tagResults].slice(0, maxResults);
      setSearchResults(combinedResults);
      setIsSearching(false);
      return combinedResults;
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching');
      setIsSearching(false);
      return [];
    }
  };

  return { searchResults, isSearching, searchError, searchQuestions };
};