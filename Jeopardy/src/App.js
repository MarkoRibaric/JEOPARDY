import './App.css';
import { useState, useEffect } from 'react';
import GameBoard from './components/grid/gameBoard';
import EditDatabase from './components/grid/EditDatabase';
import Login from './components/Login/Login';
import { socket } from './socket';

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

    const joinRoom = () => {
        socket.emit('JoinRoom', {
            roomCode: "XYZ"
        });
    }

    useEffect(() => {
        function onConnect() {
            console.log("Connected")
        }
    
        function onDisconnect() {
            console.log ("Disconnected!");
        }

        function onUserJoin(data) {
            console.log(data);
        }
    
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('UserJoin', onUserJoin);
    
        return () => {
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('UserJoin', onUserJoin);
        };
      }, []);
    

    return (
        <>
        <div className="App">
        {pageState === pages.LOGIN && <Login handleGoToIndexPage={handleGoToIndexPage} setCurrentLoggedInUser={setCurrentLoggedInUser} />}
        {pageState === pages.INDEX && <GameBoard handleGoToEditPage={handleGoToEditPage} user={currentloggedinuser} id={currentloggedinuserID}/>}
        {pageState === pages.EDIT && <EditDatabase handleGoToIndexPage={handleGoToIndexPage} user={currentloggedinuser} id={currentloggedinuserID}/>}
        <button onClick={joinRoom}>Test join room</button>

      </div>

        </>
    );
}

export default App;