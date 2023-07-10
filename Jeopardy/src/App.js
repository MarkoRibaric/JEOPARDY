import './App.css';
import { useState } from 'react';
import GameBoard from './components/grid/gameBoard';
import EditDatabase from './components/grid/EditDatabase';

function App() {
    const pages = {
        INDEX: 1,
        EDIT: 2
    }
    const [pageState, setPageState] = useState(pages.INDEX)
    const handleGoToEditPage = () => {
        setPageState(pages.EDIT);
    };

    const handleGoToIndexPage = () => {
        setPageState(pages.INDEX);
    };

    return (
        <>
        <div className="App">
        {pageState === pages.INDEX && <GameBoard handleGoToEditPage={handleGoToEditPage}/>}
        {pageState === pages.EDIT && <EditDatabase handleGoToIndexPage={handleGoToIndexPage}/>}
        </div>
        </>
    );
}

export default App;