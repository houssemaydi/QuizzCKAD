// quizFileScanner.js
import { useEffect, useState } from 'react';

/**
 * Custom hook to scan and load all quiz files from the assets directory
 * This uses Vite's import.meta.glob feature to dynamically import all JSON files
 * @returns {Object} { quizzes, loading, error }
 */
export const useQuizFiles = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuizFiles = async () => {
      try {
        // Get all JSON files from the assets directory
        // This uses Vite's import.meta.glob feature
        const quizModules = import.meta.glob('/src/assets/*.json');

        // Array to hold all quiz data
        const loadedQuizzes = [];

        // Process each file
        for (const path in quizModules) {
          try {
            // Extract the file name without extension to use as category
            const fileName = path.split('/').pop().replace('.json', '');

            // Dynamically import the module
            const module = await quizModules[path]();

            // Process the quiz data
            loadedQuizzes.push({
              id: fileName,
              name: formatQuizName(fileName), // Convert file name to readable format
              questions: processQuestions(module.default, fileName)
            });
          } catch (fileError) {
            console.error(`Error loading quiz file ${path}:`, fileError);
            // Continue loading other files even if one fails
          }
        }

        setQuizzes(loadedQuizzes);
        setLoading(false);
      } catch (err) {
        console.error('Error scanning quiz files:', err);
        setError('Failed to load quiz files. Please check the console for details.');
        setLoading(false);
      }
    };

    loadQuizFiles();
  }, []);

  return { quizzes, loading, error };
};

/**
 * Format a file name into a readable quiz name
 * @param {string} fileName - The file name without extension
 * @returns {string} - Formatted name
 */
const formatQuizName = (fileName) => {
  // Convert kebab-case or snake_case to Title Case
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
    // Ensure each question has a category field
    category: question.category || formatQuizName(defaultCategory)
  }));
};

/**
 * Get all unique chapters for a specific category
 * @param {Array} questions - All questions
 * @param {string} category - Category name
 * @returns {Array} - Unique chapters
 */
export const getChaptersForCategory = (questions, category) => {
  const categoryQuestions = questions.filter(q => q.category === category);
  return [...new Set(categoryQuestions.map(q => q.chapter))];
};

/**
 * Filter questions by category and chapter
 * @param {Array} questions - All questions
 * @param {string} category - Selected category
 * @param {string} chapter - Selected chapter
 * @returns {Array} - Filtered questions
 */
export const filterQuestions = (questions, category, chapter) => {
  let filtered = questions;

  if (category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }

  if (chapter !== 'all') {
    filtered = filtered.filter(q => q.chapter === chapter);
  }

  return filtered;
};
