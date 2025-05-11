import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdmin, getAccessToken, ClearTokens } from '../Services/TokenService.jsx';
import { getDataWithId, postData } from '../Services/FetchService.jsx';
import { jwtDecode } from 'jwt-decode';
import ModalProfile from '../Components/Modal/ModalProfile.jsx';
import ModalChangePassword from '../Components/Modal/ModalChangePassword.jsx';
import {
  FaTasks, FaPlus, FaTrash, FaCalendarAlt,
  FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaShieldAlt
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Workspace = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalProfileOpen, setModalProfileOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const dropdownRef = useRef(null);

  const [addingTask, setAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [taskCompleted, setTaskCompleted] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      navigate('/Preview');
      return;
    }

    const adminStatus = validateAdmin();
    setIsAdmin(adminStatus);
    fetchLists();

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

  const fetchLists = async () => {
    const token = getAccessToken();
    const decoded = jwtDecode(token);
    const ownerId = decoded.Id;

    try {
      const response = await getDataWithId('/GetListByOwnerId?ownerId', ownerId);
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const handleLogout = () => {
    ClearTokens();
    navigate('/Preview');
  };

  const handleCreateList = async () => {
    const token = getAccessToken();
    const decoded = jwtDecode(token);
    const ownerId = decoded.Id;

    try {
      await postData(`/CreateList?Title=${newListName}&OwnerId=${ownerId}`, null);
      await fetchLists();
      setShowNewListModal(false);
      setNewListName('');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white shadow">
        <button onClick={() => navigate('/Preview')} className="text-5xl font-extrabold text-purple-700 flex items-center space-x-4">
          <FaTasks className='text-4xl mt-1' />
          <span>TaskIt</span>
        </button>

        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
          {isAdmin && (
            <button onClick={() => navigate('/Dashboard')} className="border border-gray-300 px-4 py-2 font-semibold rounded-md text-sm hover:bg-gray-100 flex items-center space-x-2">
              <FaShieldAlt />
              <span>Dashboard</span>
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
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <button
            onClick={() => setShowNewListModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-md"
          >
            <FaPlus /> New List
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button><FaArrowLeft className="text-gray-500 hover:text-purple-600" /></button>
                  <button><FaArrowRight className="text-gray-500 hover:text-purple-600" /></button>
                  <h2 className="text-lg font-bold ml-2">{list.title}</h2>
                </div>
                <button><FaTrash className="text-gray-400 hover:text-red-500" /></button>
              </div>

              {/* Tasks placeholder */}
              <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={taskCompleted}
                    onChange={() => setTaskCompleted(!taskCompleted)}
                  />
                  <span className={`flex-1 ${taskCompleted ? 'line-through text-green-600' : ''}`}>
                    task1
                  </span>

                  <div className="flex flex-col items-center text-sm text-gray-500">
                    <button><FaArrowUp className="hover:text-purple-600" /></button>
                    <button><FaArrowDown className="hover:text-purple-600" /></button>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <FaCalendarAlt className="text-gray-500" />
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      May 1, 2025
                    </span>
                  </div>

                  <button>
                    <FaTrash className="text-gray-400 hover:text-red-500 ml-2 cursor-pointer" />
                  </button>
                </div>
              </div>

              {/* Add Task Form */}
              <div className="border-t pt-2">
                {!addingTask ? (
                  <button
                    className="flex items-center text-sm text-gray-500 hover:text-purple-600"
                    onClick={() => setAddingTask(true)}
                  >
                    <FaPlus className="mr-1" /> Add a task
                  </button>
                ) : (
                  <div className="mt-2 space-y-2">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add a new task..."
                      className="w-full p-2 border rounded"
                    />
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={dueDate}
                        onChange={(date) => setDueDate(date)}
                        placeholderText="Add due date"
                        className="border px-3 py-1 rounded w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                        onClick={() => {
                          console.log("New Task:", newTaskText, dueDate);
                          setAddingTask(false);
                          setNewTaskText('');
                          setDueDate(null);
                        }}
                      >
                        Add
                      </button>
                      <button
                        className="border px-4 py-1 rounded hover:bg-gray-100"
                        onClick={() => {
                          setAddingTask(false);
                          setNewTaskText('');
                          setDueDate(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-4">
        © 2024 TaskIt. All rights reserved.
      </footer>

      {/* Modals */}
      {modalProfileOpen && (
        <ModalProfile
          onClose={() => setModalProfileOpen(false)}
          onChangePassword={() => {
            setModalProfileOpen(false);
            setModalPasswordOpen(true);
          }}
        />
      )}
      {modalPasswordOpen && (
        <ModalChangePassword onClose={() => setModalPasswordOpen(false)} />
      )}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Create New List</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List Name"
              className="w-full p-3 border rounded"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowNewListModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleCreateList} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Create List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
