// firebaseConfig.js
const firebaseConfig = {
    apiKey: "AIzaSyBDUbbcLTezGK8Du8aUVw8sKru6D4m7-Z4",
    authDomain: "ai-summarizer-22466.firebaseapp.com",
    projectId: "ai-summarizer-22466",
    storageBucket: "ai-summarizer-22466.appspot.com",
    messagingSenderId: "45956151708",
    appId: "1:45956151708:web:35bb199a7b19ad0faf3059",
    measurementId: "G-2W1C8CV17E"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore(); // Global variable `db`
  