const express = require('express');
const app = express();
const cors = require('cors')
const bcrypt = require('bcryptjs');

app.use(cors())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  next();
});




const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('quiz.db');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
let sentThemes = {};

app.post('/validatePassword', (req, res) => {
  let { username, password } = req.body;
  username = username.toLowerCase(); // Convert username to lowercase

  db.get(`SELECT id, password FROM users WHERE LOWER(username) = ?`, [username], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send({ validation: false, error: 'Internal Server Error' });
      return;
    }
    if (row) {
      const storedPassword = row.password;
      const userId = row.id; // Retrieve the user ID from the row

      bcrypt.compare(password, storedPassword, (compareErr, isMatch) => {
        if (compareErr) {
          console.error(compareErr);
          res.status(500).send({ validation: false, error: 'Internal Server Error' });
          return;
        }
        if (isMatch) {
          res.send({ validation: true, userId }); // Send the user ID along with the validation response
        } else {
          res.send({ validation: false });
        }
      });
    } else {
      res.send({ validation: false });
    }
  });
});

app.post('/registerUser', (req, res) => {
  const { username, password } = req.body;


  db.get('SELECT * FROM users WHERE username = ?', [username], (selectErr, row) => {
    if (selectErr) {
      console.error(selectErr);
      res.status(500).send({ error: 'Internal Server Error' });
      return;
    }

    if (row) {
      res.status(400).send({ error: 'Username already exists' });
      return;
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error(hashErr);
        res.status(500).send({ error: 'Internal Server Error' });
        return;
      }

      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (insertErr) => {
        if (insertErr) {
          console.error(insertErr);
          res.status(500).send({ error: 'Internal Server Error' });
          return;
        }
        res.send({ success: true });
      });
    });
  });
});




app.get("/api", (req, res) => {
  const gottenthemes = JSON.parse(req.query.themes);
  console.log(gottenthemes);
  const themeNames = gottenthemes.map(theme => `'${theme[0]}'`).join(', ');
  db.get(`
    SELECT t.id, t.theme
    FROM themes t
    JOIN questions q ON t.id = q.theme_id
    WHERE t.theme NOT IN (${themeNames})
    GROUP BY t.id, t.theme
    HAVING COUNT(DISTINCT q.difficulty) >= 5
    ORDER BY RANDOM()
    LIMIT 1
  `, function(err, row) {
    if (err) {
      console.error(err.message);
      res.status(500).json({"error": "Internal server error"});
      return;
    }
    
    if (!row) {
      sentThemes = {};
      db.all('SELECT * FROM themes', function(err, rows) {
        if (err) {
          console.error(err.message);
          res.status(500).json({"error": "Internal server error"});
          return;
        }
        
        const randomRow = rows[Math.floor(Math.random() * rows.length)];
        sentThemes[randomRow.id] = [];
        fetchQuestionsByTheme(randomRow.id, function(err, questions) {
          if (err) {
            console.error(err.message);
            res.status(500).json({"error": "Internal server error"});
            return;
          }
          
          const jsonResult = {
            theme: randomRow.theme,
            questions: questions
          };
          res.json(jsonResult);
        });
      });
      return;
    }

    sentThemes[row.id] = [];
    fetchQuestionsByTheme(row.id, function(err, questions) {
      if (err) {
        console.error(err.message);
        res.status(500).json({"error": "Internal server error"});
        return;
      }
      
      const jsonResult = {
        theme: row.theme,
        questions: questions
      };
      res.json(jsonResult);
    });
  });
});


function fetchQuestionsByTheme(themeId, callback) {
  const remainingDifficulties = [1, 2, 3, 4, 5].filter(difficulty => !sentThemes[themeId].includes(difficulty));
  const questions = [];

  const fetchQuestion = difficulty => {
    db.get(`
      SELECT question, answer, difficulty
      FROM questions
      WHERE theme_id = ? AND difficulty = ?
      ORDER BY RANDOM()
      LIMIT 1
    `, [themeId, difficulty], function(err, row) {
      if (err) {
        callback(err);
        return;
      }

      if (row) {
        questions.push({
          question: row.question,
          answer: row.answer,
          difficulty: row.difficulty
        });
        sentThemes[themeId].push(row.difficulty);
      }

      if (questions.length < remainingDifficulties.length) {
        const nextDifficulty = remainingDifficulties[questions.length];
        fetchQuestion(nextDifficulty);
      } else {
        callback(null, questions);
      }
    });
  };
  if (remainingDifficulties.length > 0) {
    const initialDifficulty = remainingDifficulties[0];
    fetchQuestion(initialDifficulty);
  } else {
    callback(null, questions);
  }
}

app.get('/api/all', (req, res) => {
  const response = {
    themes: [],
    questions: []
  };

  const userId = req.query.id; // Access the ID from the query parameter

  db.all('SELECT * FROM themes', (err, themeRows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    response.themes = themeRows;

    let query = 'SELECT * FROM questions WHERE user = ? OR user IS NULL';
    db.all(query, [userId], (err, questionRows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      response.questions = questionRows;

      res.json(response);
    });
  });
});





app.post('/api/addToDatabase', (req, res) => {
  const { theme, entries } = req.body;
  if (!theme || !entries || entries.length === 0) {
    res.status(400).json({ error: 'Invalid data provided' });
    return;
  }

  db.get('SELECT id FROM themes WHERE theme = ?', [theme], (err, row) => {
    if (err) {
      console.error('Error checking theme:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (!row) {
      db.run('INSERT INTO themes (theme) VALUES (?)', [theme], function(err) {
        if (err) {
          console.error('Error inserting theme:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        insertQuestions(this.lastID, entries); // Insert the questions into the questions table
      });
    } else {
      insertQuestions(row.id, entries); // Insert the questions into the questions table
    }
  });

  function insertQuestions(themeId, entries) {
    const insertQuery = 'INSERT INTO questions (theme_id, question, answer, difficulty, user) VALUES (?, ?, ?, ?, ?)';

    entries.forEach((entry) => {
      const { question, answer, difficulty, id} = entry;
      db.run(insertQuery, [themeId, question, answer, difficulty, id], (err) => {
        if (err) {
          console.error('Error inserting data into the database:', err);
        }
      });
    });

    res.json({ message: 'Data added to the database successfully' });
  }
});


app.delete("/api/deleteItem/:id", (req, res) => {
  const itemId = req.params.id;

  const deleteQuery = "DELETE FROM questions WHERE id = ?";
  db.run(deleteQuery, itemId, function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Failed to delete the item" });
    } else {
      console.log(`Deleted item with ID: ${itemId}`);
      res.json({ message: "Item deleted successfully" });
    }
  });
});


app.get('/api/themes', (req, res) => {
  db.all('SELECT * FROM themes', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    
    res.json(rows);
  });
});


app.get('/api/themes/:selectedThemeId', (req, res) => {
  const selectedThemeId = req.params.selectedThemeId;

  db.get('SELECT * FROM themes WHERE id = ?', [selectedThemeId], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }

    db.all('SELECT * FROM questions WHERE theme_id = ?', [selectedThemeId], (err, questionRows) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      const themeDetails = {
        id: row.id,
        theme: row.theme,
        questions: questionRows
      };

      res.json(themeDetails);
    });
  });
});



app.listen(5000, () => {
  console.log("Server started on port 5000");
});
