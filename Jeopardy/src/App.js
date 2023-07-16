import './App.css';
import { useState, useEffect } from 'react';
import GameBoard from './components/grid/gameBoard';
import EditDatabase from './components/grid/EditDatabase';
import Login from './components/Login/Login';
import { socket } from './socket';

function App() {
    const [currentloggedinuser, setCurrentLoggedInUser] = useState("");
    const [currentloggedinuserID, setCurrentLoggedInUserID] = useState(0);
    const [token, settoken] = useState("");

    
    
    const pages = {
        LOGIN : 1,
        INDEX: 2,
        EDIT: 3
    }
    const [pageState, setPageState] = useState(pages.LOGIN)
    const handleGoToEditPage = () => {
        setPageState(pages.EDIT);
    };

    const handleGoToIndexPage = (user, id, token) => {
        setCurrentLoggedInUser(user);
        setCurrentLoggedInUserID(id);
        settoken(token);
        setPageState(pages.INDEX);
    };

    return (
        <>
        <div className="App">
        {pageState === pages.LOGIN && <Login handleGoToIndexPage={handleGoToIndexPage} setCurrentLoggedInUser={setCurrentLoggedInUser} />}
        {pageState === pages.INDEX && <GameBoard handleGoToEditPage={handleGoToEditPage} user={currentloggedinuser} token={token} id={currentloggedinuserID}/>}
        {pageState === pages.EDIT && <EditDatabase handleGoToIndexPage={handleGoToIndexPage} user={currentloggedinuser} token={token} id={currentloggedinuserID}/>}
        </div>
        </>
    );
}

export default App;