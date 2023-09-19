import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'react-bootstrap/';
import { useState, useEffect } from 'react';
import GameConfigurationGrid from './components/grid/gameConfigurationGrid';
import EditDatabase from './components/grid/EditDatabase';
import Login from './components/Login/Login';
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import PlayGrid from "./components/grid/playGrid";
import PrivateRoute from './components/PrivateRoute';

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
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: <Login handleGoToIndexPage={handleGoToIndexPage}/>,
        },
        {
            path: "gameboard",
            element: <PrivateRoute token={token} ><GameConfigurationGrid handleGoToEditPage={handleGoToEditPage} user={currentloggedinuser} token={token} id={currentloggedinuserID}/></PrivateRoute>,
        },
        {
            path: "editQuestions",
            element: <PrivateRoute token={token}><EditDatabase handleGoToIndexPage={handleGoToIndexPage} user={currentloggedinuser} token={token} id={currentloggedinuserID}/></PrivateRoute>
        },
        {
            path: "play/:roomCode",
            element: <PlayGrid user={currentloggedinuser} id={currentloggedinuserID} />
        }
      ]);
      

    return (
        <>
        <div className="App">
        <RouterProvider router={router} />
        </div>
        </>
    );
}

export default App;