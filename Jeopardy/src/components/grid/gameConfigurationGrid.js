import React, { useEffect, useState } from 'react';
import './grid.css';
import GridValues from './gridValues';
import { socket } from '../../socket';
import { useNavigate } from 'react-router-dom';
import { Button, Form,  Nav, NavDropdown, Navbar, Table } from 'react-bootstrap';


export default function GameConfigurationGrid(props) {
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [name, setName] = useState('');
  const [BoardInformation, setBoardInformation] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [boardData, setBoardData] = useState(Array.from(Array(6), () => Array(6).fill("")));
  const [questionsByDifficulty, setQuestionsByDifficulty] = useState({
    1: [], 2: [], 3: [], 4: [], 5: []});

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/themes', {
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setThemes(data);
      })
      .catch(error => {
        console.error('Error fetching themes:', error);
      });
  }, []);



  function handleThemeChange(event) {
    const selectedThemeId = event.target.value;

    if (selectedThemeId) {
      setSelectedThemeId(selectedThemeId);
      fetch(`http://localhost:5000/api/themes/${selectedThemeId}`, {
        headers: {
          Authorization: `Bearer ${props.token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          const { questions } = data;

          const updatedQuestionsByDifficulty = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: []
          };

          questions.forEach(question => {
            const { difficulty } = question;
            updatedQuestionsByDifficulty[difficulty].push(question);
          });
          setQuestionsByDifficulty(updatedQuestionsByDifficulty);
        })
        .catch(error => {
          console.error('Error fetching theme details:', error);
        });

    } else {
      setSelectedThemeId('');
      setQuestionsByDifficulty({
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      });
    }
  }

  function handleColumnChange(event) {
    setSelectedColumn(event.target.value);
  }

  function handleQuestionChange(event, index) {
    const selectedValue = event.target.value;
    if (selectedValue === "") {
      const updatedSelectedQuestions = [...selectedQuestions];
      updatedSelectedQuestions[index] = null;
      setSelectedQuestions(updatedSelectedQuestions);
      return;
    }
    try {
      const selectedQuestion = JSON.parse(selectedValue);
      const updatedSelectedQuestions = [...selectedQuestions];
      updatedSelectedQuestions[index] = selectedQuestion;
      setSelectedQuestions(updatedSelectedQuestions);
    } catch (error) {
      console.error('Error parsing selected question:', error);
    }
  }

  function GetRandomColumnQuestion(columnIndex) {
    const firstColumnValues = boardData.map(row => row[0]);
    const token = props.token;

    fetch(`http://localhost:5000/randomcolumn?themes=${JSON.stringify(firstColumnValues)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => {

        const { theme, questions } = data;
        const newGridValues = new GridValues(theme, ...questions.flatMap(q => [q.question, q.answer]));

        setBoardData(prevGridValues => {
          const updatedGridValues = [...prevGridValues];
          updatedGridValues[columnIndex] = [...newGridValues.toArray()];
          return updatedGridValues;
        });
      });
  }

  function SetIndividualGridColumn() {
    if (selectedQuestions.length < 5 || !selectedColumn) {
      console.error('Invalid selection: Please choose 5 questions and a column.');
      return;
    }

    if (selectedQuestions.some(question => question === null || question === undefined)) {
      console.error('Invalid selection: Some of the selected questions are null or undefined.');
      return;
    }

    const newGridValues = new GridValues(
      themes.find(theme => theme.id === parseInt(selectedThemeId))?.theme,
      ...selectedQuestions.flatMap(q => [q.question, q.answer])
    );

    setBoardData(prevGridValues => {
      const updatedGridValues = [...prevGridValues];
      updatedGridValues[selectedColumn - 1] = [...newGridValues.toArray()];
      return updatedGridValues;
    });
  }


  function handleSaveGame(savetype) {
    const isNameAbsent = BoardInformation.some(item => item.boardname === name);
    if (savetype == 0) {
      if(name!="" && !isNameAbsent){
        SaveData(null, props.token, name, boardData);
        fetch('http://localhost:5000/api/boards', {
          headers: {
            Authorization: `Bearer ${props.token}`
          }
        })
          .then(response => response.json())
          .then(data => {
            setBoardInformation(data);
          })
          .catch(error => {
            console.error('Error fetching board data:', error);
          });
      }
      else{
        alert("You have to give a name to the board!")
      }
      
    }
    else if (savetype === 1 && selectedBoard && selectedBoard.id !== null) {
      console.log(selectedBoard);
      console.log(selectedBoard.id);
      console.log(selectedBoard.boardname);
      console.log(boardData);
      SaveData(selectedBoard.id, props.token, selectedBoard.boardname, boardData);
    }
    
  }

  function SaveData(id, token, name, gridValues) {
    const backendUrl = "http://localhost:5000/saveboard";
    fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id, name, gridValues })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error("Error saving data:", error);
      });
  }

  function deleteBoard() {
    if (!selectedBoard || !selectedBoard.id) {
      console.error('Invalid selection: No board selected');
      return;
    }

    const boardId = selectedBoard.id;
    console.log(boardId)
    fetch(`http://localhost:5000/api/boards/${boardId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then(response => {
        if (response.ok) {
          console.log(`Board with ID ${boardId} deleted successfully.`);
        } else {
          console.error('Error deleting board:', response.status);
        }
      })
      .catch(error => {
        console.error('Error deleting board:', error);
      });
    setSelectedBoard(null)
  }

  useEffect(() => {
    fetch('http://localhost:5000/api/boards', {
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setBoardInformation(data);
      })
      .catch(error => {
        console.error('Error fetching board data:', error);
      });
  }, [selectedBoard]);



  function handleBoardChange(event) {
    const selectedBoardId = event.target.value;
    const selectedBoardInformation = BoardInformation.find(board => parseInt(board.id) === parseInt(selectedBoardId));
    setSelectedBoard(selectedBoardInformation);
  }


  useEffect(() => {
    if (selectedBoard) {
      fetch(`http://localhost:5000/api/boards/${selectedBoard.id}`, {
        headers: {
          Authorization: `Bearer ${props.token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          const parsedData = JSON.parse(data.data);
          setBoardData(parsedData);
        })
        .catch(error => {
          console.error('Error fetching board data:', error);
        });
    }
  }, [selectedBoard]);


  
    const joinRoom = () => {
      if(roomCodeInput.length === 5){
        socket.emit('JoinRoom', {
          roomCode: roomCodeInput
        });
        navigate("/play/"+roomCodeInput);
      }
      else{
        alert("The length of the room code has to be 5!")
      }
    }

    
    const checkRooms = () => {
        socket.emit('CheckRooms');
      };

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
        
        function onRoomList(rooms) {
            console.log('Room list:', rooms);
          }
    
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('UserJoin', onUserJoin);
        socket.on('RoomList', onRoomList);
        return () => {
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('UserJoin', onUserJoin);
          socket.off('RoomList', onRoomList);
        };
      }, []);
    
      

    function generateRandomString() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const randomString = Array.from({ length: 5 }, () => characters[Math.floor(Math.random() * characters.length)]);
        return randomString.join('');
    }

    const createNewRoom = (numberteams) => {
      if(selectedBoard != ""){
        const roomCode = generateRandomString();
        socket.emit('CreateRoom', {
            roomCode: roomCode,
            BoardID: selectedBoard.id,
            numberofteams: numberteams
        });
        navigate("/play/"+roomCode);
      }
      else{
        alert("You have to pick a board");
      }
  }


  return (
    <div className="h-100">
      <Nav className="mb-4 bg-dark p-2 d-flex align-items-center gap-3" activeKey="1">
      <NavDropdown className='text-white' title={<span className='text-white'>START GAME</span>} id="nav-dropdown">
        <NavDropdown.Item onClick={() => createNewRoom(2)}  eventKey="4.1">2 TEAMS</NavDropdown.Item>
        <NavDropdown.Item onClick={() => createNewRoom(3)}  eventKey="4.2">3 TEAMS</NavDropdown.Item>
        <NavDropdown.Item onClick={() => createNewRoom(4)}  eventKey="4.3">4 TEAMS</NavDropdown.Item>
      </NavDropdown>
      <Form className="d-flex">
            <Form.Control
              type="joinroom"
              placeholder="Room code"
              className="me-2 "
              aria-label="Room code"
              onChange={(e) => setRoomCodeInput(e.target.value)}
              
            />
            <Button variant="outline-light text-nowrap" onClick={joinRoom}>JOIN ROOM</Button>
          </Form>
      <Nav.Item className="ms-auto text-white d-flex align-items-center">
          Signed in as: {props.user}
      </Nav.Item>
    </Nav>
      <div className="top-container">
        <div className='d-flex gap-2 ms-4'>
          <input type="text" value={name} placeholder="New Room Name" onChange={event => setName(event.target.value)} />
          <button className='btn btn-outline-light' onClick={() => handleSaveGame(0)}>Save New Game</button>
        <select className='btn btn-outline-light' value={selectedBoard?.id != null ? selectedBoard.id : ''} onChange={handleBoardChange}>
          <option className='option-bg-color' value="">Select a board</option>
          {BoardInformation.map(board => (
            <option className='option-bg-color' key={board.id} value={board.id}>
              {board.boardname}
            </option>
          ))}
        </select>
          <button className='btn btn-outline-light' onClick={() => handleSaveGame(1)}>Save current game</button>
          <button className='btn btn-outline-light' onClick={() => deleteBoard()}>Delete current game</button>
        </div>
      </div>
      <div className="main-container">
        <div className="grid-container ms-4">
          <div className="column-container d-flex w-100">
            
          </div>
          <Table responsive variant='dark' bordered>
              <thead>
                <tr>
                  {Array.from(Array(6)).map((_, buttonIndex) => {
                  return <th className='p-0'><button className='border-0 btn btn-outline-light fs-5 fw-bold py-4 rounded-0 w-100' key={buttonIndex} onClick={() => GetRandomColumnQuestion(buttonIndex)}>{`RANDOMIZE COLUMN`}</button></th>
                })}
               </tr>
              </thead>
              <tbody>
                    {Array.from(Array(6)).map((_, rowIndex) => (
                    <tr itemScope="col" key={rowIndex}>
                      {Array.from(Array(6)).map((_, columnIndex) => (
                        <td key={`${rowIndex}-${columnIndex}`} className="theme-name">
                          <div className="question">{boardData[columnIndex][rowIndex][0]}</div>
                          <div className="answer">{boardData[columnIndex][rowIndex][1]}</div>
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </Table>
        </div>
        <div className="sidebar-container">
          <div className="select-container">
            <select className='btn btn-outline-light' onChange={handleThemeChange}>
              <option value="">Select a theme</option>
              {themes.map(theme => (
                <option className='option-bg-color' key={theme.id} value={theme.id}>
                  {theme.theme}
                </option>
              ))}
            </select>
            {Array.from(Array(5)).map((_, index) => (
              <select className='btn btn-outline-light' key={index} onChange={event => handleQuestionChange(event, index)}>
                <option className='option-bg-color' value="">Select difficulty {index + 1} question</option>
                {questionsByDifficulty[index + 1]?.map(question => (
                  <option className='option-bg-color' key={question.id} value={JSON.stringify(question)}>
                    {question.question}
                  </option>
                ))}
              </select>
            ))}
            <select className='btn btn-outline-light' value={selectedColumn} onChange={handleColumnChange}>
              <option className='option-bg-color' value="">Select a column</option>
              {Array.from(Array(6)).map((_, index) => (
                <option className='option-bg-color' key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button className='btn btn-outline-light' onClick={SetIndividualGridColumn}>Set Grid Values</button>
            <button className='btn btn-outline-light' onClick={() => navigate("/editQuestions")}>Go to Edit Page</button>
          </div>
        </div>
      </div>
    </div>
  );
}