// quizStorageManager.js
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'quiz_app_data_v1';

/**
 * Hook to manage quiz files with persistence
 * @returns {Object} Quiz files with persistence
 */
export const useQuizFilesWithStorage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // Load quizzes from local storage or default files
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        // Try to load from local storage first
        const savedData = localStorage.getItem(STORAGE_KEY);
        console.log('Checking local storage...', STORAGE_KEY);

        if (savedData) {
          const storageObject = JSON.parse(savedData);
          const parsedData = storageObject.data || storageObject; // Handle both old and new format
          console.log('Loaded from local storage:', parsedData);
          setQuizzes(parsedData);
          setLoading(false);
          return;
        }

        // If no saved data, load from assets
        console.log('Loading from assets...');
        const loadedQuizzes = await loadDefaultQuizzes();

        setQuizzes(loadedQuizzes);

        // Save to local storage immediately after loading
        saveToStorage(loadedQuizzes);

        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz files:', err);
        setError('Failed to load quiz files');
        setLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  // Save to local storage with timestamp
  const saveToStorage = (data) => {
    try {
      const dataWithTimestamp = {
        data: data,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      console.log('Quiz data saved to local storage at:', dataWithTimestamp.lastSaved);
      setSaveMessage('Data saved successfully');
    } catch (err) {
      console.error('Error saving to local storage:', err);
      setError('Failed to save quiz data');
      setSaveMessage('Error saving data');
    }
  };

  // Update quizzes in state and local storage
  const updateQuizzes = (updatedQuizzes) => {
    console.log('Updating quizzes:', updatedQuizzes);
    setQuizzes(updatedQuizzes);
    saveToStorage(updatedQuizzes);
  };

  // Reload quizzes from asset files
  const reloadFromAssets = async () => {
    try {
      setLoading(true);

      // Clear local storage
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared local storage');

      // Load from assets again
      const loadedQuizzes = await loadDefaultQuizzes();

      setQuizzes(loadedQuizzes);
      saveToStorage(loadedQuizzes);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error reloading from assets:', err);
      setError('Failed to reload quiz files');
      setLoading(false);
      return false;
    }
  };

  return { quizzes, updateQuizzes, loading, error, reloadFromAssets, saveMessage };
};

// Extract loading logic to reusable function
const loadDefaultQuizzes = async () => {
  const quizModules = import.meta.glob('/src/assets/*.json');
  const loadedQuizzes = [];

  for (const path in quizModules) {
    try {
      const fileName = path.split('/').pop().replace('.json', '');
      const module = await quizModules[path]();

      loadedQuizzes.push({
        id: fileName,
        name: formatQuizName(fileName),
        questions: processQuestions(module.default, fileName)
      });
    } catch (fileError) {
      console.error(`Error loading quiz file ${path}:`, fileError);
    }
  }

  console.log('Loaded from assets:', loadedQuizzes);
  return loadedQuizzes;
};


/**
 * Format a file name into a readable quiz name
 * @param {string} fileName - The file name without extension
 * @returns {string} - Formatted name
 */
const formatQuizName = (fileName) => {
  return fileName
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Process questions to ensure they have category and other required fields
 * @param {Array} questions - Array of question objects
 * @param {string} defaultCategory - Default category name from file name
 * @returns {Array} - Processed questions
 */
const processQuestions = (questions, defaultCategory) => {
  if (!Array.isArray(questions)) {
    console.error('Invalid question data format in quiz file:', defaultCategory);
    return [];
  }

  return questions.map(question => ({
    ...question,
    category: question.category || formatQuizName(defaultCategory)
  }));
};

/**
 * Export quiz data as files
 * @param {Array} quizzes - Array of quiz objects
 */
export const exportQuizData = (quizzes) => {
  quizzes.forEach(quiz => {
    const blob = new Blob([JSON.stringify(quiz.questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

/**
 * Import quiz data from files
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} - Quiz object
 */
export const importQuizData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const questions = JSON.parse(e.target.result);
        const quizName = file.name.replace('.json', '');
        const newQuiz = {
          id: quizName,
          name: formatQuizName(quizName),
          questions: questions
        };
        resolve(newQuiz);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
