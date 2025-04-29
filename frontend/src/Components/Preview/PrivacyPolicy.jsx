import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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

      {/* Hero Section */}
      <div className="h-[200px] bg-gradient-to-r from-purple-700 to-pink-600 flex flex-col justify-center items-center text-white text-center">
        <h1 className="text-4xl font-extrabold">Privacy Policy</h1>
      </div>

      {/* Main Content */}
      <div className="flex-grow px-6 lg:px-20 py-12 text-gray-800 max-w-5xl mx-auto space-y-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Introduction</h2>
          <p className="text-lg leading-relaxed">
            Welcome to <span className="font-bold">TaskIt</span>. We value your privacy and are committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our application to manage your personal tasks and lists.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li><b>Email Address:</b> Required for account creation and communication purposes.</li>
            <li><b>Password:</b> Securely stored and encrypted to protect your account.</li>
            <li><b>Task Data:</b> All your lists, tasks, and due dates that you create within the app are stored securely.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li>To provide and maintain your access to TaskIt.</li>
            <li>To save and manage your lists, tasks, and related data.</li>
            <li>To enhance and improve the user experience based on anonymous usage statistics.</li>
            <li>To maintain the security and integrity of your data.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Data Security</h2>
          <p className="text-lg leading-relaxed">
            We use industry-standard security measures to protect your data, including encryption and regular security audits.
            Your information is kept confidential and is not shared with third parties without your consent.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li>You can update or delete your account information at any time through the application settings.</li>
            <li>You can request a copy of your stored data in a readable format.</li>
            <li>Upon account deletion, all your data will be permanently removed from our servers.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Changes to This Policy</h2>
          <p className="text-lg leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be communicated through the app or by email if applicable.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Contact Us</h2>
          <p className="text-lg leading-relaxed">
            If you have any questions about this Privacy Policy, please{' '}
            <button onClick={() => navigate('/ContactUs')} className="text-purple-700 underline">
              contact us
            </button>
            .
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-4">
        © 2024 TaskIt. All rights reserved.
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
