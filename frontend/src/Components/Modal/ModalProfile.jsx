import React, { useEffect, useState } from 'react';
import { getDataWithId, putData } from '../../Services/FetchService.jsx';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../../Services/TokenService.jsx';
import Swal from 'sweetalert2';

const ModalProfile = ({ onClose, onChangePassword }) => {
  const [userData, setUserData] = useState({ id: '', firstName: '', lastName: '', email: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAccessToken();
      const decoded = jwtDecode(token);
      const userId = decoded.Id;

      try {
        const response = await getDataWithId('/backend/user/GetUserById?userId', userId);
        setUserData({
          id: userId,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userData.firstName || !userData.lastName || !userData.email) {
      Swal.fire('Error', 'All fields are required.', 'error');
      return;
    }

    try {
      await putData('/backend/user/UpdateUser', {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      });
      Swal.fire('Success', 'Profile updated successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      Swal.fire('Error', 'Failed to update profile.', 'error');
      console.log("IDDD", userData.id)
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-700 text-center">My Profile</h2>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            placeholder="First Name"
          />
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            placeholder="Last Name"
          />
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            placeholder="Email"
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold">
            Save Changes
          </button>

          <button onClick={onChangePassword} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold">
            Change Password
          </button>

          <button onClick={onClose} className="text-gray-600 text-sm mt-2 underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProfile;
