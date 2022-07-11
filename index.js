let displayedBoard = [];
let board = [];
let pickedPiece = null
let greenHilightedTiles = []
let redHilightedTiles = []
let history = [];
let currentPlayer = "White"
let kimg = "figures/king";
let qimg = "figures/queen";
let rimg = "figures/rook";
let bimg = "figures/bishop";
let nimg = "figures/knight";
let pimg = "figures/pawn";

class Piece{
    owner;
    position;
    imgPath;
    img;
    moveCounter = 0;
    //figureMoves is array of arrays representing vectors [y,x]
    figureMoves;
    //directions will be used to compute figureMoves for some figures
    directions;

    constructor(owner, position){
        this.owner = owner;
        this.position = position;
        board[position[0]][position[1]] = this;
        displayedBoard[this.position[0]][this.position[1]].addEventListener("mousedown", picked_up);
    }

    add_img(figureImgPath){

        this.imgPath = figureImgPath + this.owner + ".png";
        this.img = document.createElement("img");
        this.img.src = this.imgPath;
        this.img.classList.add("basicFigure")
        displayedBoard[this.position[0]][this.position[1]].appendChild(this.img);
    }

    delete(){
        board[this.position[0]][this.position[1]] = null;
        displayedBoard[this.position[0]][this.position[1]].removeChild(this.img)
        displayedBoard[this.position[0]][this.position[1]].removeEventListener("mousedown", picked_up)
        delete this
    }

    get_valid_moves(){
        let validatedMoves = []
        this.update_figure_moves()
        let moves = this.figureMoves
        if (moves === null){
            return[]
        }
        for (var i=0; i<moves.length; i++){
            let move = moves[i]
            if ((move[0] + this.position[0])<8 &&(move[0]+this.position[0])>=0 && (move[1] + this.position[1])<8 && (move[1] + this.position[1])>=0){
                if (board[move[0] + this.position[0]][move[1] + this.position[1]] === null){
                    validatedMoves.push(move)
                }else{
                    if (board[move[0] + this.position[0]][move[1] + this.position[1]].owner != this.owner) {
                        validatedMoves.push(move)
                    }
                }
            }
        }
        return validatedMoves
    }

    directions_to_figureMoves(){
        let moves = []
        for(var i =0; i<this.directions.length;i++){
            let direction = this.directions[i]
            let y = this.position[0] + direction[0]
            let x = this.position[1] + direction[1]
            while ((x<8) && (x>=0) && (y>=0) && (y<8)){
                moves.push([y-this.position[0], x - this.position[1]])
                if (!(board[y][x] === null)){
                    break
                }           

                y = y + direction[0]
                x = x + direction[1]
            }
        }
        return moves
    }
}

class King extends Piece{
    constructor(owner, position){
        super(owner,position);
        this.add_img(kimg);
    }
    // King has two functions for moves; update_possible_figure_moves is called first and based on it check_for_attacks eliminates moves putting king in check;
    update_possible_figure_moves(){
        this.possibleFigureMoves = [
            [-1,-1],
            [-1,0],
            [-1,1],
            [0,-1],
            [0,1],
            [1,-1],
            [1,0],
            [1,1]
        ];
    }
    update_figure_moves(){
        this.figureMoves = this.check_for_attacks()
    }
    check_for_attacks(){
        let endangeredTiles = new Set
        for(var i=0; i<board.length; i++){
            for(var j=0; j<board[i].length; j++){
                if (board[i][j] != null){
                    if (board[i][j].owner != this.owner){
                        let pos = board[i][j].position
                        if (board[i][j].constructor.name == "Pawn"){
                            let pawn = board[i][j]
                            endangeredTiles.add([pawn.dir + pos[0], pos[1] + 1])
                            endangeredTiles.add([pawn.dir + pos[0], pos[1] - 1])
                            continue
                        }
                        //to avoid recursion by calling king.get_valid_moves() on enemy king 
                        if (board[i][j].constructor.name == "King"){
                            let kingMoves = [
                                [-1,-1],
                                [-1,0],
                                [-1,1],
                                [0,-1],
                                [0,1],
                                [1,-1],
                                [1,0],
                                [1,1]
                            ];
                            for(var k =0; k<kingMoves.length; k++){
                                endangeredTiles.add([pos[0]+ kingMoves[k][0], pos[1] + kingMoves[k][1]])
                            }
                            continue
                        }else{
                            let moves = board[i][j].get_valid_moves()
                            for(var k =0; k<moves.length; k++){
                                let move = moves[k]
                                endangeredTiles.add([move[0] + pos[0], move[1] + pos[1]])
                                continue
                            }
                        }
                    }
                }    
            }
        }
        // moves are vectors, positions and tiles are coordinates
        this.update_possible_figure_moves()
        let moves = this.possibleFigureMoves
        let positions = []
        for (var i=0; i<moves.length; i++){
            positions.push([this.position[0] + moves[i][0], this.position[1] + moves[i][1]])
        }
        console.log(positions)
        console.log(endangeredTiles)
        for (var i=0; i<positions.length; i++){
            endangeredTiles.forEach(pos => {
                if ((pos[0] == positions[i][0]) && (pos[1] == positions[i][1])){
                    positions.splice(i,1)
                    console.log("position: " + pos[0] + " " + pos[1])
                }
                if (pos[0]<8 && pos[0]>=0 && pos[1]<8 && pos[1]>=0){
                displayedBoard[pos[0]][pos[1]].classList.add("redDashedTile")
                }
            });
        }
        console.log("positions", positions)
        let safeMoves = []
        for (var i=0; i<positions.length; i++){
            safeMoves.push([positions[i][0] - this.position[0] , positions[i][1] - this.position[1]])
        }
        return safeMoves
    }
}




