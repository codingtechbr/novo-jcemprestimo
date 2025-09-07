// firebase.js

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBWbV61dyDBuMkpde2O4RnbcZNkJptso-A",
  authDomain: "jc-emprestimo.firebaseapp.com",
  projectId: "jc-emprestimo",
  storageBucket: "jc-emprestimo.appspot.com",
  messagingSenderId: "883401573812",
  appId: "1:883401573812:web:b791e0536e217893e51ee1",
  measurementId: "G-8S7NBRKR7J"
};

// Verifica se o Firebase já foi inicializado. Se não, inicializa.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Usa o Firebase app existente
}

// Inicializa o Firestore e a autenticação
const db = firebase.firestore();
const auth = firebase.auth();

// Tornar o db e auth acessíveis globalmente para uso nas outras páginas
window.db = db;
window.auth = auth;
