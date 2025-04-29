import React, { useState , useContext } from 'react';
import { UpdateContext } from '../UsersTable';
import { UserContext } from '../UsersList';
import { putData } from '../../../../Services/FetchService';
import CustomButton from '../../Buttons/CustomButton';
import { DashboardContext } from '../../../../Pages/dashboard';

const EditInfoModal = (props) => {

    //Inicializo te dy kontekstet
    const updateContext = useContext(UpdateContext);
    const userContext = useContext(UserContext)
    const dashboardContext = useContext(DashboardContext);

    //Perdorimi i useState per te mundur t'i ndryshojme te dhenat ne format e update-imit
    const [email, setEmail] = useState(updateContext.email);
    const [firstName, setFirstName] = useState(updateContext.firstName);
    const [lastName, setLastName] = useState(updateContext.lastName);

    const handleSubmit = async (e) => {
        //Ne momentin qe behet forma submit
        e.preventDefault();
        //Handle form submission
        try {

            //Krijo nje objekt i cili mban te dhenat qe perdoren ne api per te update nje user
            const data = {
                //id nuk mund te ndryshoje pra mirret ashtut siq ka qene
                id: updateContext.id,

                //Te dhenat qe mund te ndryshojne jane keto
                email: email,
                firstName: firstName,
                lastName: lastName
            };

            const response = await putData('/backend/user/adminUpdateUser', data);
            console.log(response);

            //Nese ska error
            //Perdor userContext per te perditesuar listen e usereve (Editimin e userit)
            const updatedUsers = userContext.users.map(user => {
                //Nese id e userit ne list eshte e njejte me ate qe eshte bere update, ndryshoji te dhenat
                if (user.id === updateContext.id) {
                    return {
                        ...user,
                        // ...user i merr te dhenat e tjera qe nuk jane permendur dhe nuk ja ndryshon vleren
                        // duhet perdorur ...user sepse te atributet qe nuk jane permendur pastaj behen null
                        firstName: firstName,
                        lastName: lastName,
                        email: email
                    };
                } else {
                    //Per te gjithe useret tjere, mos bej ndryshime.
                    return user;
                }
            });

            //ndryshoje listen e usereve me listen e re te perditesuar
            userContext.setUsers(updatedUsers);
            
            //Mbyll modal-in per te perditesuar
            props.setShowEditInfoModal(false);
        } catch (error) {

            //Nese ka error, trego pse nuk mund te editohej.
            dashboardContext.setDashboardErrorMessage(error.message);
            dashboardContext.setShowDashboardErrorModal(true);
            userContext.getUsers();

            //Pastaj mbyll modal.
            props.setShowEditInfoModal(false);
            
        }
        
    }

    return(
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <form onSubmit={handleSubmit} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 text-gray-400 p-8 rounded-lg shadow-md w-1/3 h-auto">
                <div className="mb-6">
                    <label htmlFor="default-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           type="text"
                           id="email"
                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></input>
                </div>
                <div className="grid md:grid-cols-2 md:gap-6">
                    <div className="mb-6">
                        <label htmlFor="default-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                        <input value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}
                               type="text"
                               id="firstName"
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></input>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="default-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                        <input value={lastName}
                               onChange={(e) => setLastName(e.target.value)}
                               type="text"
                               id="lastName"
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></input>
                    </div>
                </div>
                <div className="flex justify-around">
                    {/*Nese shtypet butoni close, atehere mbyll modal duke vendosur vleren false*/}
                    <CustomButton color="longRed" onClick={() => props.setShowEditInfoModal(false)} type="button" text="Close"/>
                    <CustomButton color="longGreen" type="submit" text="Update"/>
                </div>
            </form>
        </div>
    )
}

export default EditInfoModal