// Nativa Productos Naturales - Firebase Client Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Credenciales oficiales cargadas desde firebase-applet-config.json
export const firebaseConfig = {
  projectId: "apt-lambda-8gmzr",
  appId: "1:527562195327:web:988b4caebd91e9f7401a4a",
  apiKey: "AIzaSyBCoJ6wJUni7hHhK04ohGKylmJYzZHej2Q",
  authDomain: "apt-lambda-8gmzr.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-native-1641c3e6-1620-480c-b06d-13dff000c7e5",
  storageBucket: "apt-lambda-8gmzr.firebasestorage.app",
  messagingSenderId: "527562195327",
  oAuthClientId: "527562195327-36lva980830q2fo0prf5op2jmef20bvv.apps.googleusercontent.com"
};

// Inicialización de la aplicación Firebase en el navegador
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Prueba de conexión con la base de datos Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Conexión exitosa con Firestore (Nativa)");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Cliente offline o sin conexión directa a Firebase.");
    } else {
      console.log("Prueba de conexión Firestore:", error.message);
    }
    return false;
  }
}

// Helper para guardar o actualizar perfil de usuario en Firestore
export async function saveUserProfile(user) {
  if (!user || !user.email) return;
  try {
    const userDocId = user.uid || user.email.replace(/[^a-zA-Z0-9]/g, '_');
    const userRef = doc(db, 'users', userDocId);
    await setDoc(userRef, {
      name: user.name || '',
      lastname: user.lastname || '',
      email: user.email,
      phone: user.phone || '',
      authProvider: user.provider || 'local',
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log("Usuario sincronizado con Firestore:", user.email);
  } catch (err) {
    console.warn("No se pudo guardar el usuario en Firestore:", err.message);
  }
}

// Helper para registrar un pedido en Firestore
export async function saveOrderToFirestore(order) {
  if (!order || !order.id) return;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      createdAt: order.createdAt || new Date().toISOString()
    }, { merge: true });
    console.log("Pedido guardado en Firestore:", order.id);
  } catch (err) {
    console.warn("Error guardando pedido en Firestore:", err.message);
  }
}

// Helper para buscar un pedido por código en Firestore
export async function getOrderFromFirestore(orderId) {
  if (!orderId) return null;
  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("Error buscando pedido en Firestore:", err.message);
  }
  return null;
}

// Ejecución automática de prueba de conexión al cargar el módulo
testConnection();
