import './App.css';
import { useState } from 'react';
import GameBoard from './components/grid/gameBoard';
import EditDatabase from './components/grid/EditDatabase';
import Login from './components/Login/Login';

function App() {
    const [currentloggedinuser, setCurrentLoggedInUser] = useState("");
    const [currentloggedinuserID, setCurrentLoggedInUserID] = useState(0);
    const pages = {
        LOGIN : 1,
        INDEX: 2,
        EDIT: 3
    }
    const [pageState, setPageState] = useState(pages.LOGIN)
    const handleGoToEditPage = () => {
        setPageState(pages.EDIT);
    };

    const handleGoToIndexPage = (user, id) => {
        setCurrentLoggedInUser(user);
        setCurrentLoggedInUserID(id);
        setPageState(pages.INDEX);
      };

    return (
        <>
        <div className="App">
        {pageState === pages.LOGIN && <Login handleGoToIndexPage={handleGoToIndexPage} setCurrentLoggedInUser={setCurrentLoggedInUser} />}
        {pageState === pages.INDEX && <GameBoard handleGoToEditPage={handleGoToEditPage} user={currentloggedinuser} id={currentloggedinuserID}/>}
        {pageState === pages.EDIT && <EditDatabase handleGoToIndexPage={handleGoToIndexPage} user={currentloggedinuser} id={currentloggedinuserID}/>}
      </div>
        </>
    );
}

export default App;