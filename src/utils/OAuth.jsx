import { useLocation, useNavigate } from 'react-router-dom'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import googleIcon from '../assets/svg/googleIcon.svg'

function OAuth() {
	const navigate = useNavigate()
	const location = useLocation()

	const onGoogleClick = async () => {
		try {
			const auth = getAuth()
			const provider = new GoogleAuthProvider()
			provider.setCustomParameters({
				prompt: 'select_account',
			})
			const result = await signInWithPopup(auth, provider)
			const user = result.user

			// Check for user, from db
			const docRef = doc(db, 'users', user.uid)
			const docSnap = await getDoc(docRef)
			console.log(docSnap)

			// If user doesn't exist, create user
			if (!docSnap.exists()) {
				await setDoc(doc(db, 'users', user.uid), {
					name: user.displayName,
					email: user.email,
					timestamp: serverTimestamp(),
				})
			}
			navigate('/profile')
		} catch (error) {
			//console.log(error)
			toast.error('Could not authorize with Google')
		}
	}

	return (
		<div className='socialLogin'>
			<p>
				{location.pathname === '/login' ? 'Login' : 'Greate acount'} with{' '}
				<button className='socialIconDiv' onClick={onGoogleClick}>
					<img className='socialIconImg' src={googleIcon} alt='google' />
				</button>
			</p>
		</div>
	)
}

export default OAuth
