import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdmin, getAccessToken, ClearTokens } from '../Services/TokenService.jsx';
import ModalProfile from '../Components/Modal/ModalProfile.jsx';
import ModalChangePassword from '../Components/Modal/ModalChangePassword.jsx';

const Workspace = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalProfileOpen, setModalProfileOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/Preview');
      return;
    }
    const adminStatus = validateAdmin();
    setIsAdmin(adminStatus);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleLogout = () => {
    ClearTokens();
    navigate('/Preview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow">
        <button onClick={() => window.location.reload()} className="text-4xl font-extrabold text-purple-700">
          TaskIt
        </button>

        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {isAdmin && (
            <button onClick={() => navigate('/Dashboard')} className="border border-gray-300 px-4 py-2 font-semibold rounded-md text-sm hover:bg-gray-100">
              🛡️ Dashboard
            </button>
          )}
          <button onClick={() => setProfileOpen(!profileOpen)} className="w-10 h-10 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center">
            👤
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-12 w-48 bg-white border rounded-lg shadow-lg py-2">
              <button onClick={() => { setModalProfileOpen(true); setProfileOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                My Profile
              </button>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Workspace</h1>
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md">
            + New List
          </button>
        </div>
        <div className="text-gray-500 italic">Start by creating a new task list!</div>
      </main>

      <footer className="text-center text-gray-400 text-sm py-4">
        © 2024 TaskIt. All rights reserved.
      </footer>

      {/* Modal Profile */}
      {modalProfileOpen && (
        <ModalProfile
          onClose={() => setModalProfileOpen(false)}
          onChangePassword={() => {
            setModalProfileOpen(false);
            setModalPasswordOpen(true);
          }}
        />
      )}

      {/* Modal Change Password */}
      {modalPasswordOpen && (
        <ModalChangePassword onClose={() => setModalPasswordOpen(false)} />
      )}
    </div>
  );
};

export default Workspace;
