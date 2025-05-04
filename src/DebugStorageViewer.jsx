import React, { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';

// Debug component to check local storage contents
const DebugStorageViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [storageContent, setStorageContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      const data = localStorage.getItem('quiz_app_data_v1');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          setStorageContent(JSON.stringify(parsed, null, 2));

          // Log to console for debugging
          console.log('Local Storage Contents:', parsed);
          if (parsed.lastSaved) {
            console.log('Last saved:', new Date(parsed.lastSaved).toLocaleString());
          }
        } catch (e) {
          setStorageContent('Invalid JSON data in local storage');
        }
      } else {
        setStorageContent('No data found in local storage');
      }
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
        title="Debug: View Local Storage"
      >
        <Eye size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Local Storage Debug</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-800">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto">
                {storageContent}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DebugStorageViewer;
