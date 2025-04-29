import React, { useContext, useState } from 'react';
import { GoPencil } from "react-icons/go";
import { IoPersonAddOutline } from "react-icons/io5";
import { WorkspaceContext } from '../Side/WorkspaceContext';
import UpdateWorkspaceModal from "./UpdateWorkspaceModal.jsx";
import InviteModal from './InviteModal.jsx';
import MessageModal from './MessageModal.jsx';
const SideMenusHeader = () => {

    const {workspace, setUpdateWorkspaceModal,updateWorkspaceModal,handleWorkspaceUpdate, 
        isInviteModalOpen, openInviteModal, closeInviteModal, roli} = useContext(WorkspaceContext);
        const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
        const [message, setMessage] = useState('');

        const handleInviteSent = () => {
            setMessage('Invite sent successfully!');
            setIsMessageModalOpen(true);
            closeInviteModal();
        };
        const handleWorkspaceUpdated = () => {
            setMessage('Workspace updated successfully!');
            setIsMessageModalOpen(true);
            setUpdateWorkspaceModal(false);//mbylle modalin pas update-imit
        };
   
    // Ensure workspace is not null or undefined
    if (!workspace) {
        console.error('Workspace is null or undefined');
        return <div>Error: Workspace is not available</div>;
    }

    return(
        <div>
        <div className="flex justify-around items-center gap-x-3">
            <div className="flex justify-normal gap-x-3 mt-5 items-center">
            <button className={`w-20 h-20 text-black bg-gradient-to-r from-blue-400 to-indigo-500 font-bold text-4xl rounded-lg text-center p-1 items-center duration-200 mt-5 mb-5`}>
                {workspace.title? workspace.title.charAt(0): ''}
            </button>
            <h1 className={`origin-left mt-5 mb-5 font-sans text-gray-400 font-bold text-2xl duration-20 text-center`}>
                {workspace.title}
            </h1>

            {roli === "Owner" ? (
                <>
            <button onClick={()=>setUpdateWorkspaceModal(prev => !prev)}>
            <GoPencil className=" text-gray-400 font-bold text-2xl duration-20 mt-5 mb-5 cursor-pointer hover:text-3xl"/>
            </button>
            <UpdateWorkspaceModal open={updateWorkspaceModal} 
            onClose={()=>setUpdateWorkspaceModal(false)} 
            workspace={workspace} 
            onWorkspaceUpdated={handleWorkspaceUpdated}></UpdateWorkspaceModal>
            </>
            ):(<></>)}</div>

            <button 
            className="flex justify-center text-black font-sans font-semibold text-center bg-blue-500 p-3 border border-solid border-blue-700 rounded-lg  mt-10 hover:bg-blue-400 truncate sm:w-auto"
            onClick={openInviteModal}
            >
            <IoPersonAddOutline className="mr-1 mt-1 font-bold" />
            <span className="hidden sm:inline">Invite workspace members</span>
            <span className="inline sm:hidden"></span>
         
            </button>
            {isInviteModalOpen && (
                    <InviteModal 
                        isOpen={isInviteModalOpen} 
                        onClose={closeInviteModal} 
                        onInviteSent={handleInviteSent} 
                    />
                )}
                <MessageModal 
                    isOpen={isMessageModalOpen} 
                    message={message} 
                    duration={1000}
                    onClose={() => setIsMessageModalOpen(false)} 
                />
        </div>

        <hr className="w-full border-gray-400 mt-3"></hr>
</div>
    );
}

export default SideMenusHeader;