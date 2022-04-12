import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase.config'
import SwiperCore, {
	Navigation,
	Pagination,
	Scrollbar,
	A11y,
	Autoplay,
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import Spinner from './Spinner'
import AddCommasToPrice from '../../utils/AddCommasToPrice'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/a11y'

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay])

function Slider() {
	const [listing, setListing] = useState(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchListing = async () => {
			const listingsRef = collection(db, 'listings')
			const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5))
			const querySnap = await getDocs(q)

			let listings = []

			querySnap.forEach(doc => {
				return listings.push({
					id: doc.id,
					data: doc.data(),
				})
			})
			//console.log(listings)

			setListing(listings)
			setIsLoading(false)
		}

		fetchListing()
	}, [])

	if (isLoading) {
		return <Spinner />
	}

	if (!listing.length) {
		return <></>
	}

	return (
		listing && (
			<>
				<p className='exploreHeading'>Awailable properties</p>

				<Swiper
					slidesPerView={1}
					pagination={{ clickable: true }}
					autoplay={{
						delay: 3000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					}}
				>
					{listing.map(({ data, id }) => (
						<SwiperSlide
							key={id}
							onClick={() => Navigate(`/category/${data.type}/${id}`)}
						>
							<div
								style={{
									background: `url(${data.imageUrls[0]}) center no-repeat`,
									backgroundSize: 'cover',
									height: '300px',
								}}
								className='swiperSlideDiv'
							>
								<p className='swiperSlideText'>{data.name}</p>
								<p className='swiperSlidePrice'>
									{AddCommasToPrice(data.discountedPrice ?? data.regularPrice)}{' '}
									{data.type === 'rent' && ' / month'}
								</p>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</>
		)
	)
}

export default Slider
