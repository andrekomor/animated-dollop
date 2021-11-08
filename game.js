'use strict'
//Game start figures configuration
const startConfig = '3qk3/11111111/pppppppp/11111111/8/PPPPPPPP/11111111/3QK3'
var turn = 'w'
var gameOver = false

  function isMoveLegal(source, target, piece, oldPos){
    // Fixing the bug where turn changes but piece is not moved
    if(target == source){return false}

    // Checking if target square exists

    if (target.charCodeAt(0)>'h'.charCodeAt(0)||target.charCodeAt(0)<'a'.charCodeAt(0)||target.charCodeAt(1)>'8'.charCodeAt(0)||target.charCodeAt(1)<'1'.charCodeAt(0)){
      return false
    }

    //Checking if target square is empty
    var isTargetSqEmpty = oldPos[target] == undefined
    //If target square had a piece of my color in it, move would be illegal
    var isTargetSqMyColor = false

    //When target square is not empty checking whether it is our color
    if(!isTargetSqEmpty){
      isTargetSqMyColor = Array.from(oldPos[target])[0] == Array.from(oldPos[source])[0]
    }

    //Calculating the difference(distance) on letter and number axis
    var diff_let = target.charCodeAt(0)-source.charCodeAt(0)
    var diff_num = target.charCodeAt(1)-source.charCodeAt(1)

    //checking if move was diagonal
    var isDiagonal = (diff_let != 0) && (diff_num != 0)

    //checking the kind of Piece

    var isKing = ((piece == 'wK') || (piece == 'bK'))
    var isQueen = ((piece == 'wQ') || (piece == 'bQ'))
    var isWhitePawn = piece == 'wP'
    var isBlackPawn = piece == 'bP'

    //checking legal distance

    var isDistanceLegal = (1>=diff_let) && (diff_let>=-1) && (1>=diff_num) && (diff_num>=-1)

    var whitePawnMoveLegal = isWhitePawn && diff_num==1  && ((diff_let==0 && isTargetSqEmpty)||(diff_let!=0 && !isTargetSqMyColor && !isTargetSqEmpty)) && isDistanceLegal
    var blackPawnMoveLegal = isBlackPawn && diff_num==-1 && ((diff_let==0 && isTargetSqEmpty)||(diff_let!=0 && !isTargetSqMyColor && !isTargetSqEmpty)) && isDistanceLegal
    var kingMoveLegal = isKing && !isDiagonal && isDistanceLegal && !isTargetSqMyColor
    var queenMoveLegal = isQueen && isDistanceLegal && !isTargetSqMyColor

    return (queenMoveLegal || kingMoveLegal || whitePawnMoveLegal || blackPawnMoveLegal)
  }

  function randomValidBlackMove(){
    var position = board.position()

    var values = Object.values(position)
    var keys = Object.keys(position)

    var blackPieces = []

    for(var i = 0; i < values.length; i++){
      if(Array.from(values[i])[0] =='b'){
        blackPieces.push(/*[*/keys[i]/*, values[i]]*/)
      }
    }

    var validMoves = []
    var validAttackingMoves = []

    // Searching for all legal moves

    for(var i = 0; i < blackPieces.length; i++){
      for(var letter = -1; letter <= 1; letter++){
        for(var num = -1; num <= 1; num++){
          var trgtLetter = String.fromCharCode(blackPieces[i].charCodeAt(0) + letter)
          var trgtNumber = String.fromCharCode(blackPieces[i].charCodeAt(1) + num)
          var targetSquare = [trgtLetter,trgtNumber].join('')

          if(isMoveLegal(blackPieces[i], targetSquare, board.position()[blackPieces[i]], board.position()))
          {
            validMoves.push([blackPieces[i],targetSquare])
            if(board.position()[targetSquare] != undefined){
              validAttackingMoves.push([blackPieces[i],targetSquare])
            }
          }
        }
      }
    }

    // Random choice, if attack possible then attack
    if(validAttackingMoves.length!=0){
      var move = validAttackingMoves[Math.floor(Math.random()*validAttackingMoves.length)]
    }
    else
    {
    var move = validMoves[Math.floor(Math.random()*validMoves.length)]
    }

    if(isGameOver(position, move[0], move[1])){gameOver=true}

    return move[0]+'-'+move[1]
  }


  function isGameOver(oldPos, source, target){
        //Checking if target square is empty
        var isTargetSqEmpty = oldPos[target] == undefined
        // Checking if target square is king
        if(!isTargetSqEmpty){
          if(oldPos[target].split('')[1]=='K'){alert('Player '+Array.from(oldPos[source])[0]+' won'); return true;}
        }
        return false
  }

  function promotion(){
    // Pawns Promotion to Queen
    var row1Old = board.fen().split('/')[7]
    var row8Old = board.fen().split('/')[0]

    var row1 = row1Old.replace(/p/g, "q")
    var row8 = row8Old.replace(/P/g, "Q")

    var newFen = board.fen().split('/')

    newFen[0] = row8
    newFen[7] = row1

    newFen = newFen.join("/")

    return newFen
  }

  
  function onDrop (source, target, piece, newPos, oldPos, orientation){


    //checkingLegalityOfMove
    if(isMoveLegal(source, target, piece, oldPos)){
          var move = 'legal'
          // check GameOver
          gameOver = isGameOver(oldPos, source, target)
    }
    else
    {
      var move = null
    }

  // illegal move
    if (move === null)
    return 'snapback'

  }

  function onSnapEnd(){
    board.position(promotion())

    // change turns
    turn = 'b'

    if(turn == 'b' && !gameOver){
      // ai Movement
      board.move(randomValidBlackMove())
      promotion()
    }


  }

  function onMoveEnd(){
    turn = 'w'
  }

  //Dont touch black figures 
  function onDragStart (source, piece, position, orientation) {
    // TODO do not pick up pieces if the game is over
    if(gameOver == true){return false}


    // only pick up pieces for the side to move
    if ((/*turn === 'w' && */piece.search(/^b/) !== -1) ||
        (turn === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }


  var config = {
    draggable: true,
    dropOffBoard: 'snapback',
    position: startConfig,
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onMoveEnd: onMoveEnd
  }



  //Start button
  $('#startBtn').on('click', function () {
    board.position(startConfig)
    turn = 'w'
    gameOver = false
  })

  //Board initialization
  var board = Chessboard('myBoard', config)

