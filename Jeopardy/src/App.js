import './App.css';
import { useState } from 'react';
import GameBoard from './components/grid/gameBoard';
import EditDatabase from './components/grid/EditDatabase';
import Login from './components/Login/Login';

function App() {
    const [currentloggedinuser, setCurrentLoggedInUser] = useState("");
    const pages = {
        LOGIN : 1,
        INDEX: 2,
        EDIT: 3
    }
    const [pageState, setPageState] = useState(pages.LOGIN)
    const handleGoToEditPage = () => {
        setPageState(pages.EDIT);
    };

    const handleGoToIndexPage = (user) => {
        setCurrentLoggedInUser(user);
        setPageState(pages.INDEX);
      };

    return (
        <>
        <div className="App">
        {pageState === pages.LOGIN && <Login handleGoToIndexPage={handleGoToIndexPage} setCurrentLoggedInUser={setCurrentLoggedInUser} />}
        {pageState === pages.INDEX && <GameBoard handleGoToEditPage={handleGoToEditPage} user={currentloggedinuser} />}
        {pageState === pages.EDIT && <EditDatabase handleGoToIndexPage={handleGoToIndexPage} />}
      </div>
        </>
    );
}

export default App;