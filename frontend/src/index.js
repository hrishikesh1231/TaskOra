import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import HomePage from './Landing_page/Home/HomePage';
import './index.css';
import Navbar from './Landing_page/Navbar';
import GigSection from './Landing_page/Gigs/GigSection';
import Service from './Landing_page/ServiceSection/Service';
import { CityProvider } from './context/CityContext';
import PostGigForm from './Landing_page/Posts/PostGigForm';
import PostServiceForm from './Landing_page/Posts/PostServiceForm';
import SignUp from './Registration/SignUp';
import SignIn from './Registration/SignIn';
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from './context/AuthContext';
import Footer from './Landing_page/Footer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <AuthProvider>
  <CityProvider>
  <Navbar/>
    <ToastContainer position="top-center" autoClose={3000} />
    <Toaster position="top-center" reverseOrder={false} />
    <Routes>
      <Route path='/' element={<HomePage/>}></Route>
      <Route path='/gigs/:city' element={<GigSection/>}></Route>
      <Route path='/services/:city' element={<Service/>}></Route>
      <Route path='/postGig' element={<PostGigForm/>}></Route>
      <Route path='/postService' element={<PostServiceForm/>}></Route>
      <Route path='/signUp' element={<SignUp/>}></Route>
      <Route path='/login' element={<SignIn/>}></Route>
    </Routes>
    <Footer/>
  </CityProvider>  
  </AuthProvider>
  </BrowserRouter>
);

