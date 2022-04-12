import { useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
} from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.config'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/layout/Spinner'

const initialFormState = {
	type: 'rent',
	name: '',
	bedrooms: 1,
	bathrooms: 1,
	parking: false,
	furnished: false,
	address: '',
	offer: false,
	regularPrice: 0,
	discountedPrice: 0,
	images: {},
	latitude: 0,
	longitude: 0,
}

const URL = process.env.REACT_APP_BASE_URL
const KEY = process.env.REACT_APP_GEOCODE_API_KEY

function CreateListing() {
	const [isLoading, setIsLoading] = useState(true)
	const [geolocationEnabled, setGeolocationEnabled] = useState(true)
	const [formData, setFormData] = useState(initialFormState)

	const {
		type,
		name,
		bedrooms,
		bathrooms,
		parking,
		furnished,
		address,
		offer,
		regularPrice,
		discountedPrice,
		images,
		latitude,
		longitude,
	} = formData

	const auth = getAuth()
	const navigate = useNavigate()
	//const isMounted = useRef(true)

	useEffect(() => {
		const onUnsubscribe = onAuthStateChanged(auth, user => {
			if (user) {
				setFormData({ ...initialFormState, userRef: user.uid })
			} else {
				navigate('/login')
			}
		})

		setIsLoading(false)
		return onUnsubscribe
	}, [auth, navigate])

	const onMutate = e => {
		let boolean = null

		if (e.target.value === 'true') {
			boolean = true
		}
		if (e.target.value === 'false') {
			boolean = false
		}

		// Files
		if (e.target.files) {
			setFormData(state => ({
				...state,
				images: e.target.files,
			}))
		}

		// Text/booleans/numbers
		if (!e.target.files) {
			setFormData(state => ({
				...state,
				[e.target.id]: boolean ?? e.target.value,
			}))
		}
	}

	const onSubmit = async e => {
		e.preventDefault()

		setIsLoading(true)

		if (discountedPrice >= regularPrice) {
			setIsLoading(false)
			toast.error('Discounted price needs to be less than regular price.')
			return
		}

		if (images.length > 6) {
			setIsLoading(false)
			toast.error('Max 6 images.')
			return
		}

		let geolocation = {}
		let location

		if (geolocationEnabled) {
			const response = await fetch(`${URL}/json?address=${address}&key=${KEY}
`)

			const data = await response.json()
			//console.log(data)

			geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
			//console.log(geolocation.lat)
			geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

			location =
				data.status === 'ZERO_RESULTS'
					? undefined
					: data.results[0].formatted_address
			//console.log(location)

			if (location === undefined || location.includes('undefined')) {
				setIsLoading(false)
				toast.error('Please enter a correct address.')
				return
			}
		} else {
			geolocation.lat = latitude
			geolocation.lng = longitude
		}

		// Store image in firebase
		const storeImage = async image => {
			return new Promise((resolve, reject) => {
				const storage = getStorage()
				// File name
				const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

				// Storage referenge
				const storageRef = ref(storage, 'images/' + fileName)

				const uploadTask = uploadBytesResumable(storageRef, image)

				uploadTask.on(
					'state_changed',
					snapshot => {
						// Observe state change events such as progress, pause, and resume
						// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
						const progress =
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100
						console.log('Upload is ' + progress + '% done')

						switch (snapshot.state) {
							case 'paused':
								//console.log('Upload is paused')
								break
							case 'running':
								//console.log('Upload is running')
								break
							default:
								console.log('default case')
						}
					},
					error => {
						reject(error)
					},
					() => {
						// Handle successful uploads on complete
						getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
							resolve(downloadURL)
						})
					}
				)
			})
		}

		// Get/store all images url-s into array
		const imageUrls = await Promise.all(
			[...images].map(image => storeImage(image))
		).catch(() => {
			setIsLoading(false)
			toast.error('Could not upload images')
			return
		})

		const formDataCopy = {
			...formData,
			imageUrls,
			geolocation,
			timestamp: serverTimestamp(),
		}

		// Cleanup
		formDataCopy.location = address
		delete formDataCopy.images
		delete formDataCopy.address
		!formDataCopy.offer && delete formDataCopy.discountedPrice

		const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
		setIsLoading(false)
		toast.success('Listing saved')
		navigate(`/category/${formDataCopy.type}/${docRef.id}`)
	}

	if (isLoading) {
		return <Spinner />
	}

	return (
		<div className='profile'>
			<header>
				<p className='pageHeader'>Create a listing</p>
			</header>

			<main>
				<form onSubmit={onSubmit}>
					<label className='formLabel'>Sell / Rent</label>
					<div className='formButtons'>
						<button
							type='button'
							className={type === 'sale' ? 'formButtonActive' : 'formButton'}
							id='type'
							value='sale'
							onClick={onMutate}
						>
							Sell
						</button>
						<button
							type='button'
							className={type === 'rent' ? 'formButtonActive' : 'formButton'}
							id='type'
							value='rent'
							onClick={onMutate}
						>
							Rent
						</button>
					</div>

					<label className='formLabel'>Name</label>
					<input
						className='formInputName'
						type='text'
						id='name'
						value={name}
						onChange={onMutate}
						maxLength='32'
						minLength='10'
						required
					/>

					<div className='formRooms flex'>
						<div>
							<label className='formLabel'>Bedrooms</label>
							<input
								className='formInputSmall'
								type='number'
								id='bedrooms'
								value={bedrooms}
								onChange={onMutate}
								min='1'
								max='50'
								required
							/>
						</div>

						<div>
							<label className='formLabel'>Bathrooms</label>
							<input
								className='formInputSmall'
								type='number'
								id='bathrooms'
								value={bathrooms}
								onChange={onMutate}
								min='1'
								max='50'
								required
							/>
						</div>
					</div>

					<label className='formLabel'>Parking spot</label>
					<div className='formButtons'>
						<button
							className={parking ? 'formButtonActive' : 'formButton'}
							type='button'
							id='parking'
							value={true}
							onClick={onMutate}
							min='1'
							max='50'
						>
							Yes
						</button>

						<button
							className={
								!parking && parking !== null ? 'formButtonActive' : 'formButton'
							}
							type='button'
							id='parking'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Furnished</label>
					<div className='formButtons'>
						<button
							className={furnished ? 'formButtonActive' : 'formButton'}
							type='button'
							id='furnished'
							value={true}
							onClick={onMutate}
						>
							Yes
						</button>

						<button
							className={
								!furnished && furnished !== null
									? 'formButtonActive'
									: 'formButton'
							}
							type='button'
							id='furnished'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Address</label>
					<textarea
						className='formInputAddress'
						type='text'
						id='address'
						value={address}
						onChange={onMutate}
						required
					/>

					{!geolocationEnabled && (
						<div className='formLatLng flex'>
							<div>
								<label className='formLabel'>Latitude</label>
								<input
									className='formInputSmall'
									type='number'
									id='latitude'
									value={latitude}
									onChange={onMutate}
									required
								/>
							</div>
							<div>
								<label className='formLabel'>Longitude</label>
								<input
									className='formInputSmall'
									type='number'
									id='longitude'
									value={longitude}
									onChange={onMutate}
									required
								/>
							</div>
						</div>
					)}

					<label className='formLabel'>Offer</label>
					<div className='formButtons'>
						<button
							className={offer ? 'formButtonActive' : 'formButton'}
							type='button'
							id='offer'
							value={true}
							onClick={onMutate}
						>
							Yes
						</button>

						<button
							className={
								!offer && offer !== null ? 'formButtonActive' : 'formButton'
							}
							type='button'
							id='offer'
							value={false}
							onClick={onMutate}
						>
							No
						</button>
					</div>

					<label className='formLabel'>Regular price</label>
					<div className='formPriceDiv'>
						<input
							className='formInputSmall'
							type='number'
							id='regularPrice'
							value={regularPrice}
							onChange={onMutate}
							min='50'
							max='750000000'
							required
						/>
						{type === 'rent' && <p className='formPriceText'> / Month</p>}
					</div>

					{offer && (
						<>
							<label className='formLabel'>Discounted price</label>
							<input
								className='formInputSmall'
								type='number'
								id='discountedPrice'
								value={discountedPrice}
								onChange={onMutate}
								min='50'
								max='750000000'
								required={offer}
							/>
						</>
					)}

					<label className='formLabel'>Images</label>
					<p className='imagesInfo'>
						The first image will be the cover. Maximum is 6 images.
					</p>
					<input
						className='formInputFile'
						type='file'
						id='images'
						onChange={onMutate}
						max='6'
						accept='.jpg,.png,.jpeg'
						multiple
						required
					/>

					<button type='submit' className='primaryButton createListingButton'>
						Create listing
					</button>
				</form>
			</main>
		</div>
	)
}

export default CreateListing
