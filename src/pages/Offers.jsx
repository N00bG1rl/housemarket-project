import { useEffect, useState } from 'react'
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
import { toast } from 'react-toastify'

import Spinner from '../components/layout/Spinner'
import ListingItem from '../components/listings/ListingItem'

function Offers() {
	const [listings, setListings] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [lastFetchedListing, setLastFetchedListing] = useState(null)

	useEffect(() => {
		const fetchListings = async () => {
			try {
				// Get reference
				const listingsRef = collection(db, 'listings')

				// Create a query
				const q = query(
					listingsRef,
					where('offer', '==', true),
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
	}, [])

	// Pagination / load more
	const onMoreFetchListings = async () => {
		try {
			// Get reference
			const listingsRef = collection(db, 'listings')

			// Create a query
			const q = query(
				listingsRef,
				where('offer', '==', true),
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
				<p className='pageHeader'>Offers</p>
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
				<p>There are no current offers.</p>
			)}
		</div>
	)
}

export default Offers
