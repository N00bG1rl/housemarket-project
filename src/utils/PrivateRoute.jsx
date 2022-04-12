import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStatus } from '../hooks/useAuthStatus'

import Spinner from '../components/layout/Spinner'

const PrivateRoute = () => {
	const { loggedIn, isPending } = useAuthStatus()

	if (isPending) {
		return <Spinner />
	}

	return loggedIn ? <Outlet /> : <Navigate to='/login' />
}

export default PrivateRoute
