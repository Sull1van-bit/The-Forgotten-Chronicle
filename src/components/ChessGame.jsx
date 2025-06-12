import React, { useState, useEffect, useCallback } from 'react';
import { useSound } from '../context/SoundContext';

// Import chess piece images
import boardImage from '../assets/chess/board_plain_05.png';
import WPawn from '../assets/chess/W_Pawn.png';
import WRook from '../assets/chess/W_Rook.png';
import WKnight from '../assets/chess/W_Knight.png';
import WBishop from '../assets/chess/W_Bishop.png';
import WQueen from '../assets/chess/W_Queen.png';
import WKing from '../assets/chess/W_King.png';
import BPawn from '../assets/chess/B_Pawn.png';
import BRook from '../assets/chess/B_Rook.png';
import BKnight from '../assets/chess/B_Knight.png';
import BBishop from '../assets/chess/B_Bishop.png';
import BQueen from '../assets/chess/B_Queen.png';
import BKing from '../assets/chess/B_King.png';

const ChessGame = ({ onClose, money, setMoney }) => {
  const { playClick, playHover, playCash } = useSound();
  // Game states
  const [gamePhase, setGamePhase] = useState('setup'); // 'setup', 'playing', 'gameOver'
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);  const [isThinking, setIsThinking] = useState(false);  const [betAmount, setBetAmount] = useState(50);
  const [kingInCheck, setKingInCheck] = useState(null); // Track which king is in check (position)
  const [lastEnemyMove, setLastEnemyMove] = useState(null); // Track enemy's last move [fromPos, toPos]
  
  // Castling rights tracking
  const [castlingRights, setCastlingRights] = useState({
    whiteKing: true,
    whiteQueenRook: true,
    whiteKingRook: true,
    blackKing: true,
    blackQueenRook: true,
    blackKingRook: true
  });

  // Pawn promotion state
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [promotionMove, setPromotionMove] = useState(null);

  // Piece images mapping
  const pieceImages = {
    'wp': WPawn, 'wr': WRook, 'wn': WKnight, 'wb': WBishop, 'wq': WQueen, 'wk': WKing,
    'bp': BPawn, 'br': BRook, 'bn': BKnight, 'bb': BBishop, 'bq': BQueen, 'bk': BKing
  };
  // Check if a pawn move requires promotion
  const isPawnPromotion = (piece, toRow) => {
    if (!piece || piece[1] !== 'p') return false;
    
    const pieceColor = piece[0];
    const promotionRow = pieceColor === 'w' ? 0 : 7;
    
    return toRow === promotionRow;
  };
  // Initialize chess board
  const initializeBoard = () => {
    const initialBoard = [
      ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
      ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
      ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
    ];
    setBoard(initialBoard);
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setPossibleMoves([]);    setGameStatus('');
    setMoveHistory([]);
    setKingInCheck(null); // Clear check indicator
    setLastEnemyMove(null); // Clear enemy move indicator
    setCastlingRights({
      whiteKing: true,
      whiteQueenRook: true,
      whiteKingRook: true,
      blackKing: true,
      blackQueenRook: true,
      blackKingRook: true
    });
  };// Initialize game on component mount
  useEffect(() => {
    initializeBoard();
  }, []);
  // Update visual check indicator
  const updateKingInCheckPosition = (boardState) => {
    // Check if white king is in check
    if (isKingInCheck(boardState, 'w')) {
      // Find white king position
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (boardState[row][col] === 'wk') {
            setKingInCheck([row, col]);
            return;
          }
        }
      }
    }
    
    // Check if black king is in check
    if (isKingInCheck(boardState, 'b')) {
      // Find black king position
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (boardState[row][col] === 'bk') {
            setKingInCheck([row, col]);
            return;
          }
        }
      }
    }
    
    // No king in check
    setKingInCheck(null);
  };

  // Check if path is clear between two squares (for rook, bishop, queen)
  const isPathClear = (fromRow, fromCol, toRow, toCol) => {
    const rowDirection = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colDirection = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;
    
    // Check each square along the path (excluding start and end squares)
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== null) {
        return false; // Path is blocked
      }
      currentRow += rowDirection;
      currentCol += colDirection;
    }
    
    return true; // Path is clear
  };

  // Check if king is in check
  const isKingInCheck = (boardState, kingColor) => {
    // Find king position
    let kingRow = -1, kingCol = -1;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (boardState[row][col] === `${kingColor}k`) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    if (kingRow === -1) return false; // King not found
    
    // Check if any enemy piece can attack the king
    const enemyColor = kingColor === 'w' ? 'b' : 'w';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece && piece[0] === enemyColor) {
          if (canPieceAttack(boardState, row, col, kingRow, kingCol)) {
            return true;
          }
        }
      }
    }
    
    return false;
  };

  // Check if a piece can attack a specific square (simplified, no castling logic here)
  const canPieceAttack = (boardState, fromRow, fromCol, toRow, toCol) => {
    const piece = boardState[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceType = piece[1];
    const pieceColor = piece[0];
    
    switch (pieceType) {
      case 'p': // Pawn
        const direction = pieceColor === 'w' ? -1 : 1;
        return Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction;
      case 'r': // Rook
        return (fromRow === toRow || fromCol === toCol) && isPathClearForBoard(boardState, fromRow, fromCol, toRow, toCol);
      case 'n': // Knight
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case 'b': // Bishop
        return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) && isPathClearForBoard(boardState, fromRow, fromCol, toRow, toCol);
      case 'q': // Queen
        return (fromRow === toRow || fromCol === toCol || Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) && 
               isPathClearForBoard(boardState, fromRow, fromCol, toRow, toCol);
      case 'k': // King
        return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
      default:
        return false;
    }
  };

  // Helper function for path checking with board state
  const isPathClearForBoard = (boardState, fromRow, fromCol, toRow, toCol) => {
    const rowDirection = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colDirection = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let currentRow = fromRow + rowDirection;
    let currentCol = fromCol + colDirection;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (boardState[currentRow][currentCol] !== null) {
        return false;
      }
      currentRow += rowDirection;
      currentCol += colDirection;
    }
    
    return true;
  };

  // Check if castling is valid
  const canCastle = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    if (!piece || piece[1] !== 'k') return false;
    
    const isWhite = piece[0] === 'w';
    const expectedRow = isWhite ? 7 : 0;
    
    // Must be king on starting position
    if (fromRow !== expectedRow || fromCol !== 4) return false;
    if (toRow !== expectedRow) return false;
    
    // Check if king has moved
    if (isWhite && !castlingRights.whiteKing) return false;
    if (!isWhite && !castlingRights.blackKing) return false;
    
    // King can't be in check
    if (isKingInCheck(board, piece[0])) return false;
    
    // Determine castling type
    let rookCol, rookNewCol, kingNewCol;
    let rookRightKey;
    
    if (toCol === 6) { // King-side castling
      rookCol = 7;
      rookNewCol = 5;
      kingNewCol = 6;
      rookRightKey = isWhite ? 'whiteKingRook' : 'blackKingRook';
    } else if (toCol === 2) { // Queen-side castling
      rookCol = 0;
      rookNewCol = 3;
      kingNewCol = 2;
      rookRightKey = isWhite ? 'whiteQueenRook' : 'blackQueenRook';
    } else {
      return false; // Invalid king destination for castling
    }
    
    // Check if rook has moved
    if (!castlingRights[rookRightKey]) return false;
    
    // Check if rook is in place
    const expectedRook = isWhite ? 'wr' : 'br';
    if (board[expectedRow][rookCol] !== expectedRook) return false;
    
    // Check if path is clear between king and rook
    const startCol = Math.min(fromCol, rookCol);
    const endCol = Math.max(fromCol, rookCol);
    for (let col = startCol + 1; col < endCol; col++) {
      if (board[expectedRow][col] !== null) return false;
    }
      // Check if king passes through check
    // For castling, king must not be in check on any square it passes through
    const direction = toCol > fromCol ? 1 : -1; // 1 for kingside, -1 for queenside
    
    for (let col = fromCol; col !== toCol + direction; col += direction) {
      const testBoard = board.map(row => [...row]);
      testBoard[fromRow][fromCol] = null;
      testBoard[expectedRow][col] = piece;
      
      if (isKingInCheck(testBoard, piece[0])) return false;
    }
    
    return true;
  };
  // Check if a move would leave the king in check
  const wouldLeaveKingInCheck = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    const pieceColor = piece[0];
    
    // Handle castling move simulation
    const isCastling = piece && piece[1] === 'k' && Math.abs(fromCol - toCol) === 2;
    
    if (isCastling) {
      // Simulate castling move
      const isWhite = piece[0] === 'w';
      const row = isWhite ? 7 : 0;
      
      if (toCol === 6) { // King-side castling
        newBoard[row][6] = piece; // King to g-file
        newBoard[row][5] = isWhite ? 'wr' : 'br'; // Rook to f-file
        newBoard[row][7] = null; // Clear rook's original position
      } else if (toCol === 2) { // Queen-side castling
        newBoard[row][2] = piece; // King to c-file
        newBoard[row][3] = isWhite ? 'wr' : 'br'; // Rook to d-file
        newBoard[row][0] = null; // Clear rook's original position
      }
      newBoard[fromRow][fromCol] = null; // Clear king's original position
    } else {
      // Normal move simulation
      newBoard[toRow][toCol] = piece;
      newBoard[fromRow][fromCol] = null;
    }
    
    return isKingInCheck(newBoard, pieceColor);
  };

  // Check if a move is valid (with check validation)
  const isValidMove = (fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceColor = piece[0];
    const pieceType = piece[1];
    
    // Can't capture own pieces
    const targetPiece = board[toRow][toCol];
    if (targetPiece && targetPiece[0] === pieceColor) return false;
    
    // Basic movement rules with path checking
    switch (pieceType) {
      case 'p': // Pawn
        const direction = pieceColor === 'w' ? -1 : 1;
        const startRow = pieceColor === 'w' ? 6 : 1;
        
        // Forward move
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
        }
        // Diagonal capture
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
          return true;
        }
        return false;
        
      case 'r': // Rook
        if (fromRow === toRow || fromCol === toCol) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
        
      case 'n': // Knight
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        
      case 'b': // Bishop
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClear(fromRow, fromCol, toRow, toCol);
        }
        return false;
        
      case 'q': // Queen
        if (fromRow === toRow || fromCol === toCol || 
            Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClear(fromRow, fromCol, toRow, toCol);        }
        return false;
        
      case 'k': // King
        // Normal king movement
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
          return true;
        }        // Castling
        if (Math.abs(fromCol - toCol) === 2 && fromRow === toRow) {
          const canCastleResult = canCastle(fromRow, fromCol, toRow, toCol);
          if (!canCastleResult) return false;
          
          // Check if castling would leave king in check
          if (wouldLeaveKingInCheck(fromRow, fromCol, toRow, toCol)) return false;
          
          return true;
        }
        return false;
        
      default:
        return false;
    }
    
    // Check if this move would leave the king in check
    if (wouldLeaveKingInCheck(fromRow, fromCol, toRow, toCol)) return false;
    
    return true;
  };

  // Check if a player has any legal moves
  const hasLegalMoves = (boardState, color) => {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = boardState[fromRow][fromCol];
        if (piece && piece[0] === color) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (isValidMoveForBoard(boardState, fromRow, fromCol, toRow, toCol)) {
                // Check if this move would leave king in check
                const testBoard = boardState.map(row => [...row]);
                const movingPiece = testBoard[fromRow][fromCol];
                
                // Handle castling move simulation
                const isCastling = movingPiece && movingPiece[1] === 'k' && Math.abs(fromCol - toCol) === 2;
                
                if (isCastling) {
                  // Simulate castling move
                  const isWhite = movingPiece[0] === 'w';
                  const row = isWhite ? 7 : 0;
                  
                  if (toCol === 6) { // King-side castling
                    testBoard[row][6] = movingPiece; // King to g-file
                    testBoard[row][5] = isWhite ? 'wr' : 'br'; // Rook to f-file
                    testBoard[row][7] = null; // Clear rook's original position
                  } else if (toCol === 2) { // Queen-side castling
                    testBoard[row][2] = movingPiece; // King to c-file
                    testBoard[row][3] = isWhite ? 'wr' : 'br'; // Rook to d-file
                    testBoard[row][0] = null; // Clear rook's original position
                  }
                  testBoard[fromRow][fromCol] = null; // Clear king's original position
                } else {
                  // Normal move simulation
                  testBoard[toRow][toCol] = movingPiece;
                  testBoard[fromRow][fromCol] = null;
                }
                
                if (!isKingInCheck(testBoard, color)) {
                  return true; // Found a legal move
                }
              }
            }
          }
        }
      }
    }
    return false; // No legal moves found
  };

  // Check for checkmate or stalemate
  const getGameState = (boardState, color) => {
    const inCheck = isKingInCheck(boardState, color);
    const hasLegal = hasLegalMoves(boardState, color);
    
    if (!hasLegal) {
      if (inCheck) {
        return 'checkmate'; // Checkmate
      } else {
        return 'stalemate'; // Stalemate
      }
    }
    
    if (inCheck) {
      return 'check'; // In check but has legal moves
    }
    
    return 'normal'; // Normal game state
  };

  // Handle square click
  const handleSquareClick = (row, col) => {
    if (currentPlayer !== 'white' || isThinking) return;
    
    if (selectedSquare) {
      const [fromRow, fromCol] = selectedSquare;
      
      if (fromRow === row && fromCol === col) {
        // Deselect
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else if (isValidMove(fromRow, fromCol, row, col)) {
        // Make move
        makeMove(fromRow, fromCol, row, col);
      } else {
        // Select new piece
        if (board[row][col] && board[row][col][0] === 'w') {
          setSelectedSquare([row, col]);
          // Calculate possible moves (simplified)
          const moves = [];
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              if (isValidMove(row, col, r, c)) {
                moves.push([r, c]);
              }
            }
          }
          setPossibleMoves(moves);
        }
      }
    } else {      // Select piece
      if (board[row][col] && board[row][col][0] === 'w') {
        setSelectedSquare([row, col]);
        // Calculate possible moves (only legal moves)
        const moves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (isValidMove(row, col, r, c)) {
              moves.push([r, c]);
            }
          }
        }
        setPossibleMoves(moves);
      }
    }
  };  // Make a move
  const makeMove = (fromRow, fromCol, toRow, toCol, promotionPiece = null) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    
    // Check if this is a castling move
    const isCastling = piece && piece[1] === 'k' && Math.abs(fromCol - toCol) === 2;
    
    // Check if this is a pawn promotion
    const needsPromotion = isPawnPromotion(piece, toRow);
    
    if (needsPromotion && !promotionPiece && piece[0] === 'w') {
      // Player pawn promotion - show dialog
      setPromotionMove({ fromRow, fromCol, toRow, toCol });
      setShowPromotionDialog(true);
      return; // Don't complete the move yet
    }
    
    if (isCastling) {
      // Handle castling - move both king and rook
      const isWhite = piece[0] === 'w';
      const row = isWhite ? 7 : 0;
      
      if (toCol === 6) { // King-side castling
        newBoard[row][6] = piece; // King to g-file
        newBoard[row][5] = isWhite ? 'wr' : 'br'; // Rook to f-file
        newBoard[row][7] = null; // Clear rook's original position
      } else if (toCol === 2) { // Queen-side castling
        newBoard[row][2] = piece; // King to c-file
        newBoard[row][3] = isWhite ? 'wr' : 'br'; // Rook to d-file
        newBoard[row][0] = null; // Clear rook's original position
      }
      newBoard[fromRow][fromCol] = null; // Clear king's original position
    } else {
      // Normal move or pawn promotion
      if (needsPromotion) {
        // Handle pawn promotion
        const pieceColor = piece[0];
        const defaultPromotion = promotionPiece || 'q'; // Default to queen for Enemy
        newBoard[toRow][toCol] = `${pieceColor}${defaultPromotion}`;
      } else {
        newBoard[toRow][toCol] = piece;
      }
      newBoard[fromRow][fromCol] = null;
    }
    
    // Update castling rights
    const newCastlingRights = { ...castlingRights };
    
    // If king moves, lose all castling rights for that color
    if (piece && piece[1] === 'k') {
      if (piece[0] === 'w') {
        newCastlingRights.whiteKing = false;
        newCastlingRights.whiteQueenRook = false;
        newCastlingRights.whiteKingRook = false;
      } else {
        newCastlingRights.blackKing = false;
        newCastlingRights.blackQueenRook = false;
        newCastlingRights.blackKingRook = false;
      }
    }
    
    // If rook moves from starting position, lose castling rights for that rook
    if (piece && piece[1] === 'r') {
      if (piece[0] === 'w' && fromRow === 7) {
        if (fromCol === 0) newCastlingRights.whiteQueenRook = false;
        if (fromCol === 7) newCastlingRights.whiteKingRook = false;
      } else if (piece[0] === 'b' && fromRow === 0) {
        if (fromCol === 0) newCastlingRights.blackQueenRook = false;
        if (fromCol === 7) newCastlingRights.blackKingRook = false;
      }
    }
    
    // If rook is captured, lose castling rights for that rook
    if (!isCastling) {
      const capturedPiece = board[toRow][toCol];
      if (capturedPiece && capturedPiece[1] === 'r') {
        if (capturedPiece[0] === 'w' && toRow === 7) {
          if (toCol === 0) newCastlingRights.whiteQueenRook = false;
          if (toCol === 7) newCastlingRights.whiteKingRook = false;
        } else if (capturedPiece[0] === 'b' && toRow === 0) {
          if (toCol === 0) newCastlingRights.blackQueenRook = false;
          if (toCol === 7) newCastlingRights.blackKingRook = false;
        }
      }
    }
      setCastlingRights(newCastlingRights);    setBoard(newBoard);
    setSelectedSquare(null);
    setPossibleMoves([]);
    
    // Clear enemy move indicator when player moves
    setLastEnemyMove(null);
    
    // Update visual check indicator
    updateKingInCheckPosition(newBoard);// Add to move history
    const move = { 
      from: [fromRow, fromCol], 
      to: [toRow, toCol], 
      piece: needsPromotion ? `${piece[0]}${promotionPiece || 'q'}` : piece,
      isCastling,
      isPromotion: needsPromotion,
      castlingRights: newCastlingRights
    };
    setMoveHistory(prev => [...prev, move]);
    
    // Check game state for opponent after this move
    const opponentColor = piece[0] === 'w' ? 'b' : 'w';
    const gameState = getGameState(newBoard, opponentColor);
      if (gameState === 'checkmate') {
      handleGameEnd(piece[0] === 'w' ? 'win' : 'lose');
      setGameStatus(piece[0] === 'w' ? 'Checkmate! You win!' : 'Checkmate! Enemy wins!');
    } else if (gameState === 'stalemate') {
      handleGameEnd('draw');
      setGameStatus('Stalemate! Game is a draw.');    } else {
      if (gameState === 'check') {
        // Only show check status for player, not enemy
        setGameStatus(opponentColor === 'w' ? 'You are in check!' : '');
      } else {
        setGameStatus('');
      }
      
      setCurrentPlayer(opponentColor === 'w' ? 'white' : 'black');
      
      // Enemy move after delay if it's Enemy's turn
      if (opponentColor === 'b') {
        setTimeout(() => makeEnemyMove(newBoard), 1000);
      }
    }
  };

  // Handle pawn promotion selection
  const handlePromotion = (pieceType) => {
    if (!promotionMove) return;
    
    const { fromRow, fromCol, toRow, toCol } = promotionMove;
    setShowPromotionDialog(false);
    setPromotionMove(null);
    
    // Complete the move with the selected promotion piece
    makeMove(fromRow, fromCol, toRow, toCol, pieceType);
  };

  // Cancel pawn promotion
  const cancelPromotion = () => {
    setShowPromotionDialog(false);
    setPromotionMove(null);
  };
  // Simple Enemy move
  const makeEnemyMove = (currentBoard) => {
    setIsThinking(true);    // Find all possible Enemy moves
    const enemyMoves = [];
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = currentBoard[fromRow][fromCol];
        if (piece && piece[0] === 'b') {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              if (isValidMoveForBoard(currentBoard, fromRow, fromCol, toRow, toCol)) {
                // Check if this move would leave Enemy king in check
                const testBoard = currentBoard.map(row => [...row]);
                const movingPiece = testBoard[fromRow][fromCol];
                
                // Handle castling move simulation for Enemy
                const isCastling = movingPiece && movingPiece[1] === 'k' && Math.abs(fromCol - toCol) === 2;
                
                if (isCastling) {
                  // Simulate castling move
                  const isWhite = movingPiece[0] === 'w';
                  const row = isWhite ? 7 : 0;
                  
                  if (toCol === 6) { // King-side castling
                    testBoard[row][6] = movingPiece; // King to g-file
                    testBoard[row][5] = isWhite ? 'wr' : 'br'; // Rook to f-file
                    testBoard[row][7] = null; // Clear rook's original position
                  } else if (toCol === 2) { // Queen-side castling
                    testBoard[row][2] = movingPiece; // King to c-file
                    testBoard[row][3] = isWhite ? 'wr' : 'br'; // Rook to d-file
                    testBoard[row][0] = null; // Clear rook's original position
                  }
                  testBoard[fromRow][fromCol] = null; // Clear king's original position
                } else {
                  // Normal move simulation
                  testBoard[toRow][toCol] = movingPiece;
                  testBoard[fromRow][fromCol] = null;
                }
                  // Only add move if it doesn't leave Enemy king in check
                if (!isKingInCheck(testBoard, 'b')) {
                  enemyMoves.push({ from: [fromRow, fromCol], to: [toRow, toCol] });
                }
              }
            }
          }
        }
      }
    }
      if (enemyMoves.length > 0) {
      // Random move for simplicity
      const randomMove = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
      const [fromRow, fromCol] = randomMove.from;
      const [toRow, toCol] = randomMove.to;        setTimeout(() => {
        const newBoard = currentBoard.map(row => [...row]);
        const piece = newBoard[fromRow][fromCol];
        
        // Check if this is a castling move for Enemy
        const isCastling = piece && piece[1] === 'k' && Math.abs(fromCol - toCol) === 2;
        
        // Check if this is pawn promotion for Enemy
        const needsPromotion = isPawnPromotion(piece, toRow);
        
        if (isCastling) {
          // Handle Enemy castling - move both king and rook
          const isWhite = piece[0] === 'w';
          const row = isWhite ? 7 : 0;
          
          if (toCol === 6) { // King-side castling
            newBoard[row][6] = piece; // King to g-file
            newBoard[row][5] = isWhite ? 'wr' : 'br'; // Rook to f-file
            newBoard[row][7] = null; // Clear rook's original position
          } else if (toCol === 2) { // Queen-side castling
            newBoard[row][2] = piece; // King to c-file
            newBoard[row][3] = isWhite ? 'wr' : 'br'; // Rook to d-file
            newBoard[row][0] = null; // Clear rook's original position
          }
          newBoard[fromRow][fromCol] = null; // Clear king's original position
        } else {          // Normal Enemy move or pawn promotion
          if (needsPromotion) {
            // Enemy automatically promotes to queen
            const pieceColor = piece[0];
            newBoard[toRow][toCol] = `${pieceColor}q`;
          } else {
            newBoard[toRow][toCol] = piece;
          }
          newBoard[fromRow][fromCol] = null;
        }
        
        // Update castling rights for Enemy move
        const newCastlingRights = { ...castlingRights };
        
        // If king moves, lose all castling rights for that color
        if (piece && piece[1] === 'k') {
          if (piece[0] === 'w') {
            newCastlingRights.whiteKing = false;
            newCastlingRights.whiteQueenRook = false;
            newCastlingRights.whiteKingRook = false;
          } else {
            newCastlingRights.blackKing = false;
            newCastlingRights.blackQueenRook = false;
            newCastlingRights.blackKingRook = false;
          }
        }
        
        // If rook moves from starting position, lose castling rights for that rook
        if (piece && piece[1] === 'r') {
          if (piece[0] === 'w' && fromRow === 7) {
            if (fromCol === 0) newCastlingRights.whiteQueenRook = false;
            if (fromCol === 7) newCastlingRights.whiteKingRook = false;
          } else if (piece[0] === 'b' && fromRow === 0) {
            if (fromCol === 0) newCastlingRights.blackQueenRook = false;
            if (fromCol === 7) newCastlingRights.blackKingRook = false;
          }
        }
        
        // If rook is captured, lose castling rights for that rook
        if (!isCastling) {
          const capturedPiece = currentBoard[toRow][toCol];
          if (capturedPiece && capturedPiece[1] === 'r') {
            if (capturedPiece[0] === 'w' && toRow === 7) {
              if (toCol === 0) newCastlingRights.whiteQueenRook = false;
              if (toCol === 7) newCastlingRights.whiteKingRook = false;
            } else if (capturedPiece[0] === 'b' && toRow === 0) {
              if (toCol === 0) newCastlingRights.blackQueenRook = false;
              if (toCol === 7) newCastlingRights.blackKingRook = false;
            }
          }
        }        setCastlingRights(newCastlingRights);
        setBoard(newBoard);
        setIsThinking(false);
        
        // Track enemy's last move
        setLastEnemyMove([[fromRow, fromCol], [toRow, toCol]]);
        
        // Update visual check indicator
        updateKingInCheckPosition(newBoard);
        
        // Check game state for player after Enemy move
        const playerGameState = getGameState(newBoard, 'w');
        
        if (playerGameState === 'checkmate') {
          handleGameEnd('lose');
          setGameStatus('Checkmate! Enemy wins!');
        } else if (playerGameState === 'stalemate') {
          handleGameEnd('draw');
          setGameStatus('Stalemate! Game is a draw.');
        } else {
          if (playerGameState === 'check') {
            setGameStatus('You are in check!');
          } else {
            setGameStatus('');
          }
          setCurrentPlayer('white');
        }
      }, 500);
    } else {
      setIsThinking(false);
      handleGameEnd('win'); // Enemy has no moves
    }
  };  // Check valid move for a given board state
  const isValidMoveForBoard = (boardState, fromRow, fromCol, toRow, toCol) => {
    const piece = boardState[fromRow][fromCol];
    if (!piece) return false;
    
    const pieceColor = piece[0];
    const pieceType = piece[1];
    
    // Can't capture own pieces
    const targetPiece = boardState[toRow][toCol];
    if (targetPiece && targetPiece[0] === pieceColor) return false;
      // Helper function to check castling for Enemy
    const canCastleForBoard = (boardState, fromRow, fromCol, toRow, toCol) => {
      const piece = boardState[fromRow][fromCol];
      if (!piece || piece[1] !== 'k') return false;
      
      const isWhite = piece[0] === 'w';
      const expectedRow = isWhite ? 7 : 0;
      
      // Must be king on starting position
      if (fromRow !== expectedRow || fromCol !== 4) return false;
      if (toRow !== expectedRow) return false;
      
      // Check if king has moved
      if (isWhite && !castlingRights.whiteKing) return false;
      if (!isWhite && !castlingRights.blackKing) return false;
      
      // King can't be in check
      if (isKingInCheck(boardState, piece[0])) return false;
      
      // Determine castling type
      let rookCol, rookNewCol, kingNewCol;
      let rookRightKey;
      
      if (toCol === 6) { // King-side castling
        rookCol = 7;
        rookNewCol = 5;
        kingNewCol = 6;
        rookRightKey = isWhite ? 'whiteKingRook' : 'blackKingRook';
      } else if (toCol === 2) { // Queen-side castling
        rookCol = 0;
        rookNewCol = 3;
        kingNewCol = 2;
        rookRightKey = isWhite ? 'whiteQueenRook' : 'blackQueenRook';
      } else {
        return false; // Invalid king destination for castling
      }
      
      // Check if rook has moved
      if (!castlingRights[rookRightKey]) return false;
      
      // Check if rook is in place
      const expectedRook = isWhite ? 'wr' : 'br';
      if (boardState[expectedRow][rookCol] !== expectedRook) return false;
      
      // Check if path is clear between king and rook
      const startCol = Math.min(fromCol, rookCol);
      const endCol = Math.max(fromCol, rookCol);
      for (let col = startCol + 1; col < endCol; col++) {
        if (boardState[expectedRow][col] !== null) return false;
      }
        // Check if king passes through check
      // For castling, king must not be in check on any square it passes through
      const direction = toCol > fromCol ? 1 : -1; // 1 for kingside, -1 for queenside
      
      for (let col = fromCol; col !== toCol + direction; col += direction) {
        const testBoard = boardState.map(row => [...row]);
        testBoard[fromRow][fromCol] = null;
        testBoard[expectedRow][col] = piece;
        
        if (isKingInCheck(testBoard, piece[0])) return false;
      }
      
      return true;
    };
    
    // Helper function to check path for this board state
    const isPathClearForBoard = (fromRow, fromCol, toRow, toCol) => {
      const rowDirection = toRow === fromRow ? 0 : (toRow > fromRow ? 1 : -1);
      const colDirection = toCol === fromCol ? 0 : (toCol > fromCol ? 1 : -1);
      
      let currentRow = fromRow + rowDirection;
      let currentCol = fromCol + colDirection;
      
      while (currentRow !== toRow || currentCol !== toCol) {
        if (boardState[currentRow][currentCol] !== null) {
          return false;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
      }
      
      return true;
    };
    
    // Same logic as isValidMove but for any board state with path checking
    switch (pieceType) {
      case 'p':
        const direction = pieceColor === 'w' ? -1 : 1;
        const startRow = pieceColor === 'w' ? 6 : 1;
        if (fromCol === toCol && !targetPiece) {
          if (toRow === fromRow + direction) return true;
          if (fromRow === startRow && toRow === fromRow + 2 * direction) return true;
        }
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece) {
          return true;
        }
        return false;
      case 'r':
        if (fromRow === toRow || fromCol === toCol) {
          return isPathClearForBoard(fromRow, fromCol, toRow, toCol);
        }
        return false;
      case 'n':
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
      case 'b':
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClearForBoard(fromRow, fromCol, toRow, toCol);
        }
        return false;
      case 'q':
        if (fromRow === toRow || fromCol === toCol || 
            Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          return isPathClearForBoard(fromRow, fromCol, toRow, toCol);
        }
        return false;
      case 'k':
        // Normal king movement
        if (Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1) {
          return true;
        }
        // Castling
        if (Math.abs(fromCol - toCol) === 2 && fromRow === toRow) {
          return canCastleForBoard(boardState, fromRow, fromCol, toRow, toCol);
        }
        return false;
      default:
        return false;
    }
  };

  // Check if game is over (simplified)
  const isGameOver = (boardState) => {
    // Very basic check - just see if king is captured
    let whiteKing = false, blackKing = false;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = boardState[row][col];
        if (piece === 'wk') whiteKing = true;
        if (piece === 'bk') blackKing = true;
      }
    }
    return !whiteKing || !blackKing;
  };
  // Handle game end
  const handleGameEnd = (result) => {
    setGamePhase('gameOver');
    if (result === 'win') {
      const winnings = Math.floor(betAmount * difficultySettings[difficulty].multiplier);
      setMoney(prev => prev + winnings);
      setGameStatus(`You won! +${winnings} coins`);
      playCash();
    } else if (result === 'draw') {
      // Return bet amount on draw
      setMoney(prev => prev + betAmount);
      setGameStatus(`Draw! Your ${betAmount} coins are returned.`);
    } else {
      setGameStatus('You lost! Better luck next time.');
    }
  };

  // Start new game
  const startNewGame = () => {
    if (money < betAmount) {
      setGameStatus('Not enough money!');
      return;
    }
    
    setMoney(prev => prev - betAmount);
    setGamePhase('playing');
    initializeBoard();
    playClick();
  };
  // Reset game
  const resetGame = () => {
    setGamePhase('setup');
    setGameStatus('');
    setShowPromotionDialog(false);
    setPromotionMove(null);
    playClick();
  };  // Difficulty settings
  const difficultySettings = {
    easy: { name: 'Easy', multiplier: 1.5, description: 'Enemy makes random moves' },
    medium: { name: 'Medium', multiplier: 2.5, description: 'Enemy prefers captures and center control' },
    hard: { name: 'Hard', multiplier: 5.0, description: 'Enemy uses strategic evaluation' }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-[#8B4513] p-4 rounded-lg shadow-lg max-w-3xl w-full mx-4 border-4 border-[#D2B48C] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl text-[#F5DEB3] font-bold tracking-wider">Chess Master</h2>
          <button 
            className="text-[#F5DEB3] hover:text-red-400 text-xl font-bold transition-colors"
            onClick={() => {
              playClick();
              onClose();
            }}
            onMouseEnter={playHover}
          >
            ✕
          </button>
        </div>        {/* Money Display */}
        <div className="mb-2 text-center">
          <span className="text-[#F5DEB3] text-base font-bold">Money: {money} coins</span>
        </div>

        {/* Game Setup Phase */}
        {gamePhase === 'setup' && (
          <div className="text-center">            <div className="mb-4">
              <label className="block text-[#F5DEB3] text-sm font-bold mb-2">
                Bet Amount:
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#D2B48C] text-[#8B4513] px-3 py-1 rounded border font-bold w-20 text-center"
                min="1"
                max={money}
              />              {/* Potential Winnings Preview */}
              <div className="mt-2 text-center">
                <p className="text-[#F5DEB3] text-xs">
                  Potential Winnings: <span className="text-yellow-300 font-bold">
                    {Math.floor(betAmount * difficultySettings[difficulty].multiplier)} coins
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-[#F5DEB3] text-sm font-bold mb-2">
                Difficulty:
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-[#D2B48C] text-[#8B4513] px-3 py-1 rounded border font-bold"
              >
                {Object.entries(difficultySettings).map(([key, setting]) => (
                  <option key={key} value={key}>
                    {setting.name} ({setting.multiplier}x)
                  </option>
                ))}
              </select>
              <p className="text-[#F5DEB3] text-xs mt-1">
                {difficultySettings[difficulty].description}
              </p>
            </div>

            <button
              onClick={startNewGame}
              disabled={money < betAmount}
              className={`px-6 py-2 rounded font-bold transition-colors ${
                money >= betAmount
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
              onMouseEnter={playHover}
            >
              Start Game ({betAmount} coins)
            </button>
            
            {gameStatus && (
              <p className="text-yellow-300 text-sm mt-2">{gameStatus}</p>
            )}
          </div>
        )}

        {/* Game Playing Phase */}
        {gamePhase === 'playing' && (
          <div>
            {/* Game Status */}            <div className="text-center mb-3">
              <p className="text-[#F5DEB3] text-sm">
                {isThinking ? "Enemy is thinking..." : `${currentPlayer === 'white' ? 'Your' : 'Enemy'} turn to move`}
              </p>
              {gameStatus && (
                <p className="text-yellow-300 text-sm">{gameStatus}</p>
              )}
            </div>

            {/* Chess Board */}
            <div className="flex justify-center mb-4">
              <div className="inline-block border-4 border-[#D2B48C] bg-[#F5DEB3]">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex">                    {row.map((piece, colIndex) => {
                      const isLight = (rowIndex + colIndex) % 2 === 0;
                      const isSelected = selectedSquare && selectedSquare[0] === rowIndex && selectedSquare[1] === colIndex;
                      const isPossibleMove = possibleMoves.some(([r, c]) => r === rowIndex && c === colIndex);
                      const isKingInCheck = kingInCheck && kingInCheck[0] === rowIndex && kingInCheck[1] === colIndex;
                      const isEnemyLastMove = lastEnemyMove && (
                        (lastEnemyMove[0][0] === rowIndex && lastEnemyMove[0][1] === colIndex) ||
                        (lastEnemyMove[1][0] === rowIndex && lastEnemyMove[1][1] === colIndex)
                      );
                      
                      // Determine background color with priority: king in check > enemy last move > normal colors
                      let bgColor;
                      if (isKingInCheck) {
                        bgColor = 'bg-yellow-400';
                      } else if (isEnemyLastMove) {
                        bgColor = 'bg-gray-400 bg-opacity-60';
                      } else {
                        bgColor = isLight ? 'bg-[#F5DEB3]' : 'bg-[#D2B48C]';
                      }
                        return (                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-12 h-12 flex items-center justify-center cursor-pointer text-2xl relative ${bgColor} ${isSelected ? 'border-2 border-blue-500' : ''} ${
                            isPossibleMove ? 'border-2 border-green-500' : ''
                          } hover:brightness-110 transition-all`}
                          onClick={() => handleSquareClick(rowIndex, colIndex)}
                        >{piece && (
                            <img 
                              src={pieceImages[piece]} 
                              alt={piece}
                              className="w-11 h-11 object-contain drop-shadow-lg -mt-4"
                            />
                          )}
                          {isPossibleMove && !piece && (
                            <div className="w-3 h-3 bg-green-500 rounded-full opacity-70"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}              </div>
            </div>

            {/* Pawn Promotion Dialog */}
            {showPromotionDialog && (
              <div className="fixed inset-0 flex items-center justify-center z-[70]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                <div className="bg-[#8B4513] p-6 rounded-lg shadow-lg border-4 border-[#D2B48C]">
                  <h3 className="text-[#F5DEB3] text-lg font-bold mb-4 text-center">Choose Promotion Piece</h3>
                  <div className="flex gap-4 justify-center">
                    {/* Queen */}
                    <button
                      onClick={() => handlePromotion('q')}
                      className="bg-[#D2B48C] hover:bg-[#F5DEB3] p-3 rounded border-2 border-[#8B4513] transition-colors"
                      onMouseEnter={playHover}
                    >
                      <img 
                        src={pieceImages['wq']} 
                        alt="Queen"
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                    {/* Rook */}
                    <button
                      onClick={() => handlePromotion('r')}
                      className="bg-[#D2B48C] hover:bg-[#F5DEB3] p-3 rounded border-2 border-[#8B4513] transition-colors"
                      onMouseEnter={playHover}
                    >
                      <img 
                        src={pieceImages['wr']} 
                        alt="Rook"
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                    {/* Bishop */}
                    <button
                      onClick={() => handlePromotion('b')}
                      className="bg-[#D2B48C] hover:bg-[#F5DEB3] p-3 rounded border-2 border-[#8B4513] transition-colors"
                      onMouseEnter={playHover}
                    >
                      <img 
                        src={pieceImages['wb']} 
                        alt="Bishop"
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                    {/* Knight */}
                    <button
                      onClick={() => handlePromotion('n')}
                      className="bg-[#D2B48C] hover:bg-[#F5DEB3] p-3 rounded border-2 border-[#8B4513] transition-colors"
                      onMouseEnter={playHover}
                    >
                      <img 
                        src={pieceImages['wn']} 
                        alt="Knight"
                        className="w-12 h-12 object-contain"
                      />
                    </button>
                  </div>
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={cancelPromotion}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors text-sm"
                      onMouseEnter={playHover}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition-colors"
                onMouseEnter={playHover}
              >
                New Game
              </button>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
                onMouseEnter={playHover}
              >
                Quit
              </button>
            </div>
          </div>
        )}

        {/* Game Over Phase */}
        {gamePhase === 'gameOver' && (
          <div className="text-center">
            <h3 className="text-lg text-[#F5DEB3] font-bold mb-3">Game Over!</h3>
            <p className="text-[#F5DEB3] mb-4">{gameStatus}</p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition-colors"
                onMouseEnter={playHover}
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
                onMouseEnter={playHover}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessGame;