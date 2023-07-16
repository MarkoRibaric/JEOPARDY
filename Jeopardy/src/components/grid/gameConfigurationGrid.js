import React, { useEffect, useState } from 'react';
import './grid.css';
import GridValues from './gridValues';
import { gridStatusEnum } from './gameBoard'
import { socket } from '../../socket';



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
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  });

  const [roomCodeInput, setRoomCodeInput] = useState("");

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
    console.log(savetype)
    if (savetype == 0) {
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
    else if (savetype == 1) {
      console.log(selectedBoard)
      console.log(selectedBoard.id)
      console.log(selectedBoard.boardname)
      console.log(boardData)
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
        console.log(data); // Success response from the backend
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
    console.log(selectedBoardId)
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
        socket.emit('JoinRoom', {
            roomCode: roomCodeInput
            
        });
        props.setGridStatus(gridStatusEnum.PLAY)
    }
    const createNewRoom = () => {
        socket.emit('CreateRoom', {
            roomCode: generateRandomString(),
            BoardID: selectedBoard.id,
        });
        props.setGridStatus(gridStatusEnum.PLAY)
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

  return (
    <div className="container">
      <div className="top-container">
        <div>
          <button id="startGameButton" onClick={() => props.setGridStatus(gridStatusEnum.PLAY)}>Start game</button>
        </div>
        <div>
          Logged in user: {props.user} {props.id}
          <input type="text" value={name} onChange={event => setName(event.target.value)} />
          <button onClick={() => handleSaveGame(0)}>Save New Game</button>
          <select value={selectedBoard?.id || ''} onChange={handleBoardChange}>

            <option value="">Select a board</option>
            {BoardInformation.map(board => (
              <option key={board.id} value={board.id}>
                {board.boardname}
              </option>
            ))}
          </select>
          <button onClick={() => handleSaveGame(1)}>Save current game</button>
          <button onClick={() => deleteBoard()}>Delete current game</button>
          
        </div>
      </div>
      <div className="main-container">
        <div className="grid-container">
          <div className="column-container">
            {Array.from(Array(6)).map((_, buttonIndex) => {
              return <button key={buttonIndex} onClick={() => GetRandomColumnQuestion(buttonIndex)}>{`Change column ${buttonIndex + 1}`}</button>
            })}
          </div>
          <table>
            <tbody>
              {Array.from(Array(6)).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from(Array(6)).map((_, columnIndex) => (
                    <td key={`${rowIndex}-${columnIndex}`} className="theme-name">
                      <div className="question">{boardData[columnIndex][rowIndex][0]}</div>
                      <div className="answer">{boardData[columnIndex][rowIndex][1]}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sidebar-container">
          <div className="select-container">
            <select onChange={handleThemeChange}>
              <option value="">Select a theme</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.theme}
                </option>
              ))}
            </select>
            {Array.from(Array(5)).map((_, index) => (
              <select key={index} onChange={event => handleQuestionChange(event, index)}>
                <option value="">Select difficulty {index + 1} question</option>
                {questionsByDifficulty[index + 1]?.map(question => (
                  <option key={question.id} value={JSON.stringify(question)}>
                    {question.question}
                  </option>
                ))}
              </select>
            ))}
            <select value={selectedColumn} onChange={handleColumnChange}>
              <option value="">Select a column</option>
              {Array.from(Array(6)).map((_, index) => (
                <option key={index} value={index + 1}>
                  Column: {index + 1}
                </option>
              ))}
            </select>
            <button onClick={SetIndividualGridColumn}>Set Grid Values</button>

            <button onClick={() => props.handleGoToEditPage()}>Go to Edit Page</button>
            <div>
              <button onClick={joinRoom}>Test join room</button>
        <input
            type="text"
            value={roomCodeInput}
            onChange={(e) => setRoomCodeInput(e.target.value)}
        />
        <button onClick={createNewRoom}>Create new room</button>
        <button onClick={checkRooms}>Check Rooms</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
