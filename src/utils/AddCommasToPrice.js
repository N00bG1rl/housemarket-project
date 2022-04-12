// export function AddCommasToPrice(price) {
// 	return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
// }

const formatter = Intl.NumberFormat('en-GB', {
	style: 'currency',
	currency: 'GBP',
})

export default function AddCommasToPrice(price) {
	return formatter.format(price)
}
