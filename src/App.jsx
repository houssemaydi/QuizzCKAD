import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, BookOpen, BarChart2, Home, Filter, RefreshCw } from 'lucide-react';

// Définition des données de quiz
const quizData = {
  questions: [
    {
      id: 1,
      chapter: "Application Design and Build",
      question: "Quelle commande permet de créer un pod nommé 'nginx-pod' avec l'image 'nginx:latest' de manière impérative?",
      options: [
        "kubectl run nginx-pod --image=nginx:latest",
        "kubectl create nginx-pod --image=nginx:latest",
        "kubectl apply -f nginx-pod --image=nginx:latest",
        "kubectl start nginx-pod --image=nginx:latest"
      ],
      correctAnswer: 0,
      explanation: "La commande 'kubectl run' est utilisée pour créer un pod de manière impérative. Les autres commandes ne sont pas correctes pour cette opération spécifique."
    },
    {
      id: 2,
      chapter: "Application Design and Build",
      question: "Quel objet Kubernetes permet d'assurer qu'un certain nombre de répliques d'un pod soient toujours en cours d'exécution?",
      options: [
        "Job",
        "Deployment",
        "StatefulSet",
        "DaemonSet"
      ],
      correctAnswer: 1,
      explanation: "Un Deployment permet de maintenir un nombre spécifié de répliques de pod. Il gère également les mises à jour et les rollbacks de manière déclarative."
    },
    {
      id: 3,
      chapter: "Application Observability and Maintenance",
      question: "Comment peut-on exposer temporairement un pod sur un port spécifique pour le debugging?",
      options: [
        "kubectl expose pod mypod --port=8080",
        "kubectl forward pod mypod --port=8080",
        "kubectl port-forward pod/mypod 8080:80",
        "kubectl debug pod/mypod --port=8080"
      ],
      correctAnswer: 2,
      explanation: "La commande 'kubectl port-forward' permet de transférer un port local vers un port sur un pod, offrant ainsi un accès temporaire pour le debugging ou les tests."
    },
    {
      id: 4,
      chapter: "Application Design and Build",
      question: "Quel type de volume Kubernetes persiste les données même après la suppression du pod?",
      options: [
        "emptyDir",
        "hostPath",
        "configMap",
        "PersistentVolumeClaim"
      ],
      correctAnswer: 3,
      explanation: "PersistentVolumeClaim (PVC) est utilisé pour demander du stockage persistant. Les données stockées dans un PVC persistent au-delà du cycle de vie du pod."
    },
    {
      id: 5,
      chapter: "Application Deployment",
      question: "Quelle est la stratégie de déploiement qui implique l'exécution de deux versions différentes d'une application simultanément, avec redirection progressive du trafic?",
      options: [
        "Rolling update",
        "Recreate",
        "Blue/Green deployment",
        "Canary deployment"
      ],
      correctAnswer: 3,
      explanation: "Un déploiement Canary implique d'exécuter deux versions et de rediriger progressivement le trafic vers la nouvelle version pour tester sa stabilité avant un déploiement complet."
    },
    {
      id: 6,
      chapter: "Application Design and Build",
      question: "Quel pattern de conception de pod multi-conteneur est utilisé pour initialiser des volumes partagés avant le démarrage du conteneur principal?",
      options: [
        "Sidecar",
        "Ambassador",
        "Adapter",
        "Init"
      ],
      correctAnswer: 3,
      explanation: "Les conteneurs Init s'exécutent et se terminent avant le démarrage des conteneurs d'application. Ils sont souvent utilisés pour configurer l'environnement ou préparer des données."
    },
    {
      id: 7,
      chapter: "Application Design and Build",
      question: "Comment créer rapidement un fichier YAML pour un Deployment avec 3 répliques sans l'appliquer au cluster?",
      options: [
        "kubectl create deploy nginx --image=nginx --replicas=3 -o yaml",
        "kubectl get deploy nginx --replicas=3 --dry-run=client -o yaml",
        "kubectl create deployment nginx --image=nginx --replicas=3 --dry-run=client -o yaml",
        "kubectl apply deploy nginx --image=nginx --replicas=3 --dry-run -o yaml"
      ],
      correctAnswer: 2,
      explanation: "La commande correcte combine l'utilisation de 'create deployment' avec les options '--dry-run=client' pour éviter l'application au cluster et '-o yaml' pour obtenir la sortie au format YAML."
    },
    {
      id: 8,
      chapter: "Application Environment, Configuration and Security",
      question: "Quelle ressource Kubernetes est utilisée pour stocker des données non confidentielles comme des variables d'environnement?",
      options: [
        "Secret",
        "ConfigMap",
        "Volume",
        "Environment"
      ],
      correctAnswer: 1,
      explanation: "ConfigMap est utilisé pour stocker des données de configuration non sensibles qui peuvent être consommées par les applications sous forme de variables d'environnement, arguments de commande ou fichiers dans un volume."
    },
    {
      id: 9,
      chapter: "Basic Concepts",
      question: "Comment peut-on voir tous les pods de tous les namespaces?",
      options: [
        "kubectl get pods --all",
        "kubectl get pods -A",
        "kubectl get pods --global",
        "kubectl get all pods"
      ],
      correctAnswer: 1,
      explanation: "L'option '-A' ou '--all-namespaces' permet de lister les ressources dans tous les namespaces. C'est l'équivalent de 'kubectl get pods --all-namespaces'."
    },
    {
      id: 10,
      chapter: "Services & Networking",
      question: "Quel type de service Kubernetes n'est accessible qu'à l'intérieur du cluster?",
      options: [
        "NodePort",
        "LoadBalancer",
        "ClusterIP",
        "ExternalName"
      ],
      correctAnswer: 2,
      explanation: "ClusterIP est le type de service par défaut qui expose le service sur une IP interne au cluster, le rendant uniquement accessible à l'intérieur du cluster."
    },
    {
      id: 11,
      chapter: "Application Environment, Configuration and Security",
      question: "Quelle annotation est nécessaire pour que les pods redémarrent automatiquement lorsque les ConfigMaps ou Secrets qu'ils utilisent sont mis à jour?",
      options: [
        "kubernetes.io/auto-update: 'true'",
        "kubernetes.io/config-reload: 'true'",
        "Aucune, cette fonctionnalité n'est pas disponible nativement",
        "kubernetes.io/refresh-config: 'true'"
      ],
      correctAnswer: 2,
      explanation: "Kubernetes ne redémarre pas automatiquement les pods lorsque les ConfigMaps ou Secrets sont mis à jour. Cette fonctionnalité nécessite des solutions externes comme ConfigMap Reload ou des opérateurs personnalisés."
    },
    {
      id: 12,
      chapter: "Application Deployment",
      question: "Quelle stratégie de mise à jour d'un Deployment minimise les temps d'indisponibilité mais garantit qu'un pourcentage maximal de pods peut être indisponible?",
      options: [
        "Recreate",
        "RollingUpdate",
        "Canary",
        "Blue/Green"
      ],
      correctAnswer: 1,
      explanation: "RollingUpdate est la stratégie par défaut qui remplace progressivement les anciens pods par de nouveaux, en respectant les paramètres maxSurge et maxUnavailable pour limiter l'indisponibilité."
    },
    {
      id: 13,
      chapter: "Application Observability and Maintenance",
      question: "Comment inspecter les événements récents dans un namespace spécifique?",
      options: [
        "kubectl logs -n my-namespace",
        "kubectl events -n my-namespace",
        "kubectl get events -n my-namespace",
        "kubectl describe events -n my-namespace"
      ],
      correctAnswer: 2,
      explanation: "La commande 'kubectl get events' permet de lister les événements dans un cluster. Avec l'option '-n my-namespace', on limite la portée à un namespace spécifique."
    },
    {
      id: 14,
      chapter: "Application Design and Build",
      question: "Quelle fonctionnalité Kubernetes permet de limiter les ressources CPU et mémoire qu'un conteneur peut utiliser?",
      options: [
        "ResourceQuota",
        "LimitRange",
        "ResourceRequest",
        "Container Resources"
      ],
      correctAnswer: 3,
      explanation: "Les ressources du conteneur (Container Resources) sont définies dans la spécification du pod sous 'resources.limits' et 'resources.requests' pour contrôler l'allocation des ressources CPU et mémoire."
    },
    {
      id: 15,
      chapter: "Application Design and Build",
      question: "Quelle est la principale différence entre un DaemonSet et un Deployment?",
      options: [
        "Un DaemonSet exécute un pod sur tous les nœuds du cluster",
        "Un DaemonSet ne peut pas être mis à jour",
        "Un Deployment ne peut pas être mis à l'échelle",
        "Un DaemonSet ne peut exécuter qu'un seul conteneur par pod"
      ],
      correctAnswer: 0,
      explanation: "Un DaemonSet garantit qu'une copie du pod s'exécute sur tous les nœuds (ou sur une sélection de nœuds), alors qu'un Deployment maintient un nombre spécifié de réplicas sans garantie sur leur emplacement."
    },
    {
      id: 16,
      chapter: "Application Environment, Configuration and Security",
      question: "Quel objet est utilisé pour gérer l'accès aux ressources Kubernetes basé sur des rôles?",
      options: [
        "SecurityContext",
        "NetworkPolicy",
        "RoleBinding",
        "PodSecurityPolicy"
      ],
      correctAnswer: 2,
      explanation: "RoleBinding lie un Role ou ClusterRole à des utilisateurs, groupes ou comptes de service, accordant ainsi les permissions définies dans le rôle aux entités spécifiées."
    },
    {
      id: 17,
      chapter: "Application Environment, Configuration and Security",
      question: "Comment créer un secret à partir d'un fichier existant?",
      options: [
        "kubectl create secret file mysecret --from-file=./secret.txt",
        "kubectl create secret generic mysecret --from-file=./secret.txt",
        "kubectl apply secret mysecret --file=./secret.txt",
        "kubectl apply -f ./secret.txt -o secret"
      ],
      correctAnswer: 1,
      explanation: "La commande correcte utilise 'create secret generic' avec l'option '--from-file' pour créer un secret à partir du contenu d'un fichier."
    },
    {
      id: 18,
      chapter: "Basic Concepts",
      question: "Quelle est la commande pour obtenir des informations détaillées sur un nœud spécifique?",
      options: [
        "kubectl get node my-node -o wide",
        "kubectl inspect node my-node",
        "kubectl describe node my-node",
        "kubectl info node my-node"
      ],
      correctAnswer: 2,
      explanation: "La commande 'kubectl describe' fournit des informations détaillées sur une ressource spécifique, y compris son état, ses événements récents et ses spécifications."
    },
    {
      id: 19,
      chapter: "Application Observability and Maintenance",
      question: "Quel type de probe est utilisé pour déterminer si un conteneur est prêt à accepter du trafic?",
      options: [
        "startupProbe",
        "healthProbe",
        "statusProbe",
        "readinessProbe"
      ],
      correctAnswer: 3,
      explanation: "readinessProbe est utilisée pour déterminer si un conteneur est prêt à recevoir du trafic. Si la probe échoue, le pod est retiré des endpoints du service."
    },
    {
      id: 20,
      chapter: "Application Observability and Maintenance",
      question: "Comment afficher les logs d'un conteneur spécifique dans un pod multi-conteneurs?",
      options: [
        "kubectl logs mypod",
        "kubectl logs mypod -c mycontainer",
        "kubectl logs mypod --container=mycontainer",
        "Les options B et C sont correctes"
      ],
      correctAnswer: 3,
      explanation: "Pour afficher les logs d'un conteneur spécifique dans un pod multi-conteneurs, on peut utiliser soit l'option '-c' soit '--container=' suivie du nom du conteneur."
    },
    {
      id: 21,
      chapter: "Advanced Concepts",
      question: "Quel mécanisme Kubernetes permet de contrôler sur quels nœuds un pod peut être programmé?",
      options: [
        "NodeSelector",
        "PodAffinity",
        "NodeAffinity",
        "Toutes les réponses sont correctes"
      ],
      correctAnswer: 3,
      explanation: "Kubernetes offre plusieurs mécanismes pour contrôler le placement des pods: NodeSelector (basé sur des labels), PodAffinity (attraction/répulsion entre pods) et NodeAffinity (règles plus avancées pour le placement sur les nœuds)."
    },
    {
      id: 22,
      chapter: "Services & Networking",
      question: "Quelle ressource Kubernetes est utilisée pour définir des règles de pare-feu pour les pods?",
      options: [
        "SecurityPolicy",
        "FirewallRules",
        "NetworkPolicy",
        "PodSecurityPolicy"
      ],
      correctAnswer: 2,
      explanation: "NetworkPolicy permet de définir des règles de trafic réseau pour les pods, spécifiant quels pods peuvent communiquer entre eux et avec quels endpoints."
    },
    {
      id: 23,
      chapter: "Application Observability and Maintenance",
      question: "Comment peut-on identifier rapidement tous les pods en état d'erreur dans le cluster?",
      options: [
        "kubectl get pods --failed",
        "kubectl get pods --state=Failed",
        "kubectl get pods --field-selector=status.phase=Failed",
        "kubectl get pods | grep Failed"
      ],
      correctAnswer: 2,
      explanation: "L'option '--field-selector' permet de filtrer les ressources selon les valeurs de certains champs. status.phase=Failed sélectionne les pods dont la phase est 'Failed'."
    },
    {
      id: 24,
      chapter: "Application Design and Build",
      question: "Quelle ressource Kubernetes permet de programmer l'exécution périodique d'un pod?",
      options: [
        "ScheduledJob",
        "TimedJob",
        "CronJob",
        "PeriodicJob"
      ],
      correctAnswer: 2,
      explanation: "CronJob permet de créer des jobs qui s'exécutent selon un planning défini en utilisant la syntaxe cron, similaire aux crontabs de Linux."
    },
    {
      id: 25,
      chapter: "Application Observability and Maintenance",
      question: "Comment peut-on voir la consommation de ressources d'un pod?",
      options: [
        "kubectl top pod mypod",
        "kubectl metrics pod mypod",
        "kubectl resource pod mypod",
        "kubectl describe pod mypod"
      ],
      correctAnswer: 0,
      explanation: "La commande 'kubectl top pod' affiche la consommation CPU et mémoire des pods. Métriques-server doit être déployé dans le cluster pour que cette commande fonctionne."
    },
    {
      id: 26,
      chapter: "Basic Concepts",
      question: "Quelle option de kubectl permet d'éditer une ressource existante dans un éditeur de texte?",
      options: [
        "kubectl modify",
        "kubectl change",
        "kubectl edit",
        "kubectl update"
      ],
      correctAnswer: 2,
      explanation: "La commande 'kubectl edit' ouvre la configuration YAML de la ressource spécifiée dans l'éditeur par défaut, permettant de modifier la ressource directement."
    },
    {
      id: 27,
      chapter: "Basic Concepts",
      question: "Quel est le moyen recommandé pour sélectionner un sous-ensemble de pods à l'aide d'étiquettes?",
      options: [
        "kubectl get pods --filter app=frontend",
        "kubectl get pods --label app=frontend",
        "kubectl get pods -l app=frontend",
        "kubectl get pods --select app=frontend"
      ],
      correctAnswer: 2,
      explanation: "L'option '-l' ou '--selector' permet de filtrer les ressources selon leurs labels. Cela permet de sélectionner les pods ayant le label 'app=frontend'."
    },
    {
      id: 28,
      chapter: "Application Design and Build",
      question: "Quelle ressource Kubernetes est utilisée pour déployer des applications avec état qui nécessitent des identités réseau stables?",
      options: [
        "Deployment",
        "ReplicaSet",
        "StatefulSet",
        "DaemonSet"
      ],
      correctAnswer: 2,
      explanation: "StatefulSet est conçu pour les applications avec état qui nécessitent une identité réseau stable, un stockage persistant et un ordre de déploiement/mise à l'échelle prévisible."
    },
    {
      id: 29,
      chapter: "Basic Concepts",
      question: "Comment vérifier l'état de santé du cluster Kubernetes?",
      options: [
        "kubectl health",
        "kubectl doctor",
        "kubectl get cs",
        "kubectl cluster-info"
      ],
      correctAnswer: 3,
      explanation: "La commande 'kubectl cluster-info' affiche l'adresse du serveur API Kubernetes et d'autres services du plan de contrôle, permettant de confirmer que le cluster est opérationnel."
    },
    {
      id: 30,
      chapter: "Basic Concepts",
      question: "Quelle commande permet d'exécuter une commande dans un conteneur déjà en cours d'exécution?",
      options: [
        "kubectl run",
        "kubectl exec",
        "kubectl execute",
        "kubectl do"
      ],
      correctAnswer: 1,
      explanation: "La commande 'kubectl exec' permet d'exécuter une commande dans un conteneur en cours d'exécution, utile pour le debugging ou l'administration."
    }
  ]
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
        Testez vos connaissances sur Kubernetes pour vous préparer à l'examen Certified Kubernetes Application Developer (CKAD)
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
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-3">
            <BookOpen size={24} className="text-blue-600 mr-2" />
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
            <BarChart2 size={24} className="text-blue-600 mr-2" />
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
              <Home size={20} />
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
                    <CheckCircle size={20} className="ml-auto text-green-600" />
                  )}
                  {showFeedback && selectedOption === index && index !== currentQs.correctAnswer && (
                    <XCircle size={20} className="ml-auto text-red-600" />
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
              <ArrowLeft size={16} className="mr-2" />
              <span>Précédent</span>
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={goToNextQuestion}
            >
              {currentQuestion < filteredQuestions.length - 1 ? (
                <>
                  <span>Suivant</span>
                  <ArrowRight size={16} className="ml-2" />
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
            <Home size={20} />
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
              <RefreshCw size={16} className="mr-2" />
              <span>Recommencer</span>
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md flex items-center justify-center"
              onClick={goToStudyMode}
            >
              <BookOpen size={16} className="mr-2" />
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
                <div key={index} className={`p-4 rounded-md border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center mb-2">
                    <span className="mr-2">
                      {isCorrect ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                    </span>
                    <span className="font-semibold">Question {index + 1}</span>
                  </div>
                  <p className="mb-2">{question.question}</p>
                  <div className="text-sm">
                    <p>
                      <span className="font-semibold">Votre réponse:</span> {userAnswer ? question.options[userAnswer.selectedOption] : 'Non répondue'}
                    </p>
                    {!isCorrect && (
                      <p>
                        <span className="font-semibold">Réponse correcte:</span> {question.options[question.correctAnswer]}
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
          <Home size={20} />
        </button>
        <h2 className="text-xl font-semibold">Mode Étude</h2>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
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
                      <CheckCircle size={20} className="ml-auto text-green-600" />
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
