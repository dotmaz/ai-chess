console.log("Chess A.I. Loaded")

const PIECE_URLS = {
    "p": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"
    },
    "r": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg"
    },
    "b": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg"
    },
    "n": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg"
    },
    "q": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg"
    },
    "k": {
        "w": "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
        "b": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
    }
}

const chess = new Chess();
var board = chess.board();
for(let i = 0; i < 8; i++){
    for(let j = 0; j < 8; j++){
        let tile = document.createElement('div');
        tile.classList.add('tile');

        tile.id = String.fromCharCode(j+97) + (8-i).toString();
        tile.dataset.i = i;
        tile.dataset.j = j;
        
        if(i%2 == 0 && j%2 == 1 || i%2 == 1 && j%2 == 0){
            tile.classList.add('colored-tile')
        }
        document.querySelector('.board').append(tile)
    }
}



function update_board(){
    board = chess.board();
    if(chess.turn() == "w"){
        document.getElementById('turn').innerHTML = "White's turn"
    }else{
        document.getElementById('turn').innerHTML = "Black's turn"
    }
    
    document.querySelectorAll('.tile').forEach(tile => {
        let chess_piece = board[tile.dataset.i][tile.dataset.j];
        if(chess_piece){
            tile.classList.remove('null');
            tile.style.backgroundImage = `url(${PIECE_URLS[chess_piece.type][chess_piece.color]})`;
        }else{
            tile.classList.add('null');
        }
    });
    
    if(chess.game_over()){
        console.log("Game over!")
        if(chess.turn() == "w"){
            document.getElementById('turn').innerHTML = "Black wins!";
            document.getElementById('turn').style.color = "lightgreen";
        }else{
            document.getElementById('turn').innerHTML = "White wins!";
            document.getElementById('turn').style.color = "lightgreen";
        }
        return;
    }

    if(chess.turn() == "b"){
        setTimeout(bestMove, 300);
    }
}


function randomMove(){
    chess.move(chess.moves()[Math.floor(chess.moves().length*Math.random())]);
    update_board();
}

function bestMove(){
    $.ajax({
        type: "POST",
        url: 'http://localhost:4000/solve',
        data: {'fen': chess.fen()},
        success: function(res){
            let startPos = res.bestmove[0] + res.bestmove[1]
            let endPos = res.bestmove[2] + res.bestmove[3]
            console.log(res)
            attemptMove(startPos, endPos);
        },
        error: function(err){
            document.open();
            document.write(err.responseText);
            document.close();
        }
    });
}

function attemptMove(start_position, end_position){
    let legal_moves = chess.moves({'verbose': 'true'});
    let legal_move_keys = chess.moves();
    for(let i = 0; i < legal_moves.length; i++){
        if(legal_moves[i].from == start_position && legal_moves[i].to == end_position){
            chess.move(legal_move_keys[i]);
            update_board();
        }
    }
}

update_board();

var isMoving = false;
var movingTileId;
var mouse_piece_element = document.getElementById('mouse-piece');

$('.tile').mousedown(e=>{
    let tile = e.target;
    let chess_piece = board[tile.dataset.i][tile.dataset.j];
    if(chess_piece && !chess.game_over() && chess.turn() == "w"){
        if(chess_piece.color == "b"){return;}
        movingTileId = tile.id;
        movingImage = tile.style.backgroundImage;
        document.getElementById('mouse-piece').style.backgroundImage = movingImage
        tile.style.backgroundImage = "";
        isMoving = true;
    }
})

$('.tile').mouseup(e=>{
    let tile = e.target;
    if(tile.id != movingTileId){
        attemptMove(movingTileId, tile.id);
    }
})

$('.tile').mouseover(e=>{
    if(e.target.id != movingTileId && isMoving){
        e.target.classList.add('visible-outline');
    }
})

$('.tile').mouseout(e=>{
    e.target.classList.remove('visible-outline');
})

$(document).mouseup(e=>{
    if(isMoving){
        document.getElementById(movingTileId).style.backgroundImage = movingImage;
        document.getElementById('mouse-piece').style.backgroundImage = "";
        isMoving = false;
        e.target.classList.remove('visible-outline');
    }
})

$(document).mousemove((e)=>{
    mouse_piece_element.style.top = e.pageY-50 + "px";
    mouse_piece_element.style.left = e.pageX-50 + "px"
})

