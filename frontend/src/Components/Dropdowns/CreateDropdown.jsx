import React, { useContext, useState } from 'react';
import { DropdownContext } from '../Navbar/Navbar';
import CreateBoardModal from '../Side/CreateBoardModal';
import CreateWorkspaceModal from '../Side/CreateWorkspaceModal';
import { WorkspaceContext } from '../Side/WorkspaceContext.jsx';

const CreateDropdown = (props) => {
    const dropdownContext = useContext(DropdownContext);
    const { handleCreateWorkspace, handleCreateBoard } = useContext(WorkspaceContext);

    const [openBoardModal, setOpenBoardModal] = useState(false);
    const [openWorkspaceModal, setOpenWorkspaceModal] = useState(false);

    const closeDropdownAndModals = () => {
        setOpenBoardModal(false);
        setOpenWorkspaceModal(false);
        dropdownContext.toggleDropdownCreate(); // close the dropdown
    };

    return (
        <div className='relative'>
            <button
                onClick={dropdownContext.toggleDropdownCreate}
                className={` px-4 py-2 rounded focus:outline-none hover:bg-blue-300 flex items-center 
                ${dropdownContext.CreateDropdownIsOpen ? 'text-blue-400 font-bold bg-blue-600 bg-opacity-20 hover:bg-blue-900 hover:bg-opacity-80' : 'text-gray-800 font-bold bg-blue-400'}`}>
                Create
            </button>

            {dropdownContext.CreateDropdownIsOpen && (
                <>
                    {/* adding overlay to close the dropdown when you click outside  */}
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={closeDropdownAndModals}
                    ></div>

                    <div className='absolute left-0 z-20 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg p-3'>
                        <button
                            onClick={() => setOpenBoardModal(true)}
                            className={`block w-full text-left px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 `}
                        >
                            Create Boards
                        </button>
                        <CreateBoardModal
                            open={openBoardModal}
                            onClose={() => setOpenBoardModal(false)}
                            onBoardCreated={handleCreateBoard}
                        />

                        <button
                            onClick={() => setOpenWorkspaceModal(true)}
                            className='block w-full text-left px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700'
                        >
                            Create Workspaces
                        </button>

                        <CreateWorkspaceModal
                            open={openWorkspaceModal}
                            onClose={() => setOpenWorkspaceModal(false)}
                            onWorkspaceCreated={handleCreateWorkspace}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default CreateDropdown;
