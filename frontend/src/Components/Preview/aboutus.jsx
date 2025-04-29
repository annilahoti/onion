import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-gray-100">
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
                <div className="md:hidden bg-gray-800 text-white p-4 space-y-4">
                    <button onClick={() => navigate('/AboutUs')} className="block">About Us</button>
                    <button onClick={() => navigate('/ContactUs')} className="block">Contact Us</button>
                    <button onClick={() => navigate('/PrivacyPolicy')} className="block">Privacy Policy</button>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-grow">
                {/* Hero Section */}
                <div className="h-[250px] bg-gradient-to-r from-purple-700 to-pink-600 flex flex-col justify-center items-center text-white text-center">
                    <h1 className="text-4xl font-extrabold mb-2">About TaskIt</h1>
                    <h2 className="text-lg font-light">Simple Task Management for Everyday Life.</h2>
                </div>

                {/* Content Section */}
                <div className="flex flex-col items-center text-center px-6 py-12 space-y-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                        The way your team works is unique — so is TaskIt.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-4xl">
                    At TaskIt, we believe that staying organized shouldn't be complicated. Our platform is designed for individuals who want a simple and efficient way to manage their daily tasks. 

With TaskIt, you can create multiple custom lists, add and organize your tasks, set due dates to stay on track, and easily reorder or remove tasks as your priorities change. 

Whether you're planning your day, managing personal projects, or just keeping track of what matters most, TaskIt gives you the flexibility and control to stay productive — all in a clean and user-friendly interface.

No complex workspaces. No team management. Just you, your lists, and your goals — organized your way.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm py-4">
                © 2024 TaskIt. All rights reserved.
            </footer>
        </div>
    );
}

export default AboutUs;
