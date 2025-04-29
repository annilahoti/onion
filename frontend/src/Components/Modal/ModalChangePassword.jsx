import React, { useState } from 'react';
import { putData } from '../../Services/FetchService.jsx';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../../Services/TokenService.jsx';
import Swal from 'sweetalert2';

const ModalChangePassword = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      Swal.fire('Error', 'New passwords do not match.', 'error');
      return;
    }

    try {
      const token = getAccessToken();
      const decoded = jwtDecode(token);
      const userId = decoded.Id;

      await putData('/backend/user/changePassword', {
        id: userId,
        oldPassword: oldPassword,
        password: newPassword,
      });

      Swal.fire('Success', 'Password changed successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire('Error', 'Failed to change password.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-[90%] max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-purple-700 text-center">Change Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Old Password"
            className="w-full p-3 border rounded"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New Password"
            className="w-full p-3 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 border rounded"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold w-full">
            Save Changes
          </button>

          <button onClick={onClose} type="button" className="text-gray-600 text-sm mt-2 underline w-full">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalChangePassword;
