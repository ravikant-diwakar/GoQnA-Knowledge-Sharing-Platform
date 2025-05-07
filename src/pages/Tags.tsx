import React from 'react';

const Tags = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tags</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tags will be populated dynamically */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">javascript</h3>
          <p className="text-gray-500 text-sm">
            For questions about programming in ECMAScript (JavaScript/JS) and its different implementations.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            1,234 questions
          </div>
        </div>
        {/* More tag placeholders */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">python</h3>
          <p className="text-gray-500 text-sm">
            Python is a multi-paradigm, dynamically typed, multi-purpose programming language.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            987 questions
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">react</h3>
          <p className="text-gray-500 text-sm">
            React is a JavaScript library for building user interfaces.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            756 questions
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tags;