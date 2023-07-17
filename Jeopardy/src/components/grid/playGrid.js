import React, { useState, useEffect } from 'react';
import './gamegrid.css';
import { socket } from '../../socket';
import { useNavigate } from 'react-router-dom';

export default function PlayGrid(props) {
  const [clickedCell, setClickedCell] = useState(null);
  const [overlay1Visible, setOverlay1Visible] = useState(false);
  const [overlay2Visible, setOverlay2Visible] = useState(false);
  const [overlay3Visible, setOverlay3Visible] = useState(false);
  const [themes, setThemes] = useState([]);
  const [currentShownValue, setcurrentShownValue] = useState("Test");
  const [roomCode, setroomCode] = useState("Test");
  const navigate = useNavigate()

  const handleOverlay1Click = () => {
    socket.emit('overlayClicked2', clickedCell.row, clickedCell.column);
  };

  const handleOverlay2Click = () => {
    socket.emit('overlayClicked3', clickedCell.row, clickedCell.column);
  };

  const handleOverlay3Click = () => {
    socket.emit('overlayClicked4');
  };

  
  useEffect(() => {
    
    socket.emit('GetRoomName');

    socket.on('RoomName', (roomName) => {
      setroomCode(roomName);
    });
    socket.on('displayOverlay', (rowIndex, columnIndex) => {
      setClickedCell({ row: rowIndex, column: columnIndex});
      console.log(clickedCell);
      setOverlay1Visible(true);
    });
    socket.on('displayOverlay2', (question) => {
      setcurrentShownValue(question);
      setOverlay1Visible(false);
      setOverlay2Visible(true);
    });
    socket.on('displayOverlay3', (answer) => {
      setcurrentShownValue(answer);
      setOverlay2Visible(false);
      setOverlay3Visible(true);
    });
    socket.on('displayOverlay4', () => {
      setOverlay3Visible(false);
    });
    socket.on('startGame', (recievedthemes) => {
      setThemes(recievedthemes);
      console.log(recievedthemes);
    });
    

    return () => {
      socket.off('RoomName');
      socket.off('displayOverlay');
      socket.off('displayOverlay2');
      socket.off('displayOverlay3');
      socket.off('startGame');
    };
  }, []);

  const values = [...Array(5).keys()].map((x) => (x + 1) * 200);

  return (
    <div>
      <div>
        <button onClick={() => navigate("/gameboard")}>Quit game</button>
        <button onClick={() => socket.emit('startGame')}>Start Game</button>
        {roomCode}
      </div>
      <div className="grid">
        <table>
          <tbody>
            <tr className='row'>
              {themes.map((theme, columnIndex) => (
                <th key={columnIndex}>{theme}</th>
              ))}
            </tr>
            
            {Array.from(Array(5)).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from(Array(6)).map((_, columnIndex) => (
                  <td
                    key={`${rowIndex}-${columnIndex}`}
                    className={`cell ${overlay1Visible ? 'selected' : ''}`}
                    onClick={() => {
                      socket.emit('overlayClicked', rowIndex, columnIndex);
                    }}
                  >
                    <div>
                    {values[rowIndex]}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {overlay1Visible && (
          <div className="overlay" onClick={handleOverlay1Click}>{values[clickedCell.row]}</div>
        )}
        {overlay2Visible && (
          <div className="overlay" onClick={handleOverlay2Click}>{currentShownValue}</div>
        )}
        {overlay3Visible && (
          <div className="overlay" onClick={handleOverlay3Click}>{currentShownValue}</div>
        )}
      </div>
    </div>
  );
}
