import React, { useState, useEffect } from 'react';
import { Plus, Download, Edit, Save, X, Trash2, Upload, FolderPlus, RefreshCw } from 'lucide-react';
import { exportQuizData, importQuizData } from './quizStorageManager';

// Admin component for managing quiz files
const AdminQuizManager = ({ quizzes, setQuizzes, onClose, reloadFromAssets }) => {
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newQuizName, setNewQuizName] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Download all quiz files
  const downloadAllQuizzes = () => {
    exportQuizData(quizzes);
  };

  // Download a single quiz file
  const downloadQuiz = (quiz) => {
    exportQuizData([quiz]);
  };

  // Start editing a quiz
  const startEditingQuiz = (quiz) => {
    setEditingQuiz({...quiz});
    setEditingQuestion(null);
  };

  // Save edited quiz
  const saveQuiz = () => {
    const updatedQuizzes = quizzes.map(q =>
      q.id === editingQuiz.id ? editingQuiz : q
    );
    setQuizzes(updatedQuizzes);
    setEditingQuiz(null);
  };

  // Add new question to current quiz
  const addNewQuestion = () => {
    const newQuestion = {
      id: Math.max(...editingQuiz.questions.map(q => q.id), 0) + 1,
      category: editingQuiz.name,
      chapter: "New Chapter",
      question: "New question?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "Add explanation here"
    };

    setEditingQuiz({
      ...editingQuiz,
      questions: [...editingQuiz.questions, newQuestion]
    });
  };

  // Delete question
  const deleteQuestion = (questionId) => {
    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.filter(q => q.id !== questionId)
    });
  };

  // Update question
  const updateQuestion = (updatedQuestion) => {
    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    });
  };

  // Create new quiz file
  const createNewQuiz = () => {
    if (!newQuizName.trim()) return;

    const newQuiz = {
      id: newQuizName.toLowerCase().replace(/\s+/g, '-'),
      name: newQuizName,
      questions: []
    };

    const updatedQuizzes = [...quizzes, newQuiz];
    setQuizzes(updatedQuizzes);
    setShowCreateNew(false);
    setNewQuizName('');
    startEditingQuiz(newQuiz);
  };

  // Upload quiz file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const newQuiz = await importQuizData(file);
      const updatedQuizzes = [...quizzes, newQuiz];
      setQuizzes(updatedQuizzes);
      setShowUpload(false);
    } catch (error) {
      console.error('Error importing quiz file:', error);
      alert('Error parsing JSON file. Please check the file format.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Quiz Manager</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {editingQuiz ? (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{editingQuiz.name}</h3>
                  <p className="text-gray-600">{editingQuiz.questions.length} questions</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveQuiz}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingQuiz(null)}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <button
                onClick={addNewQuestion}
                className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Question
              </button>

              <div className="space-y-6">
                {editingQuiz.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Question {index + 1}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingQuestion(editingQuestion?.id === question.id ? null : question)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    {editingQuestion?.id === question.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Chapter</label>
                          <input
                            type="text"
                            value={question.chapter}
                            onChange={(e) => updateQuestion({...question, chapter: e.target.value})}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Question</label>
                          <textarea
                            value={question.question}
                            onChange={(e) => updateQuestion({...question, question: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Options</label>
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2 mb-2">
                              <input
                                type="radio"
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion({...question, correctAnswer: optionIndex})}
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion({...question, options: newOptions});
                                }}
                                className="flex-1 p-2 border rounded"
                              />
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Explanation</label>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion({...question, explanation: e.target.value})}
                            className="w-full p-2 border rounded"
                            rows="2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">{question.chapter}</p>
                        <p className="font-medium mb-2">{question.question}</p>
                        <ul className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <li key={optionIndex} className={`text-sm ${optionIndex === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex gap-3">
                <button
                  onClick={() => setShowCreateNew(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FolderPlus size={16} className="mr-2" />
                  Create New Quiz
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Upload size={16} className="mr-2" />
                  Upload Quiz
                </button>
                <button
                  onClick={downloadAllQuizzes}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Download All
                </button>
                <button
                  onClick={reloadFromAssets}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md flex items-center"
                  title="Reload from original files"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reset to Original
                </button>
              </div>

              {showCreateNew && (
                <div className="mb-6 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Create New Quiz</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newQuizName}
                      onChange={(e) => setNewQuizName(e.target.value)}
                      placeholder="Enter quiz name"
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={createNewQuiz}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                      disabled={!newQuizName.trim()}
                    >
                      Create
                    </button>
                    <button
                      onClick={() => setShowCreateNew(false)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showUpload && (
                <div className="mb-6 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Upload Quiz File</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setShowUpload(false)}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{quiz.name}</h3>
                      <p className="text-sm text-gray-600">{quiz.questions.length} questions</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditingQuiz(quiz)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => downloadQuiz(quiz)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Download size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuizManager;
