import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Navbar from './components/layout/Navbar'
import PrivateRoute from './components/utils/PrivateRoute'
import Explore from './pages/Explore'
import Category from './pages/Category'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import ForgotPassword from './pages/ForgotPassword'

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path='/' element={<Explore />} />
					<Route path='/offers' element={<Offers />} />
					<Route path='/category/:categoryName' element={<Category />} />
					<Route path='/profile' element={<PrivateRoute />}>
						<Route path='/profile' element={<Profile />} />
					</Route>
					<Route path='/login' element={<Login />} />
					<Route path='/create-account' element={<CreateAccount />} />
					<Route path='/forgot-password' element={<ForgotPassword />} />
				</Routes>
				<Navbar />
			</Router>
			<ToastContainer />
		</>
	)
}

export default App
