import React, { useState, useContext } from 'react';
import { UpdateContext } from '../UsersTable';
import { putData } from '../../../../Services/FetchService';
import { UserContext } from '../UsersList';
import CustomButton from '../../Buttons/CustomButton';
import { DashboardContext } from '../../../../Pages/dashboard';

const EditPasswordModal = (props) => {
    const updateContext = useContext(UpdateContext);
    const userContext = useContext(UserContext);
    const dashboardContext = useContext(DashboardContext);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission here
        if (newPassword.length === 0 || confirmPassword.length === 0) {
            dashboardContext.setDashboardErrorMessage("Both forms are required");
            dashboardContext.setShowDashboardErrorModal(true);
            return;
        }
        if (!(newPassword === confirmPassword)) {
            dashboardContext.setDashboardErrorMessage("Passwords do not equal each other!");
            dashboardContext.setShowDashboardErrorModal(true);
            return;
        }

        try {
            const data = {
                id: updateContext.id,
                password: newPassword
            }

            const response = await putData('/backend/user/adminUpdatePassword', data);
            console.log(response);

            props.setShowEditPasswordModal(false);
        } catch (error) {
            let messages = error.message.split(','); // Assuming messages are separated by commas
            let message = messages.join('');
            dashboardContext.setDashboardErrorMessage(message);
            dashboardContext.setShowDashboardErrorModal(true);
        }
    }

    return(
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <form onSubmit={handleSubmit} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-gray-400 p-8 rounded-lg shadow-md w-1/5 h-auto">
                <div className="mb-5">
                    <div className="flex justify-center mb-2">
                        <div className="w-full">
                            <p className="text-gray-600 dark:text-gray-400 text-center">{updateContext.id}</p>
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">First Name:</p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">{updateContext.firstName}</p>
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">Last Name:</p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">{updateContext.lastName}</p>
                        </div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-300">Email:</p>
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400">{updateContext.email}</p>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <div className="mr-4 w-[90%]">
                        <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                        <input 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            type="password"
                            id="newPassword"
                            className="mb-3.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>
                    <div className="mr-4 w-[90%]">
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirm Password</label>
                        <input 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            type="password"
                            id="confirmPassword"
                            className="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>
                </div>
                    
                <div className="flex justify-end mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character</p>
                </div>
                <div className="flex justify-around">
                    <CustomButton color="longRed" onClick={() => props.setShowEditPasswordModal(false)} type="button" text="Close" />
                    <CustomButton color="longGreen" type="submit" text="Update"/>
                </div>
            </form>
        </div>
    )
}

export default EditPasswordModal;
