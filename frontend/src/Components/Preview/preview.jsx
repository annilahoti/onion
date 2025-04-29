import React, { useState } from 'react';
import mainimg from '../Preview/main.png';
import { useNavigate } from 'react-router-dom';
import { postData } from '../../Services/FetchService.jsx';
import { StoreTokens } from '../../Services/TokenService.jsx';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const Preview = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateLoginForm = () => {
    if (!formData.email) {
      setError('Please enter your email.');
      return false;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!formData.password) {
      setError('Please enter your password.');
      return false;
    }
    return true;
  };

  const validateSignUpForm = () => {
    var nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.firstName.trim())) {
      setError('Please enter a valid first name.');
      return false;
    }
    if (!nameRegex.test(formData.lastName.trim())) {
      setError('Please enter a valid last name.');
      return false;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    var passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must have at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    try {
      const response = await postData('/backend/user/login', {
        email: formData.email,
        password: formData.password
      });
      StoreTokens(response.data.accessToken, response.data.refreshToken);
      const decodedToken = jwtDecode(response.data.accessToken);
      const role = decodedToken.Role;

      if (role === "Admin") {
        navigate('/main/workspace');
      } else {
        navigate('/main/workspace');
      }
    } catch (error) {
      setError('Incorrect email and/or password!');
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Incorrect email or password. Please try again.",
      });
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;

    const registerData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    };

    try {
      await postData('/backend/user/register', registerData);

      const loginResponse = await postData('/backend/user/login', {
        email: formData.email,
        password: formData.password
      });
      StoreTokens(loginResponse.data.accessToken, loginResponse.data.refreshToken);

      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: 'Account created successfully.',
      }).then(() => {
        navigate('/main/workspace');
      });
    } catch (error) {
      if (error.response) {
        setError(error.response.data[1]);
      } else {
        setError('Internal server error. Please try again later.');
      }
    }
  };

  return (
    <nav className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate('/Preview')} className="text-5xl font-extrabold text-purple-700">
          TaskIt
        </button>
        <div className="hidden md:flex space-x-6">
          <button onClick={() => navigate('/AboutUs')} className="text-gray-600 hover:text-purple-700">About Us</button>
          <button onClick={() => navigate('/ContactUs')} className="text-gray-600 hover:text-purple-700">Contact Us</button>
          <button onClick={() => navigate('/PrivacyPolicy')} className="text-gray-600 hover:text-purple-700">Privacy Policy</button>
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu}>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-6 py-4 bg-gray-800 text-white">
          <ul className="space-y-4">
            <li><button onClick={() => navigate('/AboutUs')}>About Us</button></li>
            <li><button onClick={() => navigate('/ContactUs')}>Contact Us</button></li>
            <li><button onClick={() => navigate('/PrivacyPolicy')}>Privacy Policy</button></li>
            <li><button onClick={() => setIsSignUp(false)} className="bg-gray-700 w-full py-2 rounded">Login</button></li>
          </ul>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row items-center justify-between px-6 lg:px-20 py-10">
        {/* Text Section */}
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Organize your tasks,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">simplify your life</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Create custom lists, set due dates, and keep track of everything you need to do in one beautiful, easy-to-use app.
          </p>
          <ul className="flex flex-wrap gap-4 text-gray-800 text-md font-medium pt-2">
            <li>✅ Custom lists</li>
            <li>✅ Task due dates</li>
            <li>✅ Task reordering</li>
            <li>✅ Visual organization</li>
          </ul>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-[650px] lg:w-[700px] mx-auto mt-10 md:mt-0 bg-white rounded-2xl p-10 lg:p-16 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{isSignUp ? 'Create Account' : 'Get Started'}</h2>

          <div className="flex mb-6 rounded-md overflow-hidden border border-gray-300">
            <button onClick={() => setIsSignUp(false)} className={`w-1/2 py-3 text-lg font-semibold ${!isSignUp ? 'bg-gray-200' : 'bg-gray-100'}`}>
              Login
            </button>
            <button onClick={() => setIsSignUp(true)} className={`w-1/2 py-3 text-lg font-semibold ${isSignUp ? 'bg-gray-200' : 'bg-gray-100'}`}>
              Sign Up
            </button>
          </div>

          <form onSubmit={isSignUp ? handleSignUpSubmit : handleLoginSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full p-4 border rounded font-semibold text-lg"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full p-4 border rounded font-semibold text-lg"
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-4 border rounded font-semibold text-lg"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-4 border rounded font-semibold text-lg"
            />
            {isSignUp && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-4 border rounded font-semibold text-lg"
              />
            )}
            {error && (
              <div className="text-red-600 text-center">{error}</div>
            )}
            <button
              type="submit"
              className="w-full py-4 text-white rounded-md text-lg font-bold"
              style={{ backgroundImage: 'linear-gradient(115deg, #7f00ff, #7928ca)' }}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4">
        © 2024 TaskIt. All rights reserved.
      </footer>
    </nav>
  );
};

export default Preview;
