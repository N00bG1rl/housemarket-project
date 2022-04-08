import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'

function ForgotPassword() {
	const [email, setEmail] = useState('')

	const onChange = e => setEmail(e.target.value)

	const onSubmit = async e => {
		e.preventDefault()

		try {
			const auth = getAuth()
			await sendPasswordResetEmail(auth, email)
			toast.success('Email was sent successfuly.')
		} catch (error) {
			toast.error('Ploblem on sending email. Please try again.')
		}
	}

	return (
		<div className='pageContainer'>
			<header>
				<p className='pageHeader'>Forgot password?</p>
			</header>

			<main>
				<form onSubmit={onSubmit}>
					<input
						type='email'
						name='email'
						id='email'
						placeholder='Email'
						className='emailInput'
						value={email}
						onChange={onChange}
					/>

					<Link className='forgotPasswordLink' to='/login'>
						Login
					</Link>

					<div className='signInBar'>
						<div className='signInText'>Send reset link</div>
						<button className='signInButton'>
							<ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
						</button>
					</div>
				</form>
			</main>
		</div>
	)
}

export default ForgotPassword
