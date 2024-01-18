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
  let selectedLang = req.cookies.lang || 'ja'; // デフォルトは日本語
  if (req.query.lang) {
    selectedLang = req.query.lang;
    res.cookie('lang', selectedLang, { maxAge: 900000, httpOnly: true });
  }
  req.setLocale(selectedLang);

  let langClass = 'lang-' + selectedLang; // デフォルトは日本語

  res.render('index', {
    title: res.__('title'),
    title2: res.__('title2'),
    btn1: res.__('btn1'),
    btn2: res.__('btn2'),
    btn3: res.__('btn3'),
    btn4: res.__('btn4'),
    comments: comments,
    n: n,
    isSP: isSP,
    langClass: langClass,
  });
});

// GET comment page
router.get('/comment', (req, res, next) => {
  let isSP = false;
  const userAgent = req.headers['user-agent'];
  if (userAgent.match(/iPhone|Android.+Mobile/)) {
    isSP = true;
  }
  let selectedLang = req.cookies.lang;
  if (req.query.lang) {
    selectedLang = req.query.lang;
  }
  let langClass = 'lang-' + selectedLang;

  res.render('comment', {
    ctitle: res.__('ctitle'),
    ctitle2: res.__('ctitle2'),
    cbtn: res.__('cbtn'),
    form1: res.__('form1'),
    form2: res.__('form2'),
    form3: res.__('form3'),
    submit: res.__('submit'),
    isSP: isSP,
    langClass: langClass,
  });
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
  let isSP = false;
  const userAgent = req.headers['user-agent'];
  if (userAgent.match(/iPhone|Android.+Mobile/)) {
    isSP = true;
  }
  if (userComments.length === 0) {
    res.send('Comment not found');
  } else {
    res.render('user-comments', {
      utitle: res.__('utitle'),
      cbtn: res.__('detail'),
      userComments,
      isSP: isSP,
    });
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
