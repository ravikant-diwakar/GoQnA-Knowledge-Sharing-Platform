// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Search, Menu, X, User, LogOut, LogIn, Home, PlusCircle, Bell } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import NotificationDropdown from './NotificationDropdown';

// const Navbar: React.FC = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showNotifications, setShowNotifications] = useState(false);
//   const { currentUser, userData, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchQuery.trim()) {
//       navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
//       setSearchQuery('');
//       setIsMenuOpen(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/');
//       setIsMenuOpen(false);
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const unreadNotifications = userData?.notifications.filter(n => !n.read) || [];

//   return (
//     <nav className="bg-white shadow-md sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between h-16">
//           <div className="flex items-center">
//             <Link to="/" className="flex-shrink-0 flex items-center">
//               <span className="text-orange-700 font-bold text-2xl">Q&A</span>
//             </Link>
//             <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
//               <Link 
//                 to="/" 
//                 className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
//               >
//                 <Home className="w-4 h-4 mr-1" />
//                 Home
//               </Link>
//               <Link 
//                 to="/tags" 
//                 className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
//               >
//                 Tags
//               </Link>
//               <Link 
//                 to="/users" 
//                 className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
//               >
//                 Users
//               </Link>
//             </div>
//           </div>
          
//           <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
//             <form onSubmit={handleSearch} className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-64 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button 
//                 type="submit" 
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//               >
//                 <Search className="w-5 h-5" />
//               </button>
//             </form>
            
//             {currentUser ? (
//               <>
//                 <Link 
//                   to="/ask" 
//                   className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300 flex items-center"
//                 >
//                   <PlusCircle className="w-4 h-4 mr-1" />
//                   Ask Question
//                 </Link>
                
//                 <div className="relative">
//                   <button 
//                     onClick={() => setShowNotifications(!showNotifications)}
//                     className="relative text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
//                   >
//                     <Bell className="w-6 h-6" />
//                     {unreadNotifications.length > 0 && (
//                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                         {unreadNotifications.length}
//                       </span>
//                     )}
//                   </button>
                  
//                   <NotificationDropdown 
//                     show={showNotifications} 
//                     onClose={() => setShowNotifications(false)} 
//                   />
//                 </div>
                
//                 <div className="relative group">
//                   <div className="flex items-center space-x-3">
//                     <Link to="/settings/profile" className="flex items-center space-x-2">
//                       {currentUser.photoURL ? (
//                         <img 
//                           src={currentUser.photoURL} 
//                           alt={userData?.username || 'User'} 
//                           className="h-8 w-8 rounded-full"
//                         />
//                       ) : (
//                         <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
//                           <User className="h-4 w-4 text-teal-600" />
//                         </div>
//                       )}
//                       <span className="text-sm font-medium text-gray-700">
//                         @{userData?.username}
//                       </span>
//                     </Link>
                    
//                     <button 
//                       onClick={handleLogout}
//                       className="text-gray-500 hover:text-gray-700 group flex items-center"
//                     >
//                       <LogOut className="w-5 h-5" />
//                       <span className="sr-only">Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="flex items-center space-x-2">
//                 <Link 
//                   to="/login" 
//                   className="text-teal-600 hover:text-teal-700 px-3 py-2 rounded-md text-sm font-medium flex items-center border border-teal-600 hover:bg-teal-50"
//                 >
//                   <LogIn className="w-4 h-4 mr-1" />
//                   Log in
//                 </Link>
//                 <Link 
//                   to="/signup" 
//                   className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-teal-700"
//                 >
//                   Sign up
//                 </Link>
//               </div>
//             )}
//           </div>
          
//           <div className="flex items-center sm:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
//             >
//               <span className="sr-only">Open main menu</span>
//               {isMenuOpen ? (
//                 <X className="block h-6 w-6" />
//               ) : (
//                 <Menu className="block h-6 w-6" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile menu */}
//       {isMenuOpen && (
//         <div className="sm:hidden">
//           <div className="pt-2 pb-3 space-y-1">
//             <Link
//               to="/"
//               className="bg-gray-50 border-teal-500 text-teal-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Home
//             </Link>
//             <Link
//               to="/tags"
//               className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Tags
//             </Link>
//             <Link
//               to="/users"
//               className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
//               onClick={() => setIsMenuOpen(false)}
//             >
//               Users
//             </Link>
//           </div>
          
