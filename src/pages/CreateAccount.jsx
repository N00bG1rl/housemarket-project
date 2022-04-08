import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

function CreateAccount() {
	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
	})
	const { name, email, password } = formData

	const navigate = useNavigate()

	const onChange = e => {
		setFormData(state => ({
			...state,
			[e.target.id]: e.target.value,
		}))
	}

	return (
		<>
			<div className='pageContainer'>
				<header>
					<p className='pageHeader'>Welcome back!</p>
				</header>

				<form>
					<input
						type='text'
						name='email'
						id='name'
						placeholder='Full name'
						value={name}
						className='nameInput'
						onChange={onChange}
					/>

					<input
						type='email'
						name='email'
						id='email'
						placeholder='Email'
						value={email}
						className='emailInput'
						onChange={onChange}
					/>
					<div className='passwordInputDiv'>
						<input
							type={showPassword ? 'text' : 'password'}
							className='passwordInput'
							placeholder='Password'
							id='password'
							value={password}
							onChange={onChange}
						/>

						<img
							src={visibilityIcon}
							alt='Show password'
							className='showPassword'
							onClick={() => setShowPassword(prevState => !prevState)}
						/>
					</div>

					<Link to='/forgot-password' className='forgotPasswordLink'>
						Forgot password
					</Link>

					<div className='signUpBar'>
						<p className='signUpText'>Create account</p>
						<button className='signUpButton'>
							<ArrowRightIcon fill='#ffffff' width='34px' height='34px' />
						</button>
					</div>
				</form>

				<Link to='/login' className='registerLink'>
					Login instead
				</Link>
			</div>
		</>
	)
}

export default CreateAccount
