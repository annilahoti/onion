import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdmin, getAccessToken, ClearTokens } from '../Services/TokenService.jsx';
import { getDataWithId, postData, putData, deleteData } from '../Services/FetchService.jsx';
import { jwtDecode } from 'jwt-decode';
import ModalProfile from '../Components/Modal/ModalProfile.jsx';
import ModalChangePassword from '../Components/Modal/ModalChangePassword.jsx';
import {
  FaTasks, FaPlus, FaTrash, FaCalendarAlt,
  FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaShieldAlt
} from "react-icons/fa";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

const Workspace = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalProfileOpen, setModalProfileOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const dropdownRef = useRef(null);

const [newTaskInputs, setNewTaskInputs] = useState({});
const [dueDates, setDueDates] = useState({});
const [addingTaskListId, setAddingTaskListId] = useState(null);

const [editingTaskId, setEditingTaskId] = useState(null);
const [editedTaskTitle, setEditedTaskTitle] = useState('');
const [editedTaskDueDate, setEditedTaskDueDate] = useState(null);



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
    console.log('Fetched lists:', response.data); // <- kjo ndihmon për debug
   const sortedLists = [...response.data]
  .map(list => ({
    ...list,
    tasks: (list.tasks || []).filter(task => !task.isDeleted)
  }))
  .sort((a, b) => a.index - b.index);
setLists(sortedLists);


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

    if (!newListName.trim()) {
      Swal.fire('Warning', 'List title cannot be empty.', 'warning');
      return;
    }

    try {
      await postData(`/CreateList?Title=${encodeURIComponent(newListName)}&OwnerId=${ownerId}`, null);
      await fetchLists();
      setShowNewListModal(false);
      setNewListName('');
    } catch (error) {
      let message = 'Could not create list. Please try again later.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.title) {
          message = error.response.data.title;
        }
      }
      Swal.fire('Error', message, 'error');
    }
  };
const handleUpdateList = async (listId, newTitle) => {
  if (!newTitle.trim()) {
    Swal.fire('Warning', 'List title cannot be empty.', 'warning');
    return;
  }

  try {
    await putData(`/UpdateList?ListId=${listId}&Title=${encodeURIComponent(newTitle)}`, null);
    Swal.fire('Success', 'List title updated.', 'success');
    setEditingListId(null);
    setEditedTitle('');
    await fetchLists();
  } catch (error) {
    let message = 'Could not update list. Please try again later.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      } else if (error.response.data.title) {
        message = error.response.data.title;
      }
    }
    Swal.fire('Error', message, 'error');
  }
};

const handleDeleteList = async (listId) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'This list will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, delete it!',
  });

  if (confirm.isConfirmed) {
    try {
      await deleteData(`/DeleteList?ListId=${listId}`);
      Swal.fire('Deleted!', 'Your list has been deleted.', 'success');
      await fetchLists();
    } catch (error) {
      let message = 'Could not delete list.';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      Swal.fire('Error', message, 'error');
    }
  }
};

const handleReorderList = async (listId, newIndex) => {
  if (newIndex < 0 || newIndex >= lists.length) return;

  try {
    await putData(`/ChangeIndexList?ListId=${listId}&newIndex=${newIndex}`, null);
    await fetchLists();
  } catch (error) {
    let message = 'Could not reorder list.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    }
    Swal.fire('Error', message, 'error');
  }
};
const handleCreateTask = async (listId) => {
  const token = getAccessToken();
  const decoded = jwtDecode(token);
  const title = newTaskInputs[listId] || '';
  const date = dueDates[listId];

  if (!title.trim()) {
    Swal.fire('Warning', 'Task title cannot be empty.', 'warning');
    return;
  }

  const data = {
    title,
    listId,
    dueDate: date ? date.toISOString() : '0001-01-01T00:00:00',
  };

  try {
    await postData('/CreateTask', data);
    await fetchLists(); // refresh data
    setAddingTaskListId(null);
    setNewTaskInputs({ ...newTaskInputs, [listId]: '' });
    setDueDates({ ...dueDates, [listId]: null });
  } catch (error) {
    let message = 'Could not create task.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    }
    Swal.fire('Error', message, 'error');
  }
};
const handleUpdateTask = async (taskId) => {
  if (!editedTaskTitle.trim()) {
    Swal.fire('Warning', 'Task title cannot be empty.', 'warning');
    return;
  }

  const title = encodeURIComponent(editedTaskTitle);
  const dueDate = editedTaskDueDate
    ? editedTaskDueDate.toISOString()
    : '0001-01-01T00:00:00';

  try {
    await putData(`/UpdateTask?TaskId=${taskId}&Title=${title}&DueDate=${dueDate}`, null);
    Swal.fire('Success', 'Task updated.', 'success');
    await fetchLists();
    setEditingTaskId(null);
    setEditedTaskTitle('');
    setEditedTaskDueDate(null);
  } catch (error) {
    let message = 'Could not update task.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    }
    Swal.fire('Error', message, 'error');
  }
};

