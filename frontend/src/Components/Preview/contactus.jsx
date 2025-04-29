import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ContactUs = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        formData.append("access_key", "6b29339c-a880-4f94-af01-36637075a827");

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: json
        }).then((res) => res.json());

        if (res.success) {
            Swal.fire({
                title: "Sent!",
                text: "Message has been sent successfully!",
                icon: "success"
            });
            event.target.reset();
        }
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
            <div className="flex-grow flex flex-col items-center justify-center px-6 py-10">
                <div className="bg-white rounded-2xl shadow-2xl p-10 lg:p-16 w-full max-w-2xl">
                    <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
                        Contact Us
                    </h2>
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-lg text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="fullname"
                                required
                                placeholder="Enter your full name"
                                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 font-semibold text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-lg text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="Enter your email"
                                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 font-semibold text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-lg text-gray-700 mb-2">Your Message</label>
                            <textarea
                                name="message"
                                required
                                placeholder="Enter your message"
                                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none font-semibold text-lg"
                                rows="6"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-purple-700 to-pink-600 text-white rounded-lg font-bold text-lg shadow-md hover:opacity-90 transition duration-300"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm py-4">
                © 2024 TaskIt. All rights reserved.
            </footer>
        </div>
    );
};

export default ContactUs;
