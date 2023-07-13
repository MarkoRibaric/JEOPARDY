  import React, { useEffect, useState } from 'react';
  import './grid.css';
  import GridValues from './gridValues';
  import {gridStatusEnum} from './gameBoard'

  export default function GameConfigurationGrid(props) {
    const [themes, setThemes] = useState([]);
    const [selectedThemeId, setSelectedThemeId] = useState('');
    const [selectedColumn, setSelectedColumn] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const [questionsByDifficulty, setQuestionsByDifficulty] = useState({
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    });
  
    useEffect(() => {
      fetch('http://localhost:5000/api/themes')
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
  
        fetch(`http://localhost:5000/api/themes/${selectedThemeId}`)
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
      fetch(`http://localhost:5000/api?themes=${JSON.stringify(firstColumnValues)}`)
        .then(response => response.json())
        .then(data => {
          const { theme, questions } = data;
          const newGridValues = new GridValues(theme, ...questions.flatMap(q => [q.question, q.answer]));
          props.setGridValues(prevGridValues => {
            const updatedGridValues = [...prevGridValues];
            updatedGridValues[columnIndex] = [...newGridValues.toArray()];
            console.log(updatedGridValues)
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
    
    
    
    return (
      <div className="container">
        <div className="top-container">
          <div>
            <button id="startGameButton" onClick={() => props.setGridStatus(gridStatusEnum.PLAY)}>Start game</button>
          </div>
          <div>
            Logged in user: {props.user} {props.id}
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
