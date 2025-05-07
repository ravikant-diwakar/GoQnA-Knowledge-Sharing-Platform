import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  DocumentData,
  increment,
  DocumentReference,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export const useFirestore = <T extends DocumentData>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentUser, userData } = useAuth();

  const addDocument = async (documentData: Omit<T, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      
      const dataWithMetadata = {
        ...documentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser?.uid || null,
        username: userData?.username || 'anonymous',
        userPhotoURL: currentUser?.photoURL || null
      };
      
      const docRef = await addDoc(collectionRef, dataWithMetadata);
      
      setLoading(false);
      return { id: docRef.id, ...dataWithMetadata } as T;
    } catch (err) {
      setError('Could not add document');
      setLoading(false);
      console.error('Error adding document:', err);
      throw err;
    }
  };

  const updateDocument = async (id: string, updates: Partial<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      
      const updatedData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
      setLoading(false);
      return { id, ...updatedData } as Partial<T>;
    } catch (err) {
      setError('Could not update document');
      setLoading(false);
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      setLoading(false);
      return id;
    } catch (err) {
      setError('Could not delete document');
      setLoading(false);
      console.error('Error deleting document:', err);
      throw err;
    }
  };

  const getDocuments = async (
    conditions?: { field: string; operator: string; value: any }[],
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const collectionRef = collection(db, collectionName);
      
      let queryRef: any = collectionRef;
      
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          queryRef = query(queryRef, where(condition.field, condition.operator, condition.value));
        });
      }
      
      if (orderByField) {
        queryRef = query(queryRef, orderBy(orderByField, orderDirection || 'desc'));
      }
      
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(queryRef);
      
      const documents: T[] = [];
      querySnapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() } as T);
      });
      
      setData(documents);
      setLoading(false);
      return documents;
    } catch (err) {
      setError('Could not fetch documents');
      setLoading(false);
      console.error('Error getting documents:', err);
      throw err;
    }
  };

  const getDocument = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const document = { id: docSnap.id, ...docSnap.data() } as T;
        setLoading(false);
        return document;
      } else {
        setError('Document does not exist');
        setLoading(false);
        return null;
      }
    } catch (err) {
      setError('Could not fetch document');
      setLoading(false);
      console.error('Error getting document:', err);
      throw err;
    }
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.error('Error uploading file:', err);
      throw err;
    }
  };

  const incrementField = async (id: string, field: string, amount = 1) => {
    try {
      const docRef = doc(db, collectionName, id) as DocumentReference<T>;
      await updateDoc(docRef, {
        [field]: increment(amount)
      });
      return true;
    } catch (err) {
      console.error('Error incrementing field:', err);
      throw err;
    }
  };

  const addToArray = async (id: string, field: string, value: any) => {
    try {
      const docRef = doc(db, collectionName, id) as DocumentReference<T>;
      await updateDoc(docRef, {
        [field]: arrayUnion(value)
      });
      return true;
    } catch (err) {
      console.error('Error adding to array:', err);
      throw err;
    }
  };

  const removeFromArray = async (id: string, field: string, value: any) => {
    try {
      const docRef = doc(db, collectionName, id) as DocumentReference<T>;
      await updateDoc(docRef, {
        [field]: arrayRemove(value)
      });
      return true;
    } catch (err) {
      console.error('Error removing from array:', err);
      throw err;
    }
  };

  return { 
    data, 
    error, 
    loading, 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    getDocuments, 
    getDocument,
    uploadFile,
    incrementField,
    addToArray,
    removeFromArray
  };
};