const express = require('express');
const router = express.Router();
const fs = require('fs');
const moment = require('moment-timezone');

// Temporary in-memory storage for comments (Replace with a database in production)
let comments = [];

// Load comments from a file if available
try {
  const data = fs.readFileSync('comments.json', 'utf8');
  comments = JSON.parse(data);
} catch (err) {
  console.error('Error loading comments:', err);
}

// Initialize comments.json with an empty array if it doesn't exist
if (!fs.existsSync('comments.json')) {
  fs.writeFileSync('comments.json', '[]');
}

// GET home page
router.get('/', (req, res, next) => {
  const comments = JSON.parse(fs.readFileSync('comments.json', 'utf8'));
  // Sorting based on query parameters
  const sort = req.query.sort;
  if (sort === 'likes') {
    comments.sort((a, b) => b.likes - a.likes); // descending order by likes
  } else if (sort === 'oldest') {
    comments.sort((a, b) => new Date(a.date) - new Date(b.date)); // ascending order by date
  } else {
    // default to newest if no sort specified or if 'newest' is specified
    comments.sort((a, b) => new Date(b.date) - new Date(a.date)); // descending order by date
  }
  let n = 4;
  let isSP = false;
  const userAgent = req.headers['user-agent'];
  if (userAgent.match(/iPhone|Android.+Mobile/)) {
    n = 2;
    isSP = true;
  }
  res.render('index', { title: 'みんなのとくぎ', comments: comments, n: n , isSP: isSP});
});

// GET comment page
router.get('/comment', (req, res, next) => {
  res.render('comment', { title: 'しょうもない"とくぎ"をおしえてね' });
});

// POST to add a comment
router.post('/comment', (req, res, next) => {
  const { username, skill, comment } = req.body;

  // Gets the current date in "YYYY-MM-DDTHH:MM:SS" format
  const date = moment.tz('Asia/Tokyo').format('YYYY-MM-DDTHH:mm:ss');
  comments.push({ username, skill, comment, likes: 0, date });
  fs.writeFileSync('comments.json', JSON.stringify(comments, null, 2), 'utf8');
  res.redirect('/');
});

// GET user-specific comments page
router.get('/user/:username', (req, res, next) => {
  const comments = JSON.parse(fs.readFileSync('comments.json', 'utf8'));
  const username = req.params.username;
  const userComments = comments.filter(
    (comment) => comment.username === username
  );

  if (userComments.length === 0) {
    res.send('Comment not found');
  } else {
    res.render('user-comments', { userComments });
  }
});

//like feature
router.post('/like/:username/:skill', (req, res, next) => {
  const comments = JSON.parse(fs.readFileSync('comments.json', 'utf8'));
  const { username, skill } = req.params;
  const commentToLike = comments.find(
    (comment) => comment.username === username && comment.skill === skill
  );

  if (commentToLike) {
    commentToLike.likes += 1;
    fs.writeFileSync(
      'comments.json',
      JSON.stringify(comments, null, 2),
      'utf8'
    );

    // Redirect based on hidden input value
    const redirectURL = req.body.redirect || '/'; // Fallback to home page if not provided
    res.redirect(redirectURL);
  } else {
    res.status(404).send('Comment not found');
  }
});

module.exports = router;
