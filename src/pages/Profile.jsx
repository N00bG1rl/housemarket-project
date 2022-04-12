import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.config'

import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {
	const auth = getAuth()
	const navigate = useNavigate()

	const [changeDetails, setChangeDetails] = useState(false)

	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	})

	const { name, email } = formData

	const onLogout = () => {
		auth.signOut()
		navigate('/')
	}

	const onSubmit = async () => {
		try {
			if (auth.currentUser.displayName !== name) {
				// Update display name in firebase
				await updateProfile(auth.currentUser, {
					displayName: name,
				})

				// Update in firestore auth
				const userRef = doc(db, 'users', auth.currentUser.uid)
				await updateDoc(userRef, {
					name,
				})
			}
		} catch (error) {
			toast.error('Could not update profile details.')
		}
	}

	const onChange = e => {
		setFormData(state => ({
			...state,
			[e.target.id]: e.target.value,
		}))
	}

	return (
		<div className='profile'>
			<header className='profileHeader'>
				<p className='pageHeader'>My profile</p>
				<h1>{name}</h1>
				<button type='button' className='logOut' onClick={onLogout}>
					Log out
				</button>
			</header>

			<main>
				<div className='profileDetailsHeader'>
					<p className='profileDetailsText'>Personal details</p>
					<p
						className='changePersonalDetails'
						onClick={() => {
							changeDetails && onSubmit()
							setChangeDetails(state => !state)
						}}
					>
						{changeDetails ? 'done' : 'change'}
					</p>
				</div>
				<div className='profileCard'>
					<form>
						<input
							type='text'
							name='name'
							id='name'
							className={!changeDetails ? 'profileName' : 'profileNameActive'}
							disabled={!changeDetails}
							value={name}
							onChange={onChange}
						/>
						<input
							type='text'
							name='email'
							id='email'
							className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
							disabled={!changeDetails}
							value={email}
							onChange={onChange}
						/>
					</form>
				</div>

				<Link to='/create-listing' className='createListing'>
					<img src={homeIcon} alt='Home' />
					<p>Sell or rent your home.</p>
					<img src={arrowRight} alt='Arrow right' />
				</Link>
			</main>
		</div>
	)
}

export default Profile
