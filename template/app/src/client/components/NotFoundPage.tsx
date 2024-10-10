import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='text-center'>
        <h1 className='text-6xl font-bold  mb-4'>404</h1>
        <p className='text-lg text-bodydark mb-8'>Oops! The page you're looking for doesn't exist.</p>
        <Link
          to='/'
          className='inline-block px-8 py-3 text-white bg-primary rounded-lg hover:bg-secondary transition duration-300'
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
