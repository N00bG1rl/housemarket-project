import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
////import { Helmet } from 'react-helmet'
//import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
//import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper'
//import { Swiper, SwiperSlide } from 'swiper/react'
//import 'swiper/swiper-bundle.css'
import { getDoc, doc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../firebase.config'
import Spinner from '../components/layout/Spinner'
import shareIcon from '../assets/svg/shareIcon.svg'
//SwiperCore.use([Navigation, Pagination, Scrollbar, A11y])

function AddCommaToPrice(price) {
	return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function Listing() {
	const [listing, setListing] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [sharedLinkCopied, setSharedLinkCopied] = useState(false)

	const params = useParams()
	const auth = getAuth()

	useEffect(() => {
		const fetchListing = async () => {
			const docRef = doc(db, 'listings', params.listingId)
			const docSnap = await getDoc(docRef)

			if (docSnap.exists()) {
				console.log(docSnap.data())

				setListing(docSnap.data())
				setIsLoading(false)
			}
		}

		fetchListing()
	}, [params.listingId])

	if (isLoading) {
		return <Spinner />
	}

	return (
		<main>
			<div
				className='shareIconDiv'
				onClick={() => {
					navigator.clipboard.writeText(window.location.href)
					setSharedLinkCopied(true)
					setTimeout(() => {
						setSharedLinkCopied(false)
					}, 2000)
				}}
			>
				<img src={shareIcon} alt='Share' />
			</div>

			{sharedLinkCopied && <p className='linkCopied'>Link copied!</p>}

			<div className='listingDetails'>
				<p className='listingName'>
					{listing.name} - $
					{listing.offer
						? AddCommaToPrice(listing.discountedPrice)
						: AddCommaToPrice(listing.regularPrice)}
				</p>
				<p className='listingLocation'>{listing.location}</p>
				<p className='listingType'>
					For {listing.type === 'rent' ? 'Rent' : 'Sale'}
				</p>
				{listing.offer && (
					<p className='discountedPrice'>
						${listing.regularPrice - listing.discountedPrice} discount
					</p>
				)}
				<ul className='listingDetailsList'>
					<li>
						{listing.bedrooms > 1
							? `${listing.bedrooms} bedrooms`
							: '1 bedroom'}
					</li>
					<li>
						{listing.bathrooms > 1
							? `${listing.bathrooms} bathrooms`
							: '1 bathroom'}
					</li>
					<li>{listing.parking && 'Parking spot'}</li>
					<li>{listing.furnished && 'Furnished'}</li>
				</ul>

				<p className='listingLocationTitle'>Location</p>

				{auth.currentUser?.uid !== listing.userRef && (
					<Link
						to={`/contact/${listing.userRef}?listingName=${listing.name}`}
						className='primaryButton'
					>
						Contact landlord
					</Link>
				)}
			</div>
		</main>
	)
}

export default Listing
