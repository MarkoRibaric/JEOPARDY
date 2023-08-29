import React, { useState, useEffect } from "react";
import { Button, Nav, NavDropdown, Table } from "react-bootstrap";
import { Form, useNavigate } from "react-router-dom";
import './database.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowsRotate, faPlus } from "@fortawesome/free-solid-svg-icons";


function TextEntry({ value, onChange }) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  return <input className="rounded-1 border-0" type="text" value={value} onChange={handleInputChange} />;
}

export default function EditDatabase(props) {
  useEffect(() => {
    fetchData();
  }, []);

  const [data, setData] = useState({ themes: [], questions: [] });
  const [themeEntry, setThemeEntry] = useState("");
  const [qaEntries, setQAEntries] = useState([
    { question: "", answer: "", difficulty: 1},
    { question: "", answer: "", difficulty: 2},
    { question: "", answer: "", difficulty: 3},
    { question: "", answer: "", difficulty: 4},
    { question: "", answer: "", difficulty: 5}
  ]);
  const navigate = useNavigate();
  
  function fetchData() {
    fetch('http://localhost:5000/api/all', {
      headers: {
        Authorization: `Bearer ${props.token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  

  function handleRefresh() {
    fetchData();
  }

  const handleThemeEntryChange = (value) => {
    setThemeEntry(value);
  };

  const handleQAEntryChange = (index, field, value) => {
    const updatedEntries = [...qaEntries];
    updatedEntries[index][field] = value;
    setQAEntries(updatedEntries);
  };

  const handleDifficultyChange = (index, value) => {
    const updatedEntries = [...qaEntries];
    updatedEntries[index].difficulty = parseInt(value);
    setQAEntries(updatedEntries);
  };


  const handleAddToDatabase = () => {
    if (themeEntry === "") {
      console.log("Theme field is required");
      return;
    }
  
    const entriesToAdd = qaEntries.filter(
      (entry) => entry.question !== "" && entry.answer !== ""
    );
    console.log(entriesToAdd);
    const dataToAdd = {
      theme: themeEntry,
      entries: entriesToAdd,
    };
    
    fetch("http://localhost:5000/api/addToDatabase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${props.token}` // Include the token in the headers
      },
      body: JSON.stringify(dataToAdd),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data added to database:", data);
        setThemeEntry("");
        setQAEntries([
          { question: "", answer: "", difficulty: 1 },
          { question: "", answer: "", difficulty: 2 },
          { question: "", answer: "", difficulty: 3 },
          { question: "", answer: "", difficulty: 4 },
          { question: "", answer: "", difficulty: 5 }
        ]);
        fetchData();
      })
      .catch((error) => {
        console.error("Error adding data to database:", error);
      });
  };
  

 
  const handleDeleteItem = (itemId) => {
    const confirmed = window.confirm("Are you sure you want to delete this item?");
    if (!confirmed) {
      return;
    }
    fetch(`http://localhost:5000/api/deleteItem/${itemId}`, {
      headers: {
        "Authorization": `Bearer ${props.token}`
      },
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Item deleted:", data);
        fetchData();
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
      });
  };

  return (
    <>
    <div>
      <Nav className="mb-4 bg-dark p-2 d-flex align-items-center gap-3" activeKey="1">
        <Button variant="outline-light text-nowrap"  onClick={() => navigate("/gameBoard")}><FontAwesomeIcon icon={faArrowLeft} /></Button>
        <Button variant="outline-light text-nowrap" onClick={handleRefresh}><FontAwesomeIcon icon={faArrowsRotate} /> Refresh database</Button>
      </Nav>
    </div>

      <div>
        
      </div>

      <div className="text-white p-4 adding-Form">
        <div className="d-flex gap-2 mb-2">
        <span className="fw-bold fs-4">Theme:</span>
        <TextEntry value={themeEntry} onChange={handleThemeEntryChange} />
        </div>
        <div>
          {qaEntries.map((entry, index) => (
            <div key={index} className="d-flex gap-3 mb-1">
              <div className="d-flex gap-2">
                <span className="fw-bold">Question:</span>
                <TextEntry
                value={entry.question}
                onChange={(value) => handleQAEntryChange(index, "question", value)}
              />
              </div>
              
              <div className="d-flex gap-2">
              <span className="fw-bold">Answer:</span>
              <TextEntry
                value={entry.answer}
                onChange={(value) => handleQAEntryChange(index, "answer", value)}
              />
              </div>
              <div className="d-flex gap-2">
              <span className="fw-bold">Difficulty:</span>
              <select
                value={entry.difficulty}
                onChange={(event) => handleDifficultyChange(index, event.target.value)}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "20px" }}>
        <Button variant="outline-light text-nowrap" onClick={handleAddToDatabase}><FontAwesomeIcon icon={faPlus} /> Add to database</Button>
      </div>
      </div>

      <div style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'scroll' }}>
      <Table responsive variant='dark' bordered>
      <thead>
      <tr>
          <th>Theme</th>
          <th>Question</th>
          <th>Answer</th>
          <th>Difficulty</th>
          <th>Delete Item</th>
        </tr>
      </thead>
      <tbody>
        {data.questions.toReversed().map((item, rowIndex) => (
          <tr key={item.id}>
            <td>{data.themes[item.theme_id - 1].theme}</td>
            <td>{item.question}</td>
            <td>{item.answer}</td>
            <td>{item.difficulty}</td>
            {item.user === props.id ? (
            <td>
            <button className='btn btn-outline-danger' onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </td>
            ) : (
              <td></td> 
            )}
          </tr>
        ))}
      </tbody>
    </Table>
      </div>
      
    </>
  );
}
