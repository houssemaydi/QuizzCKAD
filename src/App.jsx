import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  BookOpen, BarChart2, Home, Filter, RefreshCw,
  Settings
} from 'lucide-react';
import { getChaptersForCategory, filterQuestions } from './quizFileScanner';
import { useQuizFilesWithStorage } from './quizStorageManager';
import AdminQuizManager from './AdminQuizManager';
import SaveIndicator from './SaveIndicator';
import DebugStorageViewer from "./DebugStorageViewer";

// Main quiz application component
const DynamicQuizApp = () => {
  // Quiz file data with persistence
  const { quizzes, updateQuizzes, loading, error, reloadFromAssets, saveMessage } = useQuizFilesWithStorage();
  const [allQuestions, setAllQuestions] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  // Quiz state
  const [currentView, setCurrentView] = useState('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);

  // Combine all quiz questions when quizzes load
  useEffect(() => {
    const allLoadedQuestions = quizzes.flatMap(quiz => quiz.questions);
    setAllQuestions(allLoadedQuestions);
    setFilteredQuestions(allLoadedQuestions);
  }, [quizzes]);

  // Get unique categories
  const uniqueCategories = [...new Set(allQuestions.map(q => q.category))];

  // Update available chapters when category changes
  useEffect(() => {
    if (selectedCategory !== 'all') {
      setAvailableChapters(getChaptersForCategory(allQuestions, selectedCategory));
    } else {
      setAvailableChapters([]);
    }
    // Reset chapter selection when category changes
    setSelectedChapter('all');
  }, [selectedCategory, allQuestions]);

  // Filter questions based on selected category and chapter
  useEffect(() => {
    const filtered = filterQuestions(allQuestions, selectedCategory, selectedChapter);
    setFilteredQuestions(filtered);

    // Reset quiz state when filters change
    setCurrentQuestion(0);
    setUserAnswers({});
    setScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
  }, [selectedCategory, selectedChapter, allQuestions]);

  // Timer management
  useEffect(() => {
    let interval;
    if (timerActive && currentView === 'quiz') {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, currentView]);

  // Format time display
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Start the quiz
  const startQuiz = () => {
    setCurrentView('quiz');
    setTimerActive(true);
    setTimerSeconds(0);
    setUserAnswers({});
    setScore(0);
    setCurrentQuestion(0);
  };

  // Check answer
  const checkAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setShowFeedback(true);

    const isCorrect = optionIndex === filteredQuestions[currentQuestion].correctAnswer;
    const updatedAnswers = {
      ...userAnswers,
      [filteredQuestions[currentQuestion].id]: {
        selectedOption: optionIndex,
        isCorrect
      }
    };

    setUserAnswers(updatedAnswers);

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
  };

  // Go to next question
  const goToNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    } else {
      // End of quiz
      setTimerActive(false);
      setCurrentView('results');
    }
  };

  // Go to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prevQuestion => prevQuestion - 1);
      setShowFeedback(false);
      setSelectedOption(null);
    }
  };

  // Restart quiz
  const restartQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
    setTimerSeconds(0);
    setTimerActive(true);
    setCurrentView('quiz');
  };

  // Go to home
  const goToHome = () => {
    setCurrentView('home');
    setTimerActive(false);
  };

  // Go to study mode
  const goToStudyMode = () => {
    setCurrentView('study');
    setTimerActive(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Quiz Data...</h2>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render home page
  const renderHomePage = () => (
    <div className="flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center w-full mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Multi-Topic Quiz App</h1>
        <button
          onClick={() => setShowAdmin(true)}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
          title="Admin Panel"
        >
          <Settings size={24} className="text-gray-600" />
        </button>
      </div>
      <p className="text-lg mb-8 text-center">
        Test your knowledge on various topics with our comprehensive quiz app
      </p>

      <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Select a Category</h2>
        <select
          className="w-full p-3 border border-gray-300 rounded-md mb-4 bg-white"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {uniqueCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        {selectedCategory !== 'all' && availableChapters.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Select a Chapter</h2>
            <select
              className="w-full p-3 border border-gray-300 rounded-md mb-4 bg-white"
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
            >
              <option value="all">All Chapters</option>
              {availableChapters.map(chapter => (
                <option key={chapter} value={chapter}>{chapter}</option>
              ))}
            </select>
          </>
        )}

        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {filteredQuestions.length} questions available
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center"
            onClick={startQuiz}
            disabled={filteredQuestions.length === 0}
          >
            <span className="mr-2">Start Quiz</span>
            <ArrowRight size={16}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <BookOpen size={24} className="text-blue-600 mr-2"/>
            <h2 className="text-xl font-semibold">Study Mode</h2>
          </div>
          <p className="text-gray-600 mb-4">Browse all questions and explanations without a timer</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
            onClick={goToStudyMode}
            disabled={filteredQuestions.length === 0}
          >
            Study Mode
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <BarChart2 size={24} className="text-blue-600 mr-2"/>
            <h2 className="text-xl font-semibold">Available Topics</h2>
          </div>
          <ul className="text-gray-600 mb-4 list-disc pl-5">
            {quizzes.map(quiz => (
              <li key={quiz.id}>
                <strong>{quiz.name}</strong>: {quiz.questions.length} questions
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  // Render quiz page
  const renderQuizPage = () => {
    if (filteredQuestions.length === 0) {
      return (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"
              onClick={goToHome}
            >
              <Home size={20}/>
            </button>
            <h2 className="text-xl font-semibold">No Questions Available</h2>
            <div></div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <p className="mb-4">There are no questions available with the current filters.</p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              onClick={goToHome}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    const currentQs = filteredQuestions[currentQuestion];

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md mr-2"
              onClick={goToHome}
            >
              <Home size={20}/>
            </button>
            <h2 className="text-xl font-semibold">
              {currentQs.category} - {currentQs.chapter}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md">
              Question {currentQuestion + 1}/{filteredQuestions.length}
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">
              Time: {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="text-sm text-gray-500 mb-2">{currentQs.category} - {currentQs.chapter}</div>
          <h3 className="text-xl font-semibold mb-4">{currentQs.question}</h3>

          <div className="space-y-3 mb-6">
            {currentQs.options.map((option, index) => (
              <button
                key={index}
                className={`w-full text-left p-3 rounded-md transition-colors border ${
                  selectedOption === index
                    ? showFeedback
                      ? index === currentQs.correctAnswer
                        ? 'bg-green-100 border-green-500'
                        : 'bg-red-100 border-red-500'
                      : 'bg-blue-100 border-blue-500'
                    : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => !showFeedback && checkAnswer(index)}
                disabled={showFeedback}
              >
                <div className="flex items-center">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-center text-sm leading-6 mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showFeedback && index === currentQs.correctAnswer && (
                    <CheckCircle size={20} className="ml-auto text-green-600"/>
                  )}
                  {showFeedback && selectedOption === index && index !== currentQs.correctAnswer && (
                    <XCircle size={20} className="ml-auto text-red-600"/>
                  )}
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-md mb-4 ${
              selectedOption === currentQs.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className="font-semibold">Explanation:</p>
              <p>{currentQs.explanation}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center disabled:opacity-50"
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft size={16} className="mr-2"/>
              <span>Previous</span>
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={goToNextQuestion}
            >
              {currentQuestion < filteredQuestions.length - 1 ? (
                <>
                  <span>Next</span>
                  <ArrowRight size={16} className="ml-2"/>
                </>
              ) : (
                <span>Finish</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render results page
  const renderResultsPage = () => {
    const percentage = (score / filteredQuestions.length) * 100;
    const isPassing = percentage >= 70; // Generic passing threshold

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"
            onClick={goToHome}
          >
            <Home size={20}/>
          </button>
          <h2 className="text-xl font-semibold">Quiz Results</h2>
          <div></div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {isPassing ? '🎉 Congratulations!' : '💪 Keep practicing!'}
          </h3>

          <div className="mb-6">
            <div className="text-4xl font-bold mb-2">
              {score}/{filteredQuestions.length}
            </div>
            <div className={`text-2xl font-semibold ${isPassing ? 'text-green-600' : 'text-orange-600'}`}>
              {percentage.toFixed(1)}%
            </div>
            <div className="text-gray-600 mt-2">
              {isPassing
                ? 'You have reached the passing threshold of 70%!'
                : 'The passing threshold is 70%.'}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-gray-600">
              Total time: {formatTime(timerSeconds)}
            </div>
            <div className="text-gray-600">
              Average time per question: {formatTime(Math.round(timerSeconds / filteredQuestions.length))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center justify-center"
              onClick={restartQuiz}
            >
              <RefreshCw size={16} className="mr-2"/>
              <span>Try Again</span>
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center justify-center"
              onClick={goToStudyMode}
            >
              <BookOpen size={16} className="mr-2"/>
              <span>Study Mode</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Answer Summary</h3>

          <div className="space-y-4">
            {filteredQuestions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer && userAnswer.isCorrect;

              return (
                <div key={index}
                     className={`p-4 rounded-md border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center mb-2">
                    <span className="mr-2">
                      {isCorrect ? (
                        <CheckCircle size={20} className="text-green-600"/>
                      ) : (
                        <XCircle size={20} className="text-red-600"/>
                      )}
                    </span>
                    <span className="font-semibold">Question {index + 1}</span>
                  </div>
                  <p className="mb-2">{question.question}</p>
                  <div className="text-sm">
                    <p>
                      <span
                        className="font-semibold">Your answer:</span> {userAnswer ? question.options[userAnswer.selectedOption] : 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p>
                        <span
                          className="font-semibold">Correct answer:</span> {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render study mode
  const renderStudyMode = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"
          onClick={goToHome}
        >
          <Home size={20}/>
        </button>
        <h2 className="text-xl font-semibold">Study Mode</h2>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500"/>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              className="p-2 border border-gray-300 rounded-md bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {selectedCategory !== 'all' && availableChapters.length > 0 && (
              <select
                className="p-2 border border-gray-300 rounded-md bg-white"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                <option value="all">All Chapters</option>
                {availableChapters.map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="mb-4">There are no questions available with the current filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((question, qIndex) => (
            <div key={qIndex} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-sm text-gray-500 mb-2">
                {question.category} - {question.chapter} • Question {qIndex + 1}
              </div>
              <h3 className="text-xl font-semibold mb-4">{question.question}</h3>

              <div className="space-y-3 mb-6">
                {question.options.map((option, oIndex) => (
                  <div
                    key={oIndex}
                    className={`p-3 rounded-md border ${
                      oIndex === question.correctAnswer
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-center text-sm leading-6 mr-3">
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <span>{option}</span>
                      {oIndex === question.correctAnswer && (
                        <CheckCircle size={20} className="ml-auto text-green-600"/>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-md bg-blue-50 border border-blue-200">
                <p className="font-semibold">Explanation:</p>
                <p>{question.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'home' && renderHomePage()}
      {currentView === 'quiz' && renderQuizPage()}
      {currentView === 'results' && renderResultsPage()}
      {currentView === 'study' && renderStudyMode()}

      {showAdmin && (
        <AdminQuizManager
          quizzes={quizzes}
          setQuizzes={updateQuizzes}
          onClose={() => setShowAdmin(false)}
          reloadFromAssets={async () => {
            if (await reloadFromAssets()) {
              setShowAdmin(false);
            }
          }}
        />
      )}

      {/* Debug viewer to check local storage */}
      <DebugStorageViewer />

      {/* Save indicator */}
      <SaveIndicator message={saveMessage} />
    </div>
  );
};

export default DynamicQuizApp;
