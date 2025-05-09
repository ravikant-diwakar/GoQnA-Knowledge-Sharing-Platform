import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, Reply, Trash, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Comment, Reply as ReplyType } from '../types';
import { useFirestore } from '../hooks/useFirestore';
import MDEditor from '@uiw/react-md-editor';

interface CommentSectionProps {
  comments: Comment[];
  parentId: string;
  parentType: 'question' | 'answer';
  onCommentAdded: (comment: Comment) => void;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  parentId,
  parentType,
  onCommentAdded,
  onCommentUpdated,
  onCommentDeleted
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const { currentUser, userData } = useAuth();
  const { addDocument, updateDocument, deleteDocument } = useFirestore('comments');

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userData || !newComment.trim()) return;

    try {
      const comment: Omit<Comment, 'id'> = {
        parentId,
        parentType,
        body: newComment,
        createdAt: new Date(),
        userId: currentUser.uid,
        username: userData.username,
        userPhotoURL: currentUser.photoURL || undefined,
        replies: [],
        likes: []
      };

      const newCommentDoc = await addDocument(comment);
      onCommentAdded(newCommentDoc);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await updateDocument(commentId, { body: editText });
      const updatedComment = comments.find(c => c.id === commentId);
      if (updatedComment) {
        onCommentUpdated({ ...updatedComment, body: editText });
      }
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteDocument(commentId);
      onCommentDeleted(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!currentUser || !userData || !replyText.trim()) return;

    try {
      const reply: ReplyType = {
        id: Date.now().toString(), // Temporary ID
        commentId,
        body: replyText,
        createdAt: new Date(),
        userId: currentUser.uid,
        username: userData.username,
        userPhotoURL: currentUser.photoURL || undefined,
        likes: []
      };

      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        await updateDocument(commentId, {
          replies: [...comment.replies, reply]
        });
        onCommentUpdated({
          ...comment,
          replies: [...comment.replies, reply]
        });
      }

      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) return;

    try {
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        const likes = comment.likes.includes(currentUser.uid)
          ? comment.likes.filter(id => id !== currentUser.uid)
          : [...comment.likes, currentUser.uid];

        await updateDocument(commentId, { likes });
        onCommentUpdated({ ...comment, likes });
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      {currentUser && (
        <form onSubmit={handleAddComment} className="mb-4">
          <MDEditor
            value={newComment}
            onChange={(value) => setNewComment(value || '')}
            preview="edit"
            height={100}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Add Comment
            </button>
          </div>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            {/* Comment content */}
            <div className="flex items-start space-x-3">
              {comment.userPhotoURL ? (
                <img
                  src={comment.userPhotoURL}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-medium">
                    {comment.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">@{comment.username}</span>
                  <span className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {editingComment === comment.id ? (
                  <div className="mt-2">
                    <MDEditor
                      value={editText}
                      onChange={(value) => setEditText(value || '')}
                      preview="edit"
                      height={100}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-gray-800">{comment.body}</div>
                )}

                {/* Comment actions */}
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center space-x-1 ${
                      currentUser && comment.likes.includes(currentUser.uid)
                        ? 'text-red-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{comment.likes.length}</span>
                  </button>

                  <button
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setReplyText('');
                    }}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>

                  {currentUser && comment.userId === currentUser.uid && (
                    <>
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditText(comment.body);
                        }}
                        className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Reply form */}
                {replyingTo === comment.id && (
                  <div className="mt-3 pl-8">
                    <MDEditor
                      value={replyText}
                      onChange={(value) => setReplyText(value || '')}
                      preview="edit"
                      height={100}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-3 pl-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-white rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          {reply.userPhotoURL ? (
                            <img
                              src={reply.userPhotoURL}
                              alt={reply.username}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs font-medium">
                                {reply.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">@{reply.username}</span>
                              <span className="text-gray-500 text-xs">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="mt-1 text-gray-800">{reply.body}</div>
                            
                            <div className="mt-2 flex items-center space-x-4 text-sm">
                              <button
                                onClick={() => {
                                  // Handle reply like
                                }}
                                className={`flex items-center space-x-1 ${
                                  currentUser && reply.likes.includes(currentUser.uid)
                                    ? 'text-red-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{reply.likes.length}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;