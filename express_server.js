const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

/* Generates a random string, used for creating short URLs. */
const generateRandomString = function() {
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    const randomCharCode = Math.floor(Math.random() * 26 + 97);
    const randomChar = String.fromCharCode(randomCharCode);
    randomString += randomChar;
  }
  return randomString;
};
/* Keeps track of all Long/Input URLs and their created short URLS. */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* Responds to '/urls' GET request with rendered HTML of urls_index.ejs. */
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render('urls_index', templateVars);
});

/* Responds to '/urls/new' GET request with rendered HTML of urls_new.ejs */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

/* Responds to '/urls/:shortURL' GET request with rendered HTML of urls_show.ejs with data specific to :shortURL */
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

/* Responds to '/u/:shortURL' GET request with the corresponding long URL, from the urlDatabase */
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send(302);
  } else {
    res.redirect(longURL);
  }
});
/* Responds to '/urls' POST request with a redirect to 'urls/${shortURL}', using the shortURL that was generated by the request */
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
/* Responds to '/urls/:shortURL/delete' POST request by deleting :shortURL in database, redirects to main '/urls' page */
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls');
});
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});