import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

// Simple save indicator component
const SaveIndicator = ({ message, duration = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-fade-in">
      <CheckCircle size={16} />
      {message}
    </div>
  );
};

export default SaveIndicator;