//           <form onSubmit={handleSearch} className="px-4 pb-2">
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//               <button 
//                 type="submit" 
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//               >
//                 <Search className="w-5 h-5" />
//               </button>
//             </div>
//           </form>
          
//           <div className="pt-4 pb-3 border-t border-gray-200">
//             {currentUser ? (
//               <div>
//                 <div className="flex items-center px-4">
//                   {currentUser.photoURL ? (
//                     <img 
//                       src={currentUser.photoURL} 
//                       alt={userData?.username || 'User'} 
//                       className="h-10 w-10 rounded-full"
//                     />
//                   ) : (
//                     <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
//                       <User className="h-5 w-5 text-teal-600" />
//                     </div>
//                   )}
//                   <div className="ml-3">
//                     <div className="text-base font-medium text-gray-800">
//                       @{userData?.username}
//                     </div>
//                     <div className="text-sm font-medium text-gray-500">
//                       {currentUser.email}
//                     </div>
//                   </div>
//                   <div className="ml-auto">
//                     <button 
//                       onClick={() => setShowNotifications(!showNotifications)}
//                       className="relative text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
//                     >
//                       <Bell className="w-6 h-6" />
//                       {unreadNotifications.length > 0 && (
//                         <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                           {unreadNotifications.length}
//                         </span>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//                 <div className="mt-3 space-y-1">
//                   <Link
//                     to="/settings/profile"
//                     className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Your Profile
//                   </Link>
//                   <Link
//                     to="/ask"
//                     className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Ask Question
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
//                   >
//                     Sign out
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex flex-col space-y-2 px-4">
//                 <Link
//                   to="/login"
//                   className="block text-center px-4 py-2 border border-teal-600 rounded-md text-base font-medium text-teal-600 hover:bg-teal-50"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Log in
//                 </Link>
//                 <Link
//                   to="/signup"
//                   className="block text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Sign up
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, LogIn, Home, PlusCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const unreadNotifications = userData?.notifications.filter(n => !n.read) || [];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
                Q&A
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/' ? 'border-indigo-500 text-indigo-600' : ''
                }`}
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Link>
              <Link 
                to="/tags" 
                className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/tags' ? 'border-indigo-500 text-indigo-600' : ''
                }`}
              >
                Tags
              </Link>
              <Link 
                to="/users" 
                className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/users' ? 'border-indigo-500 text-indigo-600' : ''
                }`}
              >
                Users
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white border border-transparent focus:border-indigo-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
            
            {currentUser ? (
              <>
                <Link 
                  to="/ask" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 flex items-center shadow-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-1" />
                  Ask Question
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-100"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>
                  
                  <NotificationDropdown 
                    show={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                  />
                </div>
                
                <div className="relative group">
                  <div className="flex items-center space-x-3">
                    <Link to={`/profile/${currentUser.uid}`} className="flex items-center space-x-2">
                      {currentUser.photoURL ? (
                        <img 
                          src={currentUser.photoURL} 
                          alt={userData?.username || 'User'} 
                          className="h-8 w-8 rounded-full ring-2 ring-gray-200"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-gray-200">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
                        @{userData?.username}
                      </span>
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-600 p-1.5 rounded-full hover:bg-gray-100"
                      title="Sign out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 px-4 py-2 rounded-md text-sm font-medium flex items-center border border-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            {currentUser && (
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-gray-500 hover:text-indigo-600 p-1.5 rounded-full hover:bg-gray-100 mr-2"
              >
                <Bell className="w-6 h-6" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`${
                location.pathname === '/'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/tags"
              className={`${
                location.pathname === '/tags'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Tags
            </Link>
            <Link
              to="/users"
              className={`${
                location.pathname === '/users'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              Users
            </Link>
          </div>
          
          <form onSubmit={handleSearch} className="px-4 pb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full py-2 pl-4 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white border border-transparent focus:border-indigo-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {currentUser ? (
              <div>
                <div className="flex items-center px-4">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={userData?.username || 'User'} 
                      className="h-10 w-10 rounded-full ring-2 ring-gray-200"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-gray-200">
                      <User className="h-5 w-5 text-indigo-600" />
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      @{userData?.username}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to={`/profile/${currentUser.uid}`}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/settings/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/ask"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ask Question
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 px-4">
                <Link
                  to="/login"
                  className="block text-center px-4 py-2 border border-indigo-600 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;