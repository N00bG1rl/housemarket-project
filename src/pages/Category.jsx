import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
	collection,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	startAfter,
	Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import Spinner from '../components/layout/Spinner'
import { toast, Toast } from 'react-toastify'

function Category() {
	const [listings, setListings] = useState(null)
	const [isLoadign, setIsLoading] = useState(true)

	const params = useParams()

	useEffect(() => {
		const fetchListings = async () => {
			try {
				// Get reference
				const listingsRef = collection(db, 'listings')

				// Create a query
				const q = query(
					listingsRef,
					where('type', '==', params.categoryName),
					orderBy('timestamp', 'desc'),
					limit(10)
				)

				// Execute query
				const querySnap = await getDocs(q)

				const listings = []

				querySnap.forEach(doc => {
					return listings.push({
						id: doc.id,
						data: doc.data(),
					})
				})

				setListings(listings)
				setIsLoading(false)
			} catch (error) {
				toast.error('Could not fetch listings.')
			}
		}

		fetchListings()
	}, [params.categoryName])

	return (
		<div className='category'>
			<header>
				<p className='pageHeader'>
					{params.categoryName === 'rent'
						? 'Places for rent'
						: 'Places for sale'}
				</p>
			</header>

			{isLoadign ? (
				<Spinner />
			) : listings && listings.length > 0 ? (
				<>
					<main>
						<ul className='categoryListings'>
							{listings.map(listing => (
								<h3 key={listing.id}>{listing.data.name}</h3>
							))}
						</ul>
					</main>
				</>
			) : (
				<p>No listings for {params.categoryName}</p>
			)}
		</div>
	)
}

export default Category
