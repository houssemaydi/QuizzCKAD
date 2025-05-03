import React, {useState, useEffect} from 'react';
import {ArrowLeft, ArrowRight, CheckCircle, XCircle, BookOpen, BarChart2, Home, Filter, RefreshCw} from 'lucide-react';
import data from './assets/quizz.json'
// Définition des données de quiz
const quizData = {
  questions: data
};

// Obtenir la liste des chapitres uniques
const getUniqueChapters = () => {
  return [...new Set(quizData.questions.map(q => q.chapter))];
};

// Composant principal
const CKADQuizApp = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'quiz', 'results', 'study'
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const uniqueChapters = getUniqueChapters();

  // Initialisation et filtrage des questions
  useEffect(() => {
    if (selectedChapter === 'all') {
      setFilteredQuestions(quizData.questions);
    } else {
      setFilteredQuestions(quizData.questions.filter(q => q.chapter === selectedChapter));
    }
    // Réinitialiser l'état du quiz lorsque le chapitre change
    setCurrentQuestion(0);
    setUserAnswers({});
    setScore(0);
    setShowFeedback(false);
    setSelectedOption(null);
  }, [selectedChapter]);

  // Gestion du timer
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

  // Formater le temps
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Démarrer le quiz
  const startQuiz = () => {
    setCurrentView('quiz');
    setTimerActive(true);
    setTimerSeconds(0);
    setUserAnswers({});
    setScore(0);
    setCurrentQuestion(0);
  };

  // Vérifier la réponse
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

  // Passer à la question suivante
  const goToNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    } else {
      // Fin du quiz
      setTimerActive(false);
      setCurrentView('results');
    }
  };

  // Aller à la question précédente
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prevQuestion => prevQuestion - 1);
      setShowFeedback(false);
      setSelectedOption(null);
    }
  };

  // Recommencer le quiz
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

  // Retourner à l'accueil
  const goToHome = () => {
    setCurrentView('home');
    setTimerActive(false);
  };

  // Aller au mode d'étude
  const goToStudyMode = () => {
    setCurrentView('study');
    setTimerActive(false);
  };

  // Rendu de la page d'accueil
  const renderHomePage = () => (
    <div className="flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Quiz de Préparation CKAD</h1>
      <p className="text-lg mb-8 text-center">
        Testez vos connaissances sur Kubernetes pour vous préparer à l'examen Certified Kubernetes Application Developer
        (CKAD)
      </p>

      <div className="w-full p-6 bg-white rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Sélectionnez un chapitre</h2>
        <select
          className="w-full p-3 border border-gray-300 rounded-md mb-4 bg-white"
          value={selectedChapter}
          onChange={(e) => setSelectedChapter(e.target.value)}
        >
          <option value="all">Tous les chapitres</option>
          {uniqueChapters.map(chapter => (
            <option key={chapter} value={chapter}>{chapter}</option>
          ))}
        </select>

        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {selectedChapter === 'all'
              ? `${quizData.questions.length} questions`
              : `${filteredQuestions.length} questions`}
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center"
            onClick={startQuiz}
          >
            <span className="mr-2">Commencer</span>
            <ArrowRight size={16}/>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <BookOpen size={24} className="text-blue-600 mr-2"/>
            <h2 className="text-xl font-semibold">Mode Étude</h2>
          </div>
          <p className="text-gray-600 mb-4">Parcourez toutes les questions et leurs explications sans timer</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md w-full"
            onClick={goToStudyMode}
          >
            Mode Étude
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <BarChart2 size={24} className="text-blue-600 mr-2"/>
            <h2 className="text-xl font-semibold">À propos de l'examen</h2>
          </div>
          <ul className="text-gray-600 mb-4 list-disc pl-5">
            <li>2 heures pour compléter l'examen</li>
            <li>Score de passage: 66%</li>
            <li>Basé sur Kubernetes v1.32</li>
            <li>Questions pratiques en ligne de commande</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Rendu de la page de quiz
  const renderQuizPage = () => {
    const currentQs = filteredQuestions[currentQuestion];
    const userAnswer = userAnswers[currentQs.id];

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
              {selectedChapter === 'all' ? 'Tous les chapitres' : selectedChapter}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md">
              Question {currentQuestion + 1}/{filteredQuestions.length}
            </div>
            <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md">
              Temps: {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <div className="text-sm text-gray-500 mb-2">{currentQs.chapter}</div>
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
              <p className="font-semibold">Explication:</p>
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
              <span>Précédent</span>
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={goToNextQuestion}
            >
              {currentQuestion < filteredQuestions.length - 1 ? (
                <>
                  <span>Suivant</span>
                  <ArrowRight size={16} className="ml-2"/>
                </>
              ) : (
                <span>Terminer</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu de la page de résultats
  const renderResultsPage = () => {
    const percentage = (score / filteredQuestions.length) * 100;
    const isPassing = percentage >= 66; // Seuil de réussite CKAD

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"
            onClick={goToHome}
          >
            <Home size={20}/>
          </button>
          <h2 className="text-xl font-semibold">Résultats du Quiz</h2>
          <div></div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            {isPassing ? '🎉 Félicitations!' : '💪 Continuez à vous entraîner!'}
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
                ? 'Vous avez atteint le seuil de réussite de 66% pour l\'examen CKAD!'
                : 'Le seuil de réussite pour l\'examen CKAD est de 66%.'}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-gray-600">
              Temps total: {formatTime(timerSeconds)}
            </div>
            <div className="text-gray-600">
              Temps moyen par question: {formatTime(Math.round(timerSeconds / filteredQuestions.length))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center justify-center"
              onClick={restartQuiz}
            >
              <RefreshCw size={16} className="mr-2"/>
              <span>Recommencer</span>
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center justify-center"
              onClick={goToStudyMode}
            >
              <BookOpen size={16} className="mr-2"/>
              <span>Mode Étude</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Récapitulatif des réponses</h3>

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
                        className="font-semibold">Votre réponse:</span> {userAnswer ? question.options[userAnswer.selectedOption] : 'Non répondue'}
                    </p>
                    {!isCorrect && (
                      <p>
                        <span
                          className="font-semibold">Réponse correcte:</span> {question.options[question.correctAnswer]}
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

  // Rendu du mode étude
  const renderStudyMode = () => (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md"
          onClick={goToHome}
        >
          <Home size={20}/>
        </button>
        <h2 className="text-xl font-semibold">Mode Étude</h2>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500"/>
          <select
            className="p-2 border border-gray-300 rounded-md bg-white"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <option value="all">Tous les chapitres</option>
            {uniqueChapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {filteredQuestions.map((question, qIndex) => (
          <div key={qIndex} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-sm text-gray-500 mb-2">
              {question.chapter} • Question {qIndex + 1}
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
              <p className="font-semibold">Explication:</p>
              <p>{question.explanation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Rendu conditionnel en fonction de la vue actuelle
  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === 'home' && renderHomePage()}
      {currentView === 'quiz' && renderQuizPage()}
      {currentView === 'results' && renderResultsPage()}
      {currentView === 'study' && renderStudyMode()}
    </div>
  );
};

export default CKADQuizApp;