const handleDeleteTask = async (taskId) => {
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'This task will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Yes, delete it!',
  });

  if (confirm.isConfirmed) {
    try {
      await deleteData(`/DeleteTask?TaskId=${taskId}`);
      Swal.fire('Deleted!', 'Your task has been deleted.', 'success');
      await fetchLists();
    } catch (error) {
      let message = 'Could not delete task.';
      if (error.response?.data) {
        message = typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || 'Something went wrong.';
      }
      Swal.fire('Error', message, 'error');
    }
  }
};

const handleReorderTask = async (taskId, newIndex, listId) => {
  try {
    await putData(`/ChangeTaskIndex?TaskId=${taskId}&newIndex=${newIndex}&ListId=${listId}`, null);
    await fetchLists();
  } catch (error) {
    let message = 'Could not reorder task.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        message = error.response.data;
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    }
    Swal.fire('Error', message, 'error');
  }
};

const handleToggleChecked = async (taskId, isChecked) => {
  try {
    await putData('/ToggleChecked', {
      taskId,
      isChecked,
    });
    await fetchLists();
  } catch (err) {
    Swal.fire('Error', 'Could not update task status.', 'error');
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
            data-testid="new-list-btn"
          >
            <FaPlus /> New List
          </button>
        </div>

    <div className="flex overflow-x-auto gap-6 pb-4 max-w-full scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 items-start">

        
         {lists.map((list, index) => (
  <div key={index} className="bg-white rounded-xl shadow p-4 space-y-4 w-[500px] shrink-0">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2 w-full">
        {/* Reorder Arrows */}
        <button
          onClick={() => handleReorderList(list.listId, index - 1)}
          disabled={index === 0}
          title="Move left"
        >
          <FaArrowLeft className={`hover:text-purple-600 ${index === 0 ? 'text-gray-300' : 'text-gray-500'}`} />
        </button>

        <button
          onClick={() => handleReorderList(list.listId, index + 1)}
          disabled={index === lists.length - 1}
          title="Move right"
        >
          <FaArrowRight className={`hover:text-purple-600 ${index === lists.length - 1 ? 'text-gray-300' : 'text-gray-500'}`} />
        </button>

        {/* Title or Input */}
        {editingListId === list.listId ? (
          <>
            <input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="border px-2 py-1 rounded text-sm flex-grow"
              data-testid="editing-title"
            />
            <button
              onClick={() => handleUpdateList(list.listId, editedTitle)}
              className="text-green-600 text-sm font-semibold"
              data-testid="edit-save-btn"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditingListId(null);
                setEditedTitle('');
              }}
              className="text-gray-500 text-sm underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <h2
            className="text-lg font-bold cursor-pointer flex-grow"
            onClick={() => {
              setEditingListId(list.listId);
              setEditedTitle(list.title);
            }}
            title="Click to rename"
            data-testid="list-title"
          >
            {list.title}
          </h2>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => handleDeleteList(list.listId)}
        title="Delete list"
        data-testid="delete-list-btn"
      >
        <FaTrash className="text-gray-400 hover:text-red-500 ml-2" />
      </button>
    </div>


              {/* Tasks placeholder */}
              <div className="border rounded-lg p-3 space-y-2 bg-gray-50">
               {list.tasks && list.tasks.length > 0 ? (
  list.tasks
    .filter((task) => !task.isDeleted)
    .sort((a, b) => a.index - b.index)
    .map((task) => {
      const visibleTasks = list.tasks.filter((t) => !t.isDeleted);
      const isFirst = task.index === Math.min(...visibleTasks.map(t => t.index));
      const isLast = task.index === Math.max(...visibleTasks.map(t => t.index));

      return (
 <div key={task.taskId} className="flex justify-between items-center border p-2 rounded bg-gray-50">
  {editingTaskId === task.taskId ? (
    <div className="flex flex-col gap-2 w-full">
      <input
        value={editedTaskTitle}
        onChange={(e) => setEditedTaskTitle(e.target.value)}
        className="border p-1 rounded"
      />
      <DatePicker
        selected={editedTaskDueDate}
        onChange={(date) => setEditedTaskDueDate(date)}
        className="border p-1 rounded"
        placeholderText="Due date"
      />
      <div className="flex gap-2">
        <button
          onClick={() => handleUpdateTask(task.taskId)}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Save
        </button>
        <button
          onClick={() => setEditingTaskId(null)}
          className="text-sm underline"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2 flex-1">
    
      <input
        type="checkbox"
        checked={task.isChecked}
        onChange={(e) => handleToggleChecked(task.taskId, e.target.checked)}
        className="form-checkbox h-5 w-5 text-green-600"
      />

      {/* ✅ Task title with green line-through if checked */}
      <span
       className={`cursor-pointer text-base font-medium flex-1 ${
    task.isChecked ? 'text-green-600 line-through' : 'text-gray-800'
        }`}
        onClick={() => {
          setEditingTaskId(task.taskId);
          setEditedTaskTitle(task.title);
          setEditedTaskDueDate(
            task.dueDate !== '0001-01-01T00:00:00'
              ? new Date(task.dueDate)
              : null
          );
        }}
        title="Click to edit"
      >
        {task.title}
      </span>
    </div>
  )}

  {/* Due date and controls */}
  <div className="flex items-center gap-2">
    {task.dueDate !== '0001-01-01T00:00:00' && (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <FaCalendarAlt />
        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    )}
    <button
      onClick={() => handleReorderTask(task.taskId, task.index - 1, list.listId)}
      title="Move up"
      disabled={isFirst}
    >
      <FaArrowUp className={`hover:text-purple-600 ${isFirst ? 'text-gray-300' : 'text-gray-400'}`} />
    </button>
    <button
      onClick={() => handleReorderTask(task.taskId, task.index + 1, list.listId)}
      title="Move down"
      disabled={isLast}
    >
      <FaArrowDown className={`hover:text-purple-600 ${isLast ? 'text-gray-300' : 'text-gray-400'}`} />
    </button>
    <button
      onClick={() => handleDeleteTask(task.taskId)}
      title="Delete task"
    >
      <FaTrash className="text-gray-400 hover:text-red-500 ml-3" />
    </button>
  </div>
</div>

      );
    })
) : (
  <div className="text-sm text-gray-400 italic">No tasks</div>
)}

</div>

              {/* Add Task Form */}
          {addingTaskListId !== list.listId ? (
  <button
    className="flex items-center text-sm text-gray-500 hover:text-purple-600"
    onClick={() => setAddingTaskListId(list.listId)}
  >
    <FaPlus className="mr-1" /> Add a task
  </button>
) : (
  <div className="mt-2 space-y-2">
    <input
      type="text"
      value={newTaskInputs[list.listId] || ''}
      onChange={(e) =>
        setNewTaskInputs({ ...newTaskInputs, [list.listId]: e.target.value })
      }
      placeholder="Add a new task..."
      className="w-full p-2 border rounded"
    />
    <DatePicker
      selected={dueDates[list.listId] || null}
      onChange={(date) =>
        setDueDates({ ...dueDates, [list.listId]: date })
      }
      placeholderText="Add due date"
      className="border px-3 py-1 rounded w-full"
    />
    <div className="flex gap-2">
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
        onClick={() => handleCreateTask(list.listId)}
      >
        Add
      </button>
      <button
        className="border px-4 py-1 rounded hover:bg-gray-100"
        onClick={() => {
          setAddingTaskListId(null);
          setNewTaskInputs({ ...newTaskInputs, [list.listId]: '' });
          setDueDates({ ...dueDates, [list.listId]: null });
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

          
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
              name="list-name"
              className="w-full p-3 border rounded"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowNewListModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
              <button onClick={handleCreateList} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" data-testid="create-list">Create List</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
