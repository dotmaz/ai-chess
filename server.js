var express = require('express');
var stockfish = require('stockfish')
var bodyparser = require('body-parser')
var cors = require('cors')
var fs = require('fs');
var app = express();
var server = app.listen(4000);
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'));
const DATA_USERS = 'data/users.json';
app.use(cors())


var fish = stockfish();
fish.postMessage('uci')
fish.onmessage = function(event){};

function read_db(url){
  return JSON.parse(fs.readFileSync(url));
};

function write_db(url, new_db){
  fs.writeFileSync(url, JSON.stringify(data));
}

app.get('/time', (req, res)=>{
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  res.json({'date': date, 'time': Date.now()});
});

app.post('/solve', (req, res)=>{
  console.log(req.body);
  fish.onmessage = event=>{
    if(event.includes('bestmove')){
      let result = {'bestmove': event.split(' ')[1]};
      console.log(result);
      res.json(result);
    }
  }
  fish.postMessage('position fen ' + req.body.fen);
  fish.postMessage('go');
});


// fish.onmessage = function(event) {
//   if(event.data){
//     console.log(event.data)
//   }else{
//     if(event.includes("bestmove")){
//       console.log("Best move found: " + event.split(' ')[1]);
//     }else{
//       console.log(event);
//     }
//   }
// };
// console.log(fish)