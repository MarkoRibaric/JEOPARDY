import React, { useState, useEffect } from "react";

function TextEntry({ value, onChange }) {
  const handleInputChange = (event) => {
    onChange(event.target.value);
  };

  return <input type="text" value={value} onChange={handleInputChange} />;
}

export default function EditDatabase(props) {
  useEffect(() => {
    fetchData();
  }, []);

  const [data, setData] = useState({ themes: [], questions: [] });
  const [themeEntry, setThemeEntry] = useState("");
  const [qaEntries, setQAEntries] = useState([
    { question: "", answer: "", difficulty: 1, id: props.id},
    { question: "", answer: "", difficulty: 2, id: props.id},
    { question: "", answer: "", difficulty: 3, id: props.id},
    { question: "", answer: "", difficulty: 4, id: props.id},
    { question: "", answer: "", difficulty: 5, id: props.id}
  ]);
  
  function fetchData() {
    fetch(`http://localhost:5000/api/all?id=${props.id}`)
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
      },
      body: JSON.stringify(dataToAdd),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data added to database:", data);
        setThemeEntry("");
        setQAEntries([
          { question: "", answer: "", difficulty: 1, id: props.id},
          { question: "", answer: "", difficulty: 2, id: props.id},
          { question: "", answer: "", difficulty: 3, id: props.id},
          { question: "", answer: "", difficulty: 4, id: props.id},
          { question: "", answer: "", difficulty: 5, id: props.id}
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
            Logged in user: {props.user} {props.id}
          </div>
      <div>
        <button onClick={() => props.handleGoToIndexPage()}>Go to configuration page</button>
        <button onClick={handleRefresh}>Refresh Database</button>
      </div>

      <div>
        <strong>Theme:</strong>
        <TextEntry value={themeEntry} onChange={handleThemeEntryChange} />
      </div>

      <div>
        <ul style={{ marginTop: "10px" }}>
          {qaEntries.map((entry, index) => (
            <li key={index}>
              <strong>Question:</strong>
              <TextEntry
                value={entry.question}
                onChange={(value) => handleQAEntryChange(index, "question", value)}
              />
              <strong>Answer:</strong>
              <TextEntry
                value={entry.answer}
                onChange={(value) => handleQAEntryChange(index, "answer", value)}
              />
              <strong>Difficulty:</strong>
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
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '20px', maxHeight: '200px', overflowY: 'scroll' }}>
        <ul>
          {data.questions.map((item) => (
            <li key={item.id}>
              <strong>Theme:</strong> {data.themes[item.theme_id - 1].theme} &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Question:</strong> {item.question} &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Answer:</strong> {item.answer} &nbsp;&nbsp;&nbsp;&nbsp;
              <strong>Difficulty:</strong> {item.difficulty}
              <strong>User:</strong> {item.user}
              <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={handleAddToDatabase}>Add to database</button>
      </div>
    </>
  );
}
