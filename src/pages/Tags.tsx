import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, doc, setDoc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore';
import { RefreshCw, Tag as TagIcon } from 'lucide-react';
import { db } from '../firebase/config';
import { Tag } from '../types';

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const tagsQuery = query(collection(db, 'tags'), orderBy('count', 'desc'));
      const snapshot = await getDocs(tagsQuery);
      const tagsData: Tag[] = [];
      snapshot.forEach((doc) => {
        tagsData.push({ id: doc.id, ...doc.data() } as Tag);
      });
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSyncTags = async () => {
    setSyncing(true);
    try {
      // 1. Fetch all questions
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const tagCounts: Record<string, number> = {};

      questionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.tags && Array.isArray(data.tags)) {
          data.tags.forEach((tag: string) => {
            const normalizedTag = tag.toLowerCase();
            tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
          });
        }
      });

      // 2. Update tags collection
      // We'll use individual writes for simplicity and to avoid batch limits logic for this demo
      // In a real app, use batched writes
      await Promise.all(Object.entries(tagCounts).map(async ([tagName, count]) => {
        const tagRef = doc(db, 'tags', tagName);
        const tagSnap = await getDoc(tagRef);

        if (tagSnap.exists()) {
          // If it exists, we might want to just set the count to be accurate based on current questions
          // rather than incrementing, to ensure consistency during a "sync"
          await updateDoc(tagRef, { count: count });
        } else {
          await setDoc(tagRef, {
            name: tagName,
            description: '',
            count: count
          });
        }
      }));

      // Refresh the list
      fetchTags();
    } catch (error) {
      console.error('Error syncing tags:', error);
    } finally {
      setSyncing(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
          <p className="mt-2 text-gray-600">
            A tag is a keyword or label that categorizes your question with other, similar questions.
          </p>
        </div>
        <button
          onClick={handleSyncTags}
          disabled={syncing}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          title="Rebuild tags from existing questions"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Tags'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div key={tag.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <Link
                  to={`/tags/${tag.name}`}
                  className="inline-block bg-red-50 text-red-600 px-2 py-1 text-sm font-medium rounded-md hover:bg-red-100 transition-colors duration-200"
                >
                  {tag.name}
                </Link>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {tag.count}
                </span>
              </div>
              <p className="mt-4 text-gray-500 text-sm line-clamp-3">
                {tag.description || `Questions tagged with ${tag.name}`}
              </p>
              <div className="mt-4 text-sm text-gray-600 flex items-center">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag.count} {tag.count === 1 ? 'question' : 'questions'}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tags found</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no tags yet. Be the first to ask a question and create a tag!
            </p>
            <div className="mt-6">
              <button
                onClick={handleSyncTags}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync from Questions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tags;