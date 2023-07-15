import React, { useEffect, useState } from 'react';
import './grid.css';
import GridValues from './gridValues';
import { gridStatusEnum } from './gameBoard'

export default function GameConfigurationGrid(props) {
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [name, setName] = useState('');
  const [boardData, setBoardData] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [questionsByDifficulty, setQuestionsByDifficulty] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/themes', {
      headers: {
        Authorization: `Bearer ${props.token}` // Add the token to the Authorization header
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
    const firstColumnValues = props.gridValues.map(row => row[0]);
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

        props.setGridValues(prevGridValues => {
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

    props.setGridValues(prevGridValues => {
      const updatedGridValues = [...prevGridValues];
      updatedGridValues[selectedColumn - 1] = [...newGridValues.toArray()];
      return updatedGridValues;
    });
  }


  function handleSaveGame(savetype) {
    console.log(savetype)
    if(savetype==0){
      props.SaveData(null, props.token, name, props.gridValues);
      fetch('http://localhost:5000/api/boards', {
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setBoardData(data);
      })
      .catch(error => {
        console.error('Error fetching board data:', error);
      });
    }
    else if(savetype==1){
      console.log(selectedBoard)
      console.log(selectedBoard.id)
      console.log(selectedBoard.boardname)
      console.log(props.gridValues)
      props.SaveData(selectedBoard.id, props.token, selectedBoard.boardname, props.gridValues);
    }
  }

  useEffect(() => {
    fetch('http://localhost:5000/api/boards', {
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then(response => response.json())
      .then(data => {
        setBoardData(data);
      })
      .catch(error => {
        console.error('Error fetching board data:', error);
      });
  }, [selectedBoard]);



  function handleBoardChange(event) {
    const selectedBoardId = event.target.value;
    console.log(selectedBoardId)
    const selectedBoardData = boardData.find(board => parseInt(board.id) === parseInt(selectedBoardId));
    setSelectedBoard(selectedBoardData);
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
          props.setGridValues(parsedData);
        })
        .catch(error => {
          console.error('Error fetching board data:', error);
        });
    }
  }, [selectedBoard]);
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
          <select value={selectedBoard} onChange={handleBoardChange}>
            <option value="">Select a board</option>
            {boardData.map(board => (
              <option key={board.id} value={board.id}>
                {board.boardname}
              </option>
            ))}
          </select>
          <button onClick={() => handleSaveGame(1)}>Save current game</button>
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
                      <div className="question">{props.gridValues[columnIndex][rowIndex][0]}</div>
                      <div className="answer">{props.gridValues[columnIndex][rowIndex][1]}</div>
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

          </div>
        </div>
      </div>
    </div>
  );
}
