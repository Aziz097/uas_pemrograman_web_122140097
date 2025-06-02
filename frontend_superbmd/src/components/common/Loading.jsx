// src/components/common/Loading.jsx
import React from 'react';

const Loading = ({ text = 'Loading...', size = 'medium' }) => {
  // Size variants
  const sizeClasses = {
    small: {
      container: 'h-32',
      circle: 'h-10 w-10',
      innerCircle: 'h-5 w-5',
      text: 'text-sm'
    },
    medium: {
      container: 'h-64',
      circle: 'h-16 w-16',
      innerCircle: 'h-8 w-8',
      text: 'text-lg'
    },
    large: {
      container: 'h-80',
      circle: 'h-20 w-20',
      innerCircle: 'h-10 w-10',
      text: 'text-xl'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`flex items-center justify-center ${classes.container} w-full`}>
      <div className="animate-pulse flex flex-col items-center">
        <div className={`${classes.circle} bg-green-200 dark:bg-green-800 rounded-full mb-4 flex items-center justify-center`}>
          <div className={`${classes.innerCircle} bg-green-400 dark:bg-green-600 rounded-full animate-ping`}></div>
        </div>
        <div className={`text-green-600 dark:text-green-400 font-medium ${classes.text}`}>{text}</div>
      </div>
    </div>
  );
};

export default Loading;
