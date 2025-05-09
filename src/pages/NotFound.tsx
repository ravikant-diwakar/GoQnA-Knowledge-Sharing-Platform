import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, HelpCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-red-600">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
        <p className="mt-2 text-lg text-gray-600">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            to="/"
            className="block w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Home className="w-5 h-5 inline-block mr-2" />
            Go to homepage
          </Link>
          <Link
            to="/search"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Search className="w-5 h-5 inline-block mr-2" />
            Search for content
          </Link>
          <a
            href="#"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <HelpCircle className="w-5 h-5 inline-block mr-2" />
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;