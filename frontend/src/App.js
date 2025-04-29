import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './Pages/loginPage.jsx';
import Dashboard from './Pages/dashboard.jsx';
import Main from './Pages/Main.jsx'
import Preview from './Components/Preview/preview.jsx';
import AboutUs from './Components/Preview/aboutus.jsx';
import ContactUs from './Components/Preview/contactus.jsx';
import PrivacyPolicy from './Components/Preview/PrivacyPolicy.jsx';
import Boards from './Components/ContentFromSide/Boards.jsx';
import TaskModal from './Components/TaskModal/TaskModal.jsx';
import SignUpPage from './Pages/signUpPage.jsx';
import Board from './Components/BoardContent/Board.jsx';
import React, { Suspense, lazy } from 'react';
import LoadingModal from './Components/Modal/LoadingModal.jsx';
import Empty from './Pages/Empty.jsx';

const App = () => {
  return (
   <> 
      <BrowserRouter>
      <Suspense fallback={<LoadingModal />}>
        <Routes>
          
          <Route path="/main/:opened/:workspaceId?/:boardId?/:taskId?" element={<Main/>}/>
          
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<SignUpPage/>}/>
          <Route path="/dashboard/*" element={<Dashboard/>}/>
          <Route path="/preview" element={<Preview/>}/>
          <Route path="/aboutus" element={<AboutUs/>}/>
          <Route path='/contactus' element={<ContactUs/>}/>
          <Route path='/privacypolicy' element={<PrivacyPolicy/>}/>
          <Route path="/board/:id" element={<Boards/>} />

          {/* Catch-all route for undefined routes */}
          <Route path="*" element={<Empty/>} />
        </Routes>
        </Suspense>
      </BrowserRouter>

    </>
    
  );
}

export default App;
