import { useState } from 'react'
import { getAuth } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'

function Profile() {
	const auth = getAuth()
	const navigate = useNavigate()

	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	})

	const { name, email } = formData

	const onLogout = () => {
		auth.signOut()
		navigate('/')
	}

	return (
		<div className='profile'>
			<header className='profileHeader'>
				<p className='pageHeader'>My profile</p>
				<button type='button' className='logOut' onClick={onLogout}>
					Log out
				</button>
			</header>
		</div>
	)
}

export default Profile
//user ? <h1>{user.displayName}</h1> : <h1>Not logged in</h1>
