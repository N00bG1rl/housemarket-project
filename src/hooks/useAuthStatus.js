import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

export const useAuthStatus = () => {
	const [loggedIn, setLoggedIn] = useState(false)
	const [isPending, setIsPending] = useState(true)

	useEffect(() => {
		const auth = getAuth()

		const unsub = onAuthStateChanged(auth, user => {
			if (user) {
				setLoggedIn(true)
			}
			setIsPending(false)
		})

		return unsub
	}, [])

	return { loggedIn, isPending }
}
