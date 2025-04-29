import { createContext, useContext, useEffect, useState } from "react";
import { WorkspaceContext } from "../Side/WorkspaceContext";
import ListForm from "../List/ListForm.jsx";
import {DndContext, KeyboardSensor, PointerSensor, closestCenter, closestCorners, useSensor, useSensors, TouchSensor} from "@dnd-kit/core";
import List from "../List/List.jsx";
import {SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import { getDataWithId, putData } from "../../Services/FetchService.jsx";
import { useAsyncError, useNavigate, useParams } from "react-router-dom";
import Task from "../Task/Task.jsx";
import { DragOverlay } from '@dnd-kit/core';
import DummyList from "../List/DummyList.jsx";
import { MdOutlineStarOutline, MdOutlineStarPurple500 } from "react-icons/md";
import {DropdownContext} from "../Navbar/Navbar.jsx";
import MemberProfilePic from "../ProfilePic/MemberProfilepic.jsx";
import LoadingModal from "../Modal/LoadingModal.jsx";
import { deleteData } from "../../Services/FetchService.jsx";
import TaskModal from "../TaskModal/TaskModal.jsx";
import { IoIosSettings } from "react-icons/io";
import StarButton from "../ContentFromSide/StarButton.jsx";

export const BoardContext = createContext();

const Board = () => {
  const workspaceContext = useContext(WorkspaceContext);
  const {workspaceId, boardId, taskId} = useParams();
  const navigate = useNavigate();
  const {open} = workspaceContext;
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
   
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [activeList, setActiveList] = useState(null);

  const [selectedListId, setSelectedListId] = useState(null);
  const [ProfilePicIsOpen, setProfilePicIsOpen] = useState(false);
  const toggleDropdownProfilePic = () => {
    setProfilePicIsOpen(prev => !prev);
  };
  const pfpValues = {
    ProfilePicIsOpen,
    toggleDropdownProfilePic
  }


const getTasks = async () => {
      try {
        if (boardId) {
          const tasksResponse = await getDataWithId("/backend/task/GetTasksByBoardId?boardId", boardId);
          const tasksData = tasksResponse.data;
          if (tasksData) {
            const updatedTasks = tasksData.map(task => {
              return {
                ...task,
              uniqueId: `${task.taskId}-${task.listId}`
              }
            }).sort((a,b) => a.index - b.index);
            setTasks(updatedTasks);
          } else {
            console.log("There are no tasks");
          }
        }
      } catch (error) {
        console.error("There has been an error fetching tasks");
      }
    }
const getLists = async () => {
      try {
        if (boardId) {
              const listsResponse = await getDataWithId("/backend/list/GetListByBoardId?boardId",boardId);
              const listsData = listsResponse.data;
              if (listsData) {
                  const updatedLists = listsData.map(list => {
                      return {
                          ...list,
                          tasks: tasks.map(task => ({
                              ...task,
                              uniqueId: `${task.taskId}-${task.listId}`
                          }))
                      };
                  }).sort((a,b) => a.index - b.index);
                  setLists(updatedLists);
              } else {
                  console.log("There are no lists");
              }
          }
      } catch (error) {
          console.error("There has been an error fetching lists")
      }
  };
  useEffect(()=> {
  
    if (workspaceContext.board && boardId) {
      getLists();
      getTasks();
    }
  },[workspaceContext.board, boardId]);

  const updateListBackend = async (listId, newPos) => {
    try {
      const data = {
        listId: listId,
        newIndex: newPos
      }
      const response = await putData('/backend/list/DragNDropList', data);
      console.log(response.data);
    } catch (error) {
      console.log("Theres been an error moving the list");
      getLists();
      getTasks();
    }
  }

  const updateTaskBackend = async (task, list, newIndex)  => {
    try {
      const data = {
        taskId: task,
        listId: list,
        newIndex: newIndex
      }
      const taskResponse = await putData("/backend/task/DragNDropTask", data);
      console.log(taskResponse.data);
    } catch (error) {
      console.log("Theres been an error moving the task");
      getLists();
      getTasks();
    }
  }

  const handleTaskDelete = async (taskId) => {
    try {
        const data = {
            taskId: taskId,
        };
        const taskDeleteResponse = await deleteData('/backend/task/DeleteTask', data);
        if (taskDeleteResponse) {
            setTasks(prevTasks => prevTasks.filter(t => t.taskId != taskId))
        }

    } catch (error) {
        console.error("There was an error deleting the task");
        getLists();
        getTasks();
    }
}

  const findValueOfItems = (id, type) => {
    if (type == "list") {
      return lists.find((list) => list.listId == id);
    }
    if (type == "task") {
      const task = tasks.find((task) => task.uniqueId === id);
      if (task) {
        return lists.find((list) => list.listId === task.listId);
    }
    }
  }

  const handleDragStart = event => {
    const { active }= event;
    const { id } = event;
    setActiveId(id);
    try {
      if (active.data.current.type.includes("list")) {
        const draggingList = lists.find(l => l.listId == active.id);
        setActiveList(draggingList);
      }
      if (active.data.current.type.includes("task")) {
        const draggingTask = tasks.find(t => t.uniqueId == active.id);
        setActiveTask(draggingTask);
      }
    } catch (error) {
      console.log("There was an error!");
      setActiveId(null);
      setActiveList(null);
      setActiveTask(null);
    }
    
  }

  const handleDragMove = event => {
    const {active, over} = event;
    
    try {
    //handle items sorting
    //if both tasks
    if (active?.data.current.type.includes("task") && over?.data.current.type.includes("task") && active && over && active.id != over.id) {
      //find active list and over list
      const activeList = findValueOfItems(active.id, 'task');
      const overList = findValueOfItems(over.id, 'task');

      if (!activeList || !overList) return;

      //Find the active and over list index
      const activeListIndex = lists.findIndex(
        list => list.listId == activeList.listId
      );
      const overListIndex = lists.findIndex(
        list => list.listId == overList.listId
      );

      const activeTaskIndex = tasks.filter(task => task.listId == activeList.listId).findIndex(
        task => task.uniqueId == active.id
      );

      const overTaskIndex = tasks.filter(task => task.listId == overList.listId).findIndex(
        task => task.uniqueId == over.id
      );
      
      //if in same list
      if (activeListIndex == overListIndex) {
        const tasksTarget = tasks.filter(task => task.listId == activeList.listId);
        const reorderedTasks = arrayMove(tasksTarget, activeTaskIndex, overTaskIndex);
        const newTasks = tasks.map(task => {
          if (task.listId === activeList.listId) {
            // Replace tasks with reordered tasks
            const updatedTask = reorderedTasks.shift();
            return updatedTask || task;
          }
          return task;
        });
        setTasks(newTasks);
        return;
      } else {
        // qitu veq change listId tani ne same container e ndreq indeksin
        // kur e change listId also change oldList indexes

        const updatedTasks = tasks.map(task => {
          if (task.uniqueId === active.id) {
            return { ...task, listId: overList.listId };
          } else {
            return task;
          }
        });
        setTasks(updatedTasks);
  
    }
    }

    //if task dropped into container
    if (active.data.current.type.includes("task") && over?.data.current.type.includes("list") && active && over && active.id != over.id) {

      //Find active and over list
      const activeList = findValueOfItems(active.id, 'task');
      const overList = findValueOfItems(over.id, 'list');

      if (!activeList || !overList) return;

      //find the index of the active and over list

      const activeListIndex = lists.findIndex(
        list => list.listId == activeList.listId
      );
      const overListIndex = lists.findIndex(
        list => list.listId == overList.listId
      );

      const activeTaskIndex = tasks.filter(task => task.listId == activeList.listId).findIndex(
        task => task.uniqueId == active.id
      );

      //if moving task and touching list.
      if (activeListIndex == overListIndex) {
        //handle in dragend SEND TO 
        //handle it in task/task
        console.log("TASK OVER ITS OW?N LISTT");
      } else {
        //change list id and handle it with task/task
        console.log("TASK OVER NEW LISTTT");
        const updatedTasks = tasks.map(task => {
          if (task.uniqueId === active.id) {
            return { ...task, listId: overList.listId };
          }
          return task;
        });
        setTasks(updatedTasks);
      }

    }

  } catch (error) {
      console.log("There was an error");
      setActiveId(null);
      setActiveList(null);
      setActiveTask(null);
    }

}

  const handleDragEnd = event => {
    const {active, over} = event;

    try {
        // handle container sorting
        if (active.data.current.type.includes("list") && over.data.current.type.includes("list") && active && over && active.id != over.id) {
          const activeListIndex = lists.findIndex(
            (list) => list.listId == active.id
          );
          const overListIndex = lists.findIndex(
            (list) => list.listId == over.id
          );

          const activeList = lists.find((list) => list.listId == active.id);

          let newLists = [... lists];
          updateListBackend(active.id, overListIndex);
          newLists = arrayMove(newLists, activeListIndex, overListIndex);
          setLists(newLists);
        }

        if (active.data.current.type == "task" && over.data.current.type == "task") {
          const activeList = findValueOfItems(active.id , "task");
          
          const activeTask = tasks.find(task => task.uniqueId == active.id);
          const activeTaskIndex = tasks.filter(task => task.listId == activeList.listId).findIndex(
            task => task.uniqueId == active.id
          );
          
          updateTaskBackend(activeTask.taskId, activeList.listId, activeTaskIndex);
        }

        if (active.data.current.type == "task" && over.data.current.type == "list") {
          const overList = findValueOfItems(over.id, "list");
          const overListTasksLength = tasks.filter(t => t.listId == overList.listId).length - 1;
          const activeTask = tasks.find(task => task.uniqueId == active.id);
          updateTaskBackend(activeTask.taskId, overList.listId, overListTasksLength);
        }
        
    } catch (error) {
      console.error("There was an error");
    } finally {
      setActiveId(null);
      setActiveTask(null);
      setActiveList(null);
    }
    
  }

  const sensors = useSensors(
    
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 10,
      }
    })
  );
  const contextValue = {tasks, setTasks, lists, setLists, getTasks, getLists, selectedListId, setSelectedListId, handleTaskDelete}
  if (workspaceContext.board == null) {
    return <LoadingModal/>
  }
  return (
    <BoardContext.Provider value={contextValue}>
      <header className="flex flex-wrap items-center justify-between p-4 bg-opacity-70 text-white shadow-lg" style={{ backgroundImage: 'linear-gradient(115deg, #1a202c, #2d3748)', width: workspaceContext.open ? 'calc(100vw - 288px)' : 'calc(100vw - 41px)'  }}>
              <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-slate-200 mr-4">{workspaceContext.board.title}</h2>
            
                  <StarButton board={workspaceContext.board} />
              </div>

              <div className="ml-5 flex items-center flex-row flex-wrap">
                  <button className="mr-4" onClick={() => navigate(`/main/boardSettings/${workspaceId}/${workspaceContext.board.boardId}/`)}>
                      <IoIosSettings className="text-gray-500 text-3xl" />
                  </button>
                  <DropdownContext.Provider value={pfpValues}>
                      <MemberProfilePic />
                  </DropdownContext.Provider>
              </div>

              
        </header>
    <div className="max-w-full max-h-screen h-screen" style={{backgroundImage: `url(purple.jpg)`,backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                              }} >
            

        
        <div className="m-0 p-5 h-screen flex flex-start space-x-4 items-baseline min-h-screen max-h-screen overflow-x-auto max-w-full">
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
              <SortableContext items={lists.map(list => list.listId)}>
                {lists.map((list) => (
                  <List key={list.listId} list={list}>
                    <SortableContext items={tasks.filter(task => task.listId == list.listId).map(task => task.uniqueId)}>
                      <div className="flex items-start flex-col overflow-y-auto max-h-[650px] scrollbar-thin">
                        {tasks.filter(task => task.listId == list.listId).map((task) => (
                          <Task key={task.uniqueId} task={task} />
                        ))}
                      </div>
                    </SortableContext>  
                  </List>
                ))}
              </SortableContext>
                <DragOverlay>
                    {activeTask ? <Task key={activeTask.uniqueId} task={activeTask} /> : null}
                    {activeList ? <List key={activeList.listId} list={activeList}>
                      <div className="flex items-start flex-col">
                          {tasks.filter(task => task.listId == activeList.listId).map((task) => (
                            <Task key={task.uniqueId} task={task} />
                          ))}
                      </div>
                    </List> : null}
                </DragOverlay>
            </DndContext>
          <ListForm />
          <DummyList/>
          <DummyList/>
          <DummyList/>
        </div>
      </div>
      {taskId && <TaskModal/>}
      </BoardContext.Provider>
  );
};

export default Board;