class Queen extends Piece{
    constructor(owner, position){
        super(owner,position)
        this.add_img(qimg)
        this.directions = [
            [1,0],
            [-1,0],
            [0,-1],
            [0,1],
            [-1,-1],
            [-1,1],
            [1,-1],
            [1,1]
        ]
    }
    update_figure_moves(){
        this.figureMoves = this.directions_to_figureMoves()
    }
}

class Rook extends Piece{
    constructor(owner, position){
        super(owner, position)
        this.add_img(rimg)  
        this.directions = [
            [1,0],
            [-1,0],
            [0,-1],
            [0,1]
        ]
    }
    update_figure_moves(){
        this.figureMoves = this.directions_to_figureMoves()
    }
}

class Bishop extends Piece{
    constructor(owner, position){
        super(owner,position)
        this.add_img(bimg)
        this.directions = [
            [-1,-1],
            [-1,1],
            [1,-1],
            [1,1]
        ]
    }
    update_figure_moves(){
        this.figureMoves = this.directions_to_figureMoves()
    }
}

class Knight extends Piece{
    constructor(owner, position){
        super(owner,position)
        this.add_img(nimg)
    }
    update_figure_moves(){
        this.figureMoves = [
            [-1,-2],
            [-1,2],
            [1,-2],
            [1,2],
            [2,1],
            [2,-1],
            [-2,1],
            [-2,-1]
        ]

    }
}

class Pawn extends Piece{
    constructor(owner, position){
        super(owner,position)
        this.add_img(pimg)
        if (this.owner == "Black"){
            this.dir = 1
        }
        if (this.owner == "White"){
            this.dir = -1
        }
    }
    update_figure_moves(){
        this.figureMoves = []

        let y = this.position[0]
        let x = this.position[1]
        if (board[y+this.dir][x] === null){
            this.figureMoves.push([this.dir,0])
        }
        if (this.moveCounter == 0){
            if ((board[y+2*this.dir][x] === null))
                this.figureMoves.push([this.dir*2,0])
        }
        if (!(board[y+this.dir][x+1] === null)){
            this.figureMoves.push([this.dir,1])
        }
        if (!(board[y+this.dir][x-1] === null)){
            this.figureMoves.push([this.dir,-1])
        }

    }
}

function picked_up(evt){
    if (pickedPiece === board[this.position[0]][this.position[1]]){
        clear_hilighted()
        clear_picked_piece()
        return
    }
    if (!(pickedPiece === null)){
        clear_picked_piece()
    }

    pickedPiece = board[this.position[0]][this.position[1]]
    clear_hilighted()

    if (pickedPiece.owner != currentPlayer){
        return
    }


    displayedBoard[this.position[0]][this.position[1]].classList.add("solidTile")
    pickedPiece.img.classList.add("selectedFigure")
    pickedPiece.img.classList.remove("basicFigure")

    moves = pickedPiece.get_valid_moves()
    let y;
    let x;
    for (var i = 0; i<moves.length;i++){
        y = this.position[0]
        x = this.position[1]
        move = moves[i]
        y += move[0]
        x += move[1]

        if (board[y][x] === null){
            displayedBoard[y][x].classList.add("greenDashedTile")
            greenHilightedTiles.push(displayedBoard[y][x])

        }else{
            displayedBoard[y][x].classList.add("redDashedTile")

            // Event listeners of pieces that can be attacked have to be removed to avoid picked_up being triggered instead of move piece
            displayedBoard[y][x].removeEventListener("mousedown", picked_up)

            redHilightedTiles.push(displayedBoard[y][x])

        }
        displayedBoard[y][x].addEventListener("mousedown", select_move);
        
    }        
}

