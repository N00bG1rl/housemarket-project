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
} from 'firebase/firestore'
import { db } from '../firebase.config'
import Spinner from '../components/layout/Spinner'
import { toast } from 'react-toastify'

import ListingItem from '../components/listings/ListingItem'

function Category() {
	const [listings, setListings] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [lastFetchedListing, setLastFetchedListing] = useState(null)

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

				const lastVisible = querySnap.docs[querySnap.docs.length - 1]
				setLastFetchedListing(lastVisible)

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

	// Pagination / load more
	const onMoreFetchListings = async () => {
		try {
			// Get reference
			const listingsRef = collection(db, 'listings')

			// Create a query
			const q = query(
				listingsRef,
				where('type', '==', params.categoryName),
				orderBy('timestamp', 'desc'),
				startAfter(lastFetchedListing),
				limit(10)
			)

			// Execute query
			const querySnap = await getDocs(q)

			const lastVisible = querySnap.docs[querySnap.docs.length - 1]
			setLastFetchedListing(lastVisible)

			const listings = []

			querySnap.forEach(doc => {
				return listings.push({
					id: doc.id,
					data: doc.data(),
				})
			})

			setListings(prevState => [...prevState, ...listings])
			setIsLoading(false)
		} catch (error) {
			toast.error('Could not fetch listings.')
		}
	}

	return (
		<div className='category'>
			<header>
				<p className='pageHeader'>
					{params.categoryName === 'rent'
						? 'Places for rent'
						: 'Places for sale'}
				</p>
			</header>

			{isLoading ? (
				<Spinner />
			) : listings && listings.length ? (
				<>
					<main>
						<ul className='categoryListings'>
							{listings.map(listing => (
								<ListingItem
									id={listing.id}
									key={listing.id}
									listing={listing.data}
								/>
							))}
						</ul>
					</main>

					{lastFetchedListing && (
						<p className='loadMore' onClick={onMoreFetchListings}>
							Load more
						</p>
					)}
				</>
			) : (
				<p>No listings for {params.categoryName}</p>
			)}
		</div>
	)
}

export default Category
