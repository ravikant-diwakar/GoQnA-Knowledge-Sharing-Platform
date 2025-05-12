// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Camera, Save, X } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useFirestore } from '../hooks/useFirestore';

// const EditProfile: React.FC = () => {
//   const { currentUser, userData, updateUserProfile } = useAuth();
//   const { uploadFile } = useFirestore('users');
//   const navigate = useNavigate();
  
//   const [displayName, setDisplayName] = useState(userData?.displayName || '');
//   const [bio, setBio] = useState(userData?.bio || '');
//   const [newPhotoURL, setNewPhotoURL] = useState<string | null>(null);
//   const [previewURL, setPreviewURL] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   if (!currentUser || !userData) {
//     navigate('/login');
//     return null;
//   }

//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) { // 5MB limit
//         setError('Photo size must be less than 5MB');
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreviewURL(reader.result as string);
//       };
//       reader.readAsDataURL(file);
      
//       // Store the file for upload
//       setNewPhotoURL(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       let photoURL = currentUser.photoURL;

//       // Upload new photo if selected
//       if (newPhotoURL && fileInputRef.current?.files?.[0]) {
//         const file = fileInputRef.current.files[0];
//         const path = `users/${currentUser.uid}/profile-photo`;
//         photoURL = await uploadFile(file, path);
//       }

//       // Update profile
//       await updateUserProfile({
//         displayName,
//         bio,
//         photoURL
//       });

//       navigate(`/profile/${currentUser.uid}`);
//     } catch (err) {
//       console.error('Error updating profile:', err);
//       setError('Failed to update profile. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//           <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {error && (
//             <div className="bg-red-50 border-l-4 border-red-400 p-4">
//               <div className="flex">
//                 <div className="flex-shrink-0">
//                   <X className="h-5 w-5 text-red-400" />
//                 </div>
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Profile Photo */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Profile Photo
//             </label>
//             <div className="flex items-center space-x-6">
//               <div className="relative">
//                 {previewURL || currentUser.photoURL ? (
//                   <img
//                     src={previewURL || currentUser.photoURL}
//                     alt="Profile preview"
//                     className="h-24 w-24 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
//                     <span className="text-4xl text-gray-400">
//                       {displayName.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                 )}
//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="absolute bottom-0 right-0 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
//                 >
//                   <Camera className="w-4 h-4" />
//                 </button>
//               </div>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*"
//                 onChange={handlePhotoChange}
//                 className="hidden"
//               />
//               <div className="text-sm text-gray-500">
//                 <p>Click the camera icon to upload a new photo</p>
//                 <p className="mt-1">Maximum file size: 5MB</p>
//               </div>
//             </div>
//           </div>

//           {/* Display Name */}
//           <div>
//             <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
//               Display Name
//             </label>
//             <input
//               type="text"
//               id="displayName"
//               value={displayName}
//               onChange={(e) => setDisplayName(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
//               required
//             />
//           </div>

//           {/* Username (read-only) */}
//           <div>
//             <label htmlFor="username" className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               type="text"
//               id="username"
//               value={`@${userData.username}`}
//               className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
//               disabled
//             />
//             <p className="mt-1 text-sm text-gray-500">
//               Username cannot be changed
//             </p>
//           </div>

//           {/* Bio */}
//           <div>
//             <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
//               Bio
//             </label>
//             <textarea
//               id="bio"
//               rows={4}
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
//               placeholder="Tell us about yourself..."
//             />
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={() => navigate(`/profile/${currentUser.uid}`)}
//               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
//                 loading ? 'opacity-75 cursor-not-allowed' : ''
//               }`}
//             >
//               <Save className="w-4 h-4 mr-2" />
//               {loading ? 'Saving...' : 'Save Changes'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProfile;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EditProfile: React.FC = () => {
  const { currentUser, userData, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!currentUser || !userData) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateUserProfile({
        displayName,
        bio
      });

      navigate(`/profile/${currentUser.uid}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          {/* Username (read-only) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={`@${userData.username}`}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              disabled
            />
            <p className="mt-1 text-sm text-gray-500">
              Username cannot be changed
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/profile/${currentUser.uid}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;