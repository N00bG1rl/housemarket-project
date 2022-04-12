import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAuth, updateProfile } from 'firebase/auth'
import {
	updateDoc,
	doc,
	collection,
	getDocs,
	query,
	where,
	orderBy,
	deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'

import ListingItem from '../components/listings/ListingItem'
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'

function Profile() {
	const auth = getAuth()
	const navigate = useNavigate()

	const [isLoading, setIsLoading] = useState(true)
	const [listings, setListings] = useState(null)
	const [changeDetails, setChangeDetails] = useState(false)
	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	})

	const { name, email } = formData

	useEffect(() => {
		const fetchUserListings = async () => {
			const listingsRef = collection(db, 'listings')

			const q = query(
				listingsRef,
				where('userRef', '==', auth.currentUser.uid),
				orderBy('timestamp', 'desc')
			)

			const querySnap = await getDocs(q)

			let listings = []

			querySnap.forEach(doc => {
				return listings.push({
					id: doc.id,
					data: doc.data(),
				})
			})

			setListings(listings)
			setIsLoading(false)
		}

		fetchUserListings()
	}, [auth.currentUser.uid])

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

	const onEdit = listingId => navigate(`/edit-listing/${listingId}`)

	const onDelete = async listingId => {
		if (window.confirm('Are you sure you want to delete?')) {
			await deleteDoc(doc(db, 'listings', listingId))

			const updadedListings = listings.filter(
				listing => listing.id !== listingId
			)

			setListings(updadedListings)
			toast.success('Successfully deleted listing')
		}
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

				{!isLoading && listings?.length && (
					<>
						<p className='listingText'>Your Listings</p>
						<ul className='listingsList'>
							{listings.map(listing => (
								<ListingItem
									key={listing.id}
									listing={listing.data}
									id={listing.id}
									onDelete={() => onDelete(listing.id)}
									onEdit={() => onEdit(listing.id)}
								/>
							))}
						</ul>
					</>
				)}
			</main>
		</div>
	)
}

export default Profile