// clear hilighted apart from clearing hilighted tiles, also adds back event listeners for picked_up (see line 255 in picked_up()), and removes select_move listeners
function clear_hilighted(){
    for(var i = 0; i<greenHilightedTiles.length; i++){
        greenHilightedTiles[i].classList.remove("greenDashedTile")
        greenHilightedTiles[i].removeEventListener("mousedown", select_move);
    }
    for(var j = 0; j<redHilightedTiles.length; j++){
        redHilightedTiles[j].classList.remove("redDashedTile")
        redHilightedTiles[j].removeEventListener("mousedown", select_move);
        redHilightedTiles[j].addEventListener("mousedown", picked_up)
        y = redHilightedTiles[j].position[0]
        x = redHilightedTiles[j].position[1]
    }
    greenHilightedTiles = []
    redHilightedTiles = []
}

function clear_picked_piece(){
    if (pickedPiece != null){
        pickedPiece.img.classList.add("basicFigure")
        pickedPiece.img.classList.remove("selectedFigure")
        displayedBoard[pickedPiece.position[0]][pickedPiece.position[1]].classList.remove("solidTile")
        pickedPiece = null
    }
}

function select_move(){

    y = pickedPiece.position[0]
    x = pickedPiece.position[1]
    a = this.position[0]
    b = this.position[1]
    pickedPiece.moveCounter +=1


    captured = null
    if(!(board[a][b] == null)){
        captured = board[a][b]
        board[a][b].delete()
    }
    history.push({"from": [y,x], "to": [a,b], "captured": captured})
    pos = pickedPiece.position
    clear_picked_piece()
    movePiece(pos, this.position)
    toggle_player()

    clear_hilighted()
}

function toggle_player(){
    if (currentPlayer == "White"){
        currentPlayer = "Black"
    }else{
        currentPlayer = "White"
    }
    update_label(currentPlayer + "'s turn")
}

function movePiece(from, to){
    let y = from[0]
    let x = from[1]
    let a = to[0]
    let b = to[1]
    let movingPiece = board[y][x]
    board[a][b] = movingPiece
    movingPiece.position = [a,b]
    board[y][x] = null
    displayedBoard[a][b].appendChild(movingPiece.img)
    displayedBoard[a][b].addEventListener("mousedown", picked_up);
    displayedBoard[y][x].removeEventListener("mousedown", picked_up)
}

function undo(){
    
    clear_hilighted();
    clear_picked_piece();
    toggle_player();
    if (history.length == 0){
        update_label("Cannot undo, no moves made")
        return
    }
    let lastMove = history.pop()
    movePiece(lastMove.to, lastMove.from)
    
    returnedPiece = lastMove.captured
    if (returnedPiece == null){
        return
    }
    returnedPiece.moveCounter -=1

    board[lastMove.to[0]][lastMove.to[1]] = new returnedPiece.constructor(returnedPiece.owner, returnedPiece.position)
    board[lastMove.to[0]][lastMove.to[1]].moveCounter = returnedPiece.moveCounter

}

function start_game(){
    load_tiles();
    copy_board();
    place_pieces();
}

function restart_game(){
    for(var i = 0; i<board.length; i++){
        for(var j = 0; j<board[i].length; j++){
            if(board[i][j] != null){
                board[i][j].delete()
            }
        }
    }
    currentPlayer = "White";
    history = [];
    clear_hilighted();
    clear_picked_piece();
    place_pieces();
}

function load_tiles(){
    let tiles = Array.from(document.querySelectorAll(".tile"))
    var j = -1;
    for (var i = 0; i < tiles.length; i++) {
        if (i % 8 == 0) {
            j++;
            displayedBoard.push([]);
        }
        displayedBoard[j].push(tiles[i])
        displayedBoard[j][i-j*8].position = [j,i-j*8]
        
    }
}

function copy_board(){
    for (var i = 0;  i<displayedBoard.length; i++){
        board.push([]);
        for (var j = 0; j<displayedBoard[i].length; j++){
            board[i].push(null);
        }
    }
}

function place_pieces(){
    //Black

    new Rook("Black", [0,0], rimg);
    new Knight("Black", [0,1], nimg);
    new Bishop("Black", [0,2], bimg);
    new Queen("Black", [0,3], qimg);
    new King("Black", [0,4], kimg);
    new Bishop("Black", [0,5], bimg);
    new Knight("Black", [0,6], nimg);
    new Rook("Black", [0,7], rimg);
    new Pawn("Black", [1,0], pimg);
    /*for (var i = 0; i < 8; i++) {
        new Pawn("Black", [1,i], pimg);
    }
    //White
    for (var i = 0; i < 8; i++) {
        new Pawn("White", [6,i], pimg);
    }*/
    new Rook("White", [7,0], rimg);
    new Knight("White", [7,1], nimg);
    new Bishop("White", [7,2], bimg);
    new Queen("White", [7,3], qimg);
    new King("White", [7,4], kimg);
    new Bishop("White", [7,5], bimg);
    new Knight("White", [7,6], nimg);
    new Rook("White", [7,7], rimg);

}

function update_label(text){
    document.getElementById("textDisplay").innerHTML = text

}
