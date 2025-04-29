import React, {createContext, useContext , useState, useEffect} from 'react';
import { getDataWithId, deleteData, postData, getDataWithIds } from '../../Services/FetchService';
import myImage from './background.jpg';
import { MainContext } from '../../Pages/MainContext';
import { useNavigate, useParams } from 'react-router-dom';
import { getData } from '../../Services/FetchService';

export const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
    const mainContext = useContext(MainContext);
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);
    const [workspace, setWorkspace] = useState(null);
    const [workspaces, setWorkspaces] = useState([]);
    const [boards, setBoards] = useState([]);
    const [starredBoards, setStarredBoards]=useState([]);
    const [selectedSort, setSelectedSort] = useState('Alphabetically');
    const [openModal, setOpenModal] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [hoveredSIndex, setHoveredSIndex] = useState(null);
    const [hoveredBoardIndex, setHoveredBoardIndex] =useState(null);
    const [hoveredBoardSIndex, setHoveredBoardSIndex] =useState(null);
    const [hover, setHover] = useState(false);
    const [openSortModal, setOpenSortModal] = useState(false);
    const [selectedBoardTitle, setSelectedBoardTitle] = useState("");
    const [openCloseModal, setOpenCloseModal] = useState(false);
    const [openClosedBoardsModal, setOpenClosedBoardsModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal]= useState(false);
    const boardCount = boards.length+starredBoards.length;
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [roli, setRoli]=useState("Member");
    const [isInviteModalOpen, setIsInviteModalOpen]= useState(false);
    const userId = mainContext.userInfo.userId;
    const WorkspaceId = mainContext.workspaceId;
    const [board, setBoard] = useState(null);
    const {workspaceId, boardId, listId, taskId }= useParams();
    // const boardId = mainContext.boardId;
    const [lists, setLists] = useState([]); 
    const [list, setList] = useState(null);
    const{} = useParams();
    const [checklists, setChecklists] = useState([]);
    const [activities, setActivities]= useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recentBoards, setRecentBoards] = useState([]);


        const getWorkspaces = async () => {
            try {
                setIsLoading(true);
                    const workspacesResponse = await getDataWithId('http://localhost:5127/backend/workspace/GetWorkspacesByMemberId?memberId', userId);
                    const workspacesData = workspacesResponse.data;
                    if (workspacesData && Array.isArray(workspacesData) && workspacesData.length > 0) {
                        setWorkspaces(workspacesData);

                        const recentBoards = workspacesData
                        .flatMap(workspace => workspace.boards)
                        .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
                        .slice(0, 5);

                        console.log("PARAAA RECENTTTT: ",recentBoards);
                        

                        setRecentBoards(recentBoards);
                    } else {
                        setWorkspaces([]);
                        console.log("There are no workspaces");
                    }
                //Waiting for userIdn
            } catch (error) {
                console.error("There has been an error fetching workspaces")
                setWorkspaces([]);
            } finally {
                setIsLoading(false);
            }
        };
    useEffect(() => {
        if (userId) {
            getWorkspaces();
        }
    }, [userId, board ,mainContext.userInfo]);


    useEffect(()=>{
        const getActivities = async () =>{
            try{
                if(workspace){
                    const activityResponse = await getDataWithId("http://localhost:5127/backend/workspaceActivity/GetWorkspaceActivityByWorkspaceId?workspaceId", WorkspaceId);
                    //console.log("Te dhenat e aktivitetit ",activityResponse.data)
                    const activityData = activityResponse.data;
                    if (activityData && Array.isArray(activityData) && activityData.length > 0) {
                        setActivities(activityData);
                    } else {
                        setActivities([]);
                        console.log("There is no workspace activity");
                    }
                }
                //Waiting for userIdn
            } catch (error) {
                console.error("There has been an error fetching workspace activities")
                setActivities([]);
            }
        };
        getActivities();
        //console.log("Activity fetched ",activities);
    },[workspace]);
    




    useEffect(() => {
        const getWorkspace = async () => {
            try {
                if (WorkspaceId) {
                    const workspaceResponse = await getDataWithId('http://localhost:5127/backend/workspace/GetWorkspaceById?workspaceId', WorkspaceId);
                    const workspaceData = workspaceResponse.data;
                    //console.log('Workspace data: ', workspaceData);
                    setWorkspace(workspaceData);
                }
            } catch (error) {
                if (error.response) {
                    console.log(error.response.data);
                }
                navigate('/main/workspaces'); //Nese ska qasje, shko tek workspaces
            }
        };
        getWorkspace();

        // const interval = setInterval(getWorkspace, 5 * 1000);
        // return () => clearInterval(interval); //Get workspace every 5 seconds
    }, [WorkspaceId, userId, mainContext.userInfo.accessToken]);//userid


    useEffect(()=>{
        if (workspace && WorkspaceId && userId) {
            const ownerId = workspace.ownerId;
            if (userId === ownerId) {
                setRoli("Owner");
                //console.log("Set as owner with id", ownerId);
                //console.log("WORKSPACE OWNER IS: "+workspace.ownerId)
            } else {
                setRoli("Member");
                //console.log("Set as member with id", userId);
            }
        }
    }, [WorkspaceId, userId, workspace, mainContext.userInfo.accessToken]);
 
    
    const workspaceTitle = workspace ? workspace.title : 'Workspace';
    useEffect(() => {
        const getBoards = async () => {
            try {
                if (WorkspaceId && workspace && userId) {
                    const boardsResponse = await getDataWithId('http://localhost:5127/backend/board/GetBoardsByWorkspaceId?workspaceId', WorkspaceId);
                    const allBoards = boardsResponse.data;
                    
                        //largoj closed boards
                    const openBoards = allBoards.filter(board => !board.isClosed);
    
                    const starredResponse = await getDataWithId('http://localhost:5127/backend/starredBoard/GetStarredBoardsByWorkspaceId?workspaceId', WorkspaceId);
                    const starredBoards = starredResponse.data;
    
                    const starredBoardsIds = new Set(starredBoards.map(board => board.boardId));
    
                    //filtrimi per starred bords dhe jo starred
                    const nonStarred = openBoards.filter(board => !starredBoardsIds.has(board.boardId));
                    const starred = openBoards.filter(board => starredBoardsIds.has(board.boardId));
    
                    // sortimi nese klikohet alafabetikisht
                    let sortedNonStarred = nonStarred;
                    if (selectedSort === 'Alphabetically') {
                        sortedNonStarred = sortAlphabetically(nonStarred);
                    }
    
                    setBoards(sortedNonStarred);
                    setStarredBoards(starred);
                }
            } catch (error) {
                if (error.response) {
                    console.error(error.response.data);
                }
                navigate('/main/workspaces');
                setBoards([]);
                setStarredBoards([]);
            }
        };
    
        getBoards();
    }, [WorkspaceId, userId, workspace, selectedSort, mainContext.userInfo.accessToken]);


    const [memberDetails, setMemberDetails] = useState([]);

        const getMembers = async () => {
            try {   
                if (workspace) {
                    const response = await getDataWithId('/backend/Members/GetAllMembersByWorkspace?workspaceId', workspaceId);
                    const data = response.data;
                    setMembers(data);

                    const memberDetail = await Promise.all(data.map(async member =>{
                        const responseMemberDetail = await getDataWithId('http://localhost:5127/backend/user/adminUserID?userId', member.userId);                        
                        return responseMemberDetail.data;
                    }))
                    setMemberDetails(memberDetail);
                    //console.log('Members fetched: ',members);
                }                    
            } catch (error) {
                console.error("Error fetching members");

            }
        };

    useEffect(() => {
        getMembers();
    },[WorkspaceId, workspace, mainContext.userInfo.accessToken]);


    const handleRemoveMember = async(memberId, workspaceId) => {
       const removeMemberDto = {
        userId: memberId,
        workspaceId: workspaceId
       }
       
        try {
            const response = await deleteData('http://localhost:5127/backend/Members/RemoveMember',removeMemberDto);
            getMembers();
            
        } catch (error) {
            console.error("Error removing member");
        }
        
    }


    const handleCreateBoard = (newBoard) => {
        setBoards((prevBoards) => [...prevBoards, newBoard]);
    };

    
    const[updateWorkspaceModal, setUpdateWorkspaceModal] = useState(false);
    const [closedBoards, setClosedBoards] = useState([]);
    const handleWorkspaceUpdate = (updatedWorkspace) => {
        setWorkspace((prev) => ({
          ...prev,
          title: updatedWorkspace.Title,
          description: updatedWorkspace.Description,
        }));
      };

      const fetchClosedBoards=async ()=>{
        try{
            const response = await getDataWithId('http://localhost:5127/backend/board/GetClosedBoards?workspaceId', WorkspaceId);
            setClosedBoards(response.data);
        }catch(error){
            console.error("Error fetching closed boards");
        }
    };



    const handleCloseBoard = async (boardId) => {
        try{
            const closedBoard = {
                boardId: boardId,                
            };
            const response = await postData('http://localhost:5127/backend/board/Close', closedBoard);
            console.log("Board closed ",response.data);
           
            
            setBoards((prevBoards) => prevBoards.filter((b)=> b.boardId !== boardId));
            setStarredBoards((prevStarredBoards) => prevStarredBoards.filter((b) => b.boardId !== boardId));
            // const closedBoardData = response.data;
            // setClosedBoards((prevClosedBoards)=> [...prevClosedBoards, closedBoardData]);
        }
        catch(error){
            if (error.response) {
                console.error("Error closing board:",error.response?.data || error.message);
            }
        }
    }

    


    
    const handleCreateWorkspace = (newWorkspace) => {
      setWorkspaces((prevWorkspaces) => [...prevWorkspaces, newWorkspace]);
  }

    const sortAlphabetically = (boards) => {
        return boards.slice().sort((a, b) => a.title.localeCompare(b.title));
    };

    const sortByRecent = async () => {
        const dataResponse = await getDataWithId('http://localhost:5127/backend/board/GetBoardsByWorkspaceId?workspaceId', WorkspaceId);
        return dataResponse.data;
    };

    const handleSortChange = async (sortType) => {
        setSelectedSort(sortType);
        let sortedBoards = boards;
        if (sortType === 'Alphabetically') {
            sortedBoards = sortAlphabetically(boards);
        } else {
            sortedBoards = await sortByRecent();
        }
        setBoards(sortedBoards);
    };
    const handleStarBoard = async (board) => {
        const isStarred = starredBoards.some(b => b.boardId === board.boardId);
        const data = {
            BoardId: board.boardId,
            UserId: userId,
            WorkspaceId: WorkspaceId,
        };
        try {
            if (isStarred) {
    
                    // Unstar the board
                    await deleteData('http://localhost:5127/backend/starredBoard/UnstarBoard', data);
                } else {
                    // Star the board
                    await postData('http://localhost:5127/backend/starredBoard/StarBoard', data);
                }
                
                // Re-fetch boards and starred boards
                const boardsResponse = await getDataWithId('http://localhost:5127/backend/board/GetBoardsByWorkspaceId?workspaceId', WorkspaceId);
                const allBoards = boardsResponse.data;
        
                const starredResponse = await getDataWithId('http://localhost:5127/backend/starredBoard/GetStarredBoardsByWorkspaceId?workspaceId', WorkspaceId);
                const updatedStarredBoards = starredResponse.data;
        
                const starredBoardsIds = new Set(updatedStarredBoards.map(board => board.boardId));
        
                const nonStarred = allBoards.filter(board => !starredBoardsIds.has(board.boardId));
                const starred = allBoards.filter(board => starredBoardsIds.has(board.boardId));
        
                let sortedNonStarred = nonStarred;
                if (selectedSort === 'Alphabetically') {
                    sortedNonStarred = sortAlphabetically(nonStarred);
                }
        
                setStarredBoards(starred);
                setBoards(sortedNonStarred);
        } catch (error) {
            console.error("Error starring/unstarring the board");
        }
    };

    const handleStarButtonClick = (event, board) => {
        event.stopPropagation();  //se len mu hap bordi kur te behet star
        handleStarBoard(board);
    };
  



    
    const handleDeleteWorkspace = async(workspaceId) =>{
        console.log('Deleting workspace with Id: ', workspaceId);
        try{
            const response = await deleteData('http://localhost:5127/backend/workspace/DeleteWorkspace', { workspaceId: workspaceId });
            console.log('Deleting workspace response:', response);
            navigate('/main/workspaces');
        }
        catch(error){
            console.error('Error deleting workspace');
        }

     };
     const handleLeaveWorkspace = async(workspaceId, userId)=>{
        console.log('Leaving workspace with Id: ',workspaceId);
        try{
            const response = await deleteData('http://localhost:5127/backend/Members/RemoveMember', {UserId: userId, WorkspaceId: workspaceId});
            console.log('Leaving workspace response:', response);
            navigate(`/main/workspaces`);
        }
        catch(error){
            console.error('Error deleting workspace');
        }
     };

     const getTasks =async ()=>{

        try{
            const tasksResponse = await getDataWithId('http://localhost:5127/backend/task/GetTasksByWorkspaceId?workspaceId', WorkspaceId);
            const tasksData = tasksResponse.data;
            console.log("Tasks data: ",tasksData);
            setTasks(tasksData);
        }catch (error) {
            console.error("Theres been an error fetching the tasks");
            //console.error(error.message);
        }
    };


    // useEffect(()=>{
    //     if (WorkspaceId) {
    //         getTasks();
    //         console.log("Workspace id ",WorkspaceId);
    //         console.log("Tasks fetched: ",tasks);
    //     }
    // }, [WorkspaceId]);
    
        const getInitials = (firstName, lastName) => {
            if (!firstName || !lastName) {
                return '';
            }
            return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        };

        const getInitialsFromFullName = (fullName) => {
            if (!fullName) {
                return '';
            }
        
            // Split the full name by spaces
            const nameParts = fullName.trim().split(' ');
       
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
        
            // Return the initials
            return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        };
        
        const openInviteModal = () => setIsInviteModalOpen(true);
        const closeInviteModal = () => setIsInviteModalOpen(false);

        const [sentInvites, setSentInvites] = useState([]);
        const [inviteeDetails, setInviteeDetails] = useState([]);
        const [workspaceTitles, setWorkspaceTitles] = useState([]);
    
        const getSentInvites = async () => {
            try {
                const response = await getDataWithId('http://localhost:5127/backend/invite/GetInvitesByWorkspace?workspaceId', WorkspaceId);
                let data = response.data;
                //console.log("Sent Invites fetched: ", data);
        
                // filtrimi i ftesave pending
                let pendingInvites = data.filter(invite => invite.inviteStatus === "Pending");
                //console.log("Pending invites: ", pendingInvites);
        
                // sortimi i ftesave ne baze te dates (recent lart)
                pendingInvites = pendingInvites.sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));
                setSentInvites(pendingInvites);
    
                // Fetch inviter details for each invite
                const invited = await Promise.all(pendingInvites.map(async invite => {
                    const responseInvitee = await getDataWithId('http://localhost:5127/backend/user/adminUserID?userId', invite.inviteeId);
                    return responseInvitee.data;
                }));
                const workspaceTitlesData = await Promise.all(pendingInvites.map(async invite => {
                    const responseWorkspace = await getDataWithId('http://localhost:5127/backend/workspace/getWorkspaceById?workspaceId', invite.workspaceId);
                    return responseWorkspace.data.title; // Assuming the workspace object has a 'title' field
                }));
    
                setInviteeDetails(invited);
                setWorkspaceTitles(workspaceTitlesData);
            } catch (error) {
                console.log("Error fetching invites");
            }
        };

        
    
        useEffect(() => {
            if (workspace) {
                getSentInvites();
            }
            
        }, [workspace]);
    
    
        const handleDeleteInvite = async(inviteId) => {
            console.log("Deleting invite with id: ", inviteId);
            try{
                const response = await deleteData(`http://localhost:5127/backend/invite/DeleteInviteById?InviteId'`, {inviteId});
                console.log("Deleting invite response: ",response);
                getSentInvites();
            }
            catch(error){
                console.error("Error deleting invite");
            }
        };

        useEffect(()=>{
        
            const getBoard = async () =>{
                try {
                    if(boardId){
                        const boardResponse = await getDataWithId('/backend/board/GetBoardById?boardId',boardId);
                        const boardData = boardResponse.data;
                        setBoard(boardData);
                    }
                    
                } catch (error) {
                    if (error.response) {
                        console.log(error.response.data);
                    }
        
                    //navigate('/main/workspaces');
                }
            };
            getBoard();
        },[boardId, userId, mainContext.userInfo.accessToken]);

        const getChecklistsByTask = async () => {
            try {
              if (taskId) {
                const response = await getDataWithId(
                  'http://localhost:5127/backend/checklist/GetChecklistByTaskId?taskId',
                  taskId
                );
                const data = response.data;
                console.log('Fetched checklists:', data); // Log checklists data for debugging
                setChecklists(data);
          
                // Fetch checklist items after setting checklists
                if (Array.isArray(data)) {
                  fetchChecklistItems(data);
                } else {
                  console.error("Invalid checklists data received.");
                }
              }
            } catch (error) {
              console.error("Error fetching checklists");
            }
          };
          
          useEffect(() => {
            getChecklistsByTask();
          }, [WorkspaceId, workspaces, mainContext.userInfo.accessToken, taskId]);
          
          const [checklistItems, setChecklistItems] = useState([]);
          
          const fetchChecklistItems = async (checklists) => {
            const items = {};
          
            if (!Array.isArray(checklists)) {
              console.error("Invalid checklists:", checklists);
              return;
            }
          
            for (const checklist of checklists) {
              if (!checklist.checklistId) {
                console.error("Invalid checklistId for checklist:", checklist);
                continue;
              }
          
              try {
                const response = await getDataWithId(
                  'http://localhost:5127/backend/checklistItems/GetChecklistItemByChecklistId?checklistId',
                  checklist.checklistId
                );
                items[checklist.checklistId] = response.data; // Store items by checklist ID
              } catch (error) {
                console.error(`Error fetching items for checklist ${checklist.checklistId}`);
              }
            }
          
            setChecklistItems(items);
          };
          

            



        const handleCreateList = (newList) =>{
            setLists((prevLists) => [...prevLists, newList]);
        };

        useEffect(() =>{
            const getList = async () => {
                try {
                    if(listId){
                        const listResponse = await getDataWithId('http://localhost:5127/backend/list/GetListById',listId);
                        const listData = listResponse.data;
                        setList(listData);
                    }
                } catch (error) {
                    if (error.response) {
                        console.log(error.response.data);
                    }   
                    navigate('/main/workspaces');
                    
                }
            };
            getList();
        },[listId, userId ,mainContext.userInfo.accessToken]);


        const countClosedBoards = closedBoards.length;
        const ALLBoardsCount = boardCount+countClosedBoards;
  
        const [selectedBoardId, setSelectedBoardId] = useState(null);

    return (
        <WorkspaceContext.Provider value={{
            WorkspaceId,
            workspace,
            workspaces,
            setWorkspaces,
            boards,
            selectedSort,
            open,
            setOpen,
            workspaceTitle,
            setHover,
            hover,
            openCloseModal,
            setOpenSortModal,
            setOpenCloseModal,
            openSortModal,
            setOpenModal,
            openModal,
            setHoveredIndex,
            hoveredIndex,
            hoveredSIndex,
            setHoveredSIndex,
            setSelectedBoardTitle,
            selectedBoardTitle,
            roli,
            hoveredBoardIndex,
            setHoveredBoardIndex,
            hoveredBoardSIndex,
            setHoveredBoardSIndex,
            sortAlphabetically,
            sortByRecent,
            handleSortChange,
            handleStarBoard,
            handleCloseBoard,
            setOpenClosedBoardsModal,
            openClosedBoardsModal,
            setBoards,
            showLimitModal,
            setShowLimitModal,
            boardCount,
            setWorkspace,
            handleCreateWorkspace,
            members,
            updateWorkspaceModal,
            setUpdateWorkspaceModal,
            handleWorkspaceUpdate,
            handleCreateBoard,
            starredBoards,
            handleDeleteWorkspace,
            showDeleteWorkspaceModal,
            setShowDeleteWorkspaceModal,
            userId,
            handleLeaveWorkspace,
            tasks,
            setTasks,
            getTasks,
            openInviteModal,
            closeInviteModal,
            isInviteModalOpen,
            getInitials,
            handleDeleteInvite,
            getSentInvites,
            sentInvites, 
            setSentInvites,
            inviteeDetails, 
            setInviteeDetails, 
            workspaceTitles, 
            setWorkspaceTitles,
            getInitialsFromFullName,
            memberDetails,
            setMemberDetails,
            handleRemoveMember,
            checklists,
            checklistItems,
            setChecklistItems,
            setChecklists,
            board,
            setBoard,
            lists,
            setLists,
            handleCreateList,
            listId,
            list,
            activities,
            isLoading,
            setIsLoading,
            getWorkspaces,
            setList,
            fetchClosedBoards,
            closedBoards,
            setClosedBoards, 
            countClosedBoards,
            ALLBoardsCount,
            fetchChecklistItems,
            recentBoards,
            setRecentBoards,
            getChecklistsByTask,
            handleStarButtonClick,
            selectedBoardId,
            setSelectedBoardId
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
