const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Promise = require('promise');
const twilio = require('twilio');
const randomstring = require('randomstring');

let app = express();
let jsonParser = bodyParser.json();

let lines = fs.readFileSync('rds_creds.txt').toString().split('\n');
let connection = mysql.createConnection({
    host: lines[0],
    ssl: lines[1],
    user: lines[2],
    password: lines[3]
  });

lines = fs.readFileSync('twilio_creds.txt').toString().split('\n');
const accountSid = lines[0];
const authToken = lines[1];

const client = new twilio(accountSid, authToken);

app.get('/', (req, res) => {
  res.end('yay it worked');
});

app.post('/login', jsonParser, (req, res) => {
  if (!req.body.phone || !req.body.pw) {
    res.end(JSON.stringify({msg:'invalid message'}));
    return;
  }
  getPwHash(req.body.phone).then(resp => {
    if (resp.length === 0) { // if phone number doesn't exist in database
      res.end(JSON.stringify({msg: 'invalid creds'}));
      return;
    }
    bcrypt.compare(req.body.pw, resp[0].pwHash, (err, result) => {
      if (result === false) { // if user enters wrong password
        res.end(JSON.stringify({msg: 'invalid creds'}));
        return;
      }
      res.end(JSON.stringify({msg: 'login successful'}));
    });
  }).catch(err => {
    console.log(err);
    res.end(JSON.stringify({msg: 'failure'}));
  });
});

app.post('/register', jsonParser, (req, res) => {
  if (!req.body.phone || !req.body.email || !req.body.pw || !req.body.name) {
    res.end(JSON.stringify({msg:'invalid message'}));
    return;
  }
  // check if phone number or email already exists
  checkUnique(req.body.phone, req.body.email).then(unique => {
    if (!unique) {
      res.end(JSON.stringify({msg: 'duplicate user'}));
      return;
    }
    // send phone verification code
    // ONLY 604 AND 778 NUMBERS FOR NOW
    if (!validNumber(req.body.phone)) {
      res.end(JSON.stringify({msg: 'invalid phone number'}));
      return;
    }
    let code = randomstring.generate(5);
    // only send the phone verification code if it wan't sent before
    insertVerificationCode(req.body.phone, code).then(firstMsg => {
      if (firstMsg) {
        sendPhoneCode(req.body.phone, code);
      }
    });
    res.end(JSON.stringify({msg: 'enter code'}));
  }).catch(err => {
    console.log(err);
    res.end(JSON.stringify({msg: 'failure'}));
  });
});

app.post('/register/:id', jsonParser, (req, res) => {
  // check if verification code sent by client is correct
  getCode(req.params.id).then(resp => {
    if (resp[0].code !== req.body.code) {
      res.end(JSON.stringify({msg: 'wrong code'}));
      return;
    }
    // insert new user into database  
    bcrypt.hash(req.body.pw, 10, (err, hash) => {
      if (err) {
        console.log(err);
        return;
      }
      insertUser(req.params.id, req.body.email, req.body.name, hash).then(resp => {
        res.end(JSON.stringify({msg: 'success'}));
        deleteCode(req.params.id).catch(err => {
          console.log(err);
        });
      }).catch(err => {
        console.log(err);
        res.end(JSON.stringify({msg: 'failure'}));
      });
    });
  }).catch(err => {
    console.log(err);;
    res.end(JSON.stringify({msg: 'failure'}));
  });
});

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/flavourr.club/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/flavourr.club/cert.pem'),
  ca: [fs.readFileSync('/etc/letsencrypt/live/flavourr.club/chain.pem')]
};

https.createServer(options, app).listen(443);

let httpApp = express();

httpApp.get('*', (req, res) => {
  res.redirect('https://flavourr.club' + req.url);
});

httpApp.listen(80);



function checkUnique(phone, email) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT COUNT(*)
      FROM delivery.users
      WHERE phone='${phone}' or email='${email}';`, (err, resp, fields) => {
        if (err) {
          reject(err);
        }
        if (resp[0]['COUNT(*)'] > 0) {
          resolve(false);
        }
        resolve(true);
      }
    );
  });
}

function deleteCode(phone) {
  return new Promise((resolve, reject) => {
    connection.query(
      `DELETE
      FROM delivery.codes
      WHERE phone='${phone}'`, (err, resp, fields) => {
        if (err) {
          reject(err);
        }
        resolve(resp);
      }
    );
  });
}

function getCode(phone) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT code
      FROM delivery.codes
      WHERE phone='${phone}'`, (err, resp, fields) => {
        if (err) {
          reject(err);
        }
        resolve(resp);
      }
    );
  });
}

function getPwHash(phone) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT pwHash
      FROM delivery.users
      WHERE phone='${phone}'`, (err, resp, fields) => {
        if (err) {
          reject(err);
        }
        resolve(resp);
      }
    );
  });
}

function insertUser(phone, email, name, pwHash) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO delivery.users
      (phone, email, name, pwHash)
      VALUES
      ('${phone}', '${email}', '${name}', '${pwHash}');`, (err, resp, fields) => {
        if (err) { // if insertion failed
          reject(err);
        }
        resolve(resp);
      }
    );
  });
}

function insertVerificationCode(phone, code) {
  return new Promise((resolve, reject) => {
    connection.query(
      `INSERT INTO delivery.codes
      (phone, code)
      VALUES
      ('${phone}', '${code}');`, (err, resp, fields) => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      }
    );
  });
}

function sendPhoneCode(phone, code) {
  client.messages.create({
    body: 'Your Foodelivery verification code is: ' + code,
    to: phone,
    from: '16137045289'
  });
}

function validNumber(phone) {
  if (phone.length !== 10 || Number(phone) === NaN) {
    return false;
  }
  if (phone.substring(0, 3) !== '604' && phone.substring(0, 3) !== '778') {
    return false;
  }
  return true;
}