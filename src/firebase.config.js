import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: 'AIzaSyArsSKb6G8hvMFEaPNgzsGi1bYUBiMy00s',
	authDomain: 'mern-project-bc875.firebaseapp.com',
	projectId: 'mern-project-bc875',
	storageBucket: 'mern-project-bc875.appspot.com',
	messagingSenderId: '1057541103990',
	appId: '1:1057541103990:web:82a0dc7e4c84eccc245a57',
}

// Initialize Firebase
initializeApp(firebaseConfig)
export const db = getFirestore()
