$(document).ready(function() {

  // Getting ready
  var config = getInitconfig();
  window.config = config;
  initializeBoard();
  $('.board').fadeIn(400);

  // Start game
  $('.board > div').click(function() {
    var random = Math.floor(Math.random()*50);
    window.random = random;
    // Select cell
    if ($('div.selected').length == 0) {
      var selectedIndex = $(this).attr('id');
      var hasBounced = false;
      window.hasBounced = hasBounced;
      window.selectedIndex = selectedIndex;
      // Check if it's the player's dot that's selected
      if (config.board[selectedIndex].empty == false) {
        if (isSelectable(selectedIndex)) {
          config.board[selectedIndex].selected = true;
          $('#' + selectedIndex).toggleClass('selected');
        }
        else {
          if (config.player%2 == 0) {
            if (window.random%2 == 0) {
              $('#instructions').text('Select only red cells!');
            } else {
              $('#instructions').text("That's not yours is it?");
            }
          } else {
            if (window.random%2 == 0) {
              $('#instructions').text('Only blue cells please!');
            } else {
              $('#instructions').text("That's not yours is it?");
            }
          }
        }
      } else {
        if (window.random%2 == 0) {
          $('#instructions').text('Too far!');
        } else {
          $('#instructions').text("Sorry, that's out of reach!");
        }
      }
    } else if ($('div.selected').length == 1) {
      var targetIndex = $(this).attr('id');
      window.targetIndex = targetIndex;
      occupyCell(targetIndex);
    }
  });

  // Functions used

  function isSelectable(selectedIndex) {
    if (
      (config.player % 2 == 0 && config.board[selectedIndex].red == true)
      || (config.player % 2 == 1 && config.board[selectedIndex].blue == true)
    ) {
      return true;
    } else {
      return false;
    }
  }

  function isAccessible(destination, origin) {
    if (
      config.board[destination].empty == true
      && destination != origin
      // Checking columns
      && destination%8 >= origin%8-1
      && destination%8 <= origin%8+1
      // Checking lines
      && Math.floor(destination/8) >= Math.floor(origin/8)-1
      && Math.floor(destination/8) <= Math.floor(origin/8)+1
    ) {
      return true;
    } else {
      return false;
    }
  }
  window.isAccessible = isAccessible;

  function occupyCell(targetIndex) {
    var willBounce = false;
    for (i=0; i < canBounce(window.selectedIndex).length; i++) {
      if (canBounce(window.selectedIndex)[i] == window.targetIndex) {
        willBounce = true;
      }
    }
    // Unselect dot
    if (window.targetIndex == window.selectedIndex) {
      config.board[window.selectedIndex].selected = false;
      $('.selected').removeClass('selected');
      if (window.random%2 == 0) {
        $('#instructions').text('Okay, which one then?');
      } else {
        $('#instructions').text('No problem, which one then?');
      }
      if (window.hasBounced == true) {
        nextPlayer();
      }
    } else if (willBounce == false && hasBounced == true){
      // Refuse non-bounce move after bounce
      $('#instructions').text('Sorry, you can only bounce or stop here');
    } else if (willBounce == true) {
      // First jump
      if (config.player % 2 == 0) {
        $('#' + window.targetIndex).html(config.redDot);
        config.board[window.targetIndex].red = true;
        config.board[window.targetIndex].empty = false;
      } else {
        $('#' + window.targetIndex).html(config.blueDot);
        config.board[window.targetIndex].blue = true;
        config.board[window.targetIndex].empty = false;
      }
      // Free previous cell
      config.board[window.selectedIndex].selected = false;
      config.board[window.selectedIndex].empty = true;
      config.board[window.selectedIndex].red = false;
      config.board[window.selectedIndex].blue = false;
      $('.selected').html('');
      $('.selected').removeClass('selected');
      // Recursive bounce
      if (canBounce(window.targetIndex).length > 0) {
        $('#' + window.targetIndex).addClass('selected');
        window.selectedIndex = window.targetIndex;
        config.board[window.selectedIndex].selected = true;
        $('#instructions').text('Bounce again? Unselect if no');
        window.hasBounced = true;
      } else {
        nextPlayer();
      }
    } else if (isAccessible(window.targetIndex, window.selectedIndex) && willBounce == false) {
      if (config.player % 2 == 0) {
        $('#' + window.targetIndex).html(config.redDot);
        config.board[window.targetIndex].red = true;
        config.board[window.targetIndex].empty = false;
      } else {
        $('#' + window.targetIndex).html(config.blueDot);
        config.board[window.targetIndex].blue = true;
        config.board[window.targetIndex].empty = false;
      }
      // Free previous cell
      config.board[window.selectedIndex].selected = false;
      config.board[window.selectedIndex].empty = true;
      config.board[window.selectedIndex].red = false;
      config.board[window.selectedIndex].blue = false;
      nextPlayer();
      $('.selected').html('');
      $('.selected').removeClass('selected');
    } else {
      if (window.random%2 == 0) {
        $('#instructions').text('Not possible, sorry!');
      } else {
        $('#instructions').text("That's not allowed, read the rules!");
      }
    }
  }

  function canBounce(origin) {
    var possibleBounces = new Array();
    function xDifference(index) {
      return index%8 - origin%8;
    }
    function yDifference(index) {
      return Math.floor(index/8) - Math.floor(origin/8);
    }
    window.xDifference = xDifference;
    window.yDifference = yDifference;
    for (closeCell=0; closeCell<64; closeCell++) {
      if (
        closeCell != origin
        && config.board[closeCell].empty == false
        // Checking columns
        && closeCell%8 >= origin%8-1
        && closeCell%8 <= origin%8+1
        // Checking lines
        && Math.floor(closeCell/8) >= Math.floor(origin/8)-1
        && Math.floor(closeCell/8) <= Math.floor(origin/8)+1
      ) {
        for (farCell=0; farCell<64; farCell++) {
          if (
            // Check distance
            isAccessible(farCell, closeCell)
            // Check direction
            && xDifference(farCell) == (xDifference(closeCell)) * 2
            && yDifference(farCell) == (yDifference(closeCell)) * 2
            // Prevent moves back to origin
            && farCell != window.selectedIndex
          ) {
            possibleBounces.push(farCell);
          }
        }
      }
    }
    return possibleBounces;
  }
  window.canBounce = canBounce;

  function nextPlayer() {
    config.player++;
    window.hasBounced = false;
    if (hasWon() != 'none') {
      if (hasWon() == 'red') {
        $('#instructions').text('Red wins! Congratulations!');
      } else {
        $('#instructions').text('Congratulations blue! You win!');
      }
      // Reset game
      getInitconfig();
      initializeBoard();
    } else if (config.player%2 == 0) {
      $('#instructions').css('color', '#ad0101');
      if (window.random%3 == 1) {
        $('#instructions').text('Waiting for you, red!');
      } else {
        $('#instructions').text("Come on red, finish him!");
      }
    } else {
      $('#instructions').css('color', '#3F51B5');
      if (window.random%3 == 0) {
        $('#instructions').text('Waiting for you, blue!');
      } else if (window.random%3 == 1){
        $('#instructions').text("Show him how it's done, blue!");
      } else {
        $('#instructions').text("Come on blue, finish him!");
      }
    }
  }

  function getInitconfig() {
    var board = new Array(64),
    player = 0, j=4, k=0,
    blueDot = "<div class='dotBorder'><div class='blueDot'></div></div>",
    redDot = "<div class='dotBorder'><div class='redDot'></div></div>";
    for (i=0; i<64; i++) {
      board[i] = {};
      board[i].red = false;
      board[i].blue = false;
      board[i].empty = true;
      board[i].selected = false;
      board[i].accessible = false;
    }
    return {
      board: board,
      player: player,
      blueDot: blueDot,
      redDot: redDot
    }
  }

  function initializeBoard() {
    var k=5, l=0;
    // Clean up first
    for (i=0; i<64; i++) {
      config.board[i].empty = true;
      config.board[i].red = false;
      config.board[i].blue = false;
      $('#' + i).html('');
    }
    // Place red dots
    for(i=0; i<64; i++) {
      k--;
      for (j=0; j<k; j++) {
        config.board[i+j].empty = false;
        config.board[i+j].red = true;
        $('#' + (i+j)).html(config.redDot);
      }
      i += 7;
    }
    // Place blue dots
    for(i=39; i<64; i++) {
      l++;
      for (j=0; j<l; j++) {
        config.board[i-j].empty = false;
        config.board[i-j].blue = true;
        $('#' + (i-j)).html(config.blueDot);
      }
      i += 7;
    }
  }
  window.initializeBoard = initializeBoard;

  function hasWon() {
    var gameOver = true, k=5, l=0;
    for(i=0; i<64 && gameOver == true; i++) {
      k--;
      for (j=0; j<k; j++) {
        if (config.board[i+j].blue == false) {
          gameOver = false;
        }
      }
      i += 7;
    }
    if (gameOver == true) {
      return 'blue';
    } else {
      gameOver = true;
      for (i=39; i<64 && gameOver == true; i++) {
        l++;
        for (j=0; j<l; j++) {
          if(config.board[i-j].red == false) {
            gameOver = false;
          }
        }
        i += 7;
      }
      if (gameOver == true) {
        return 'red';
      } else {
        return 'none';
      }
    }
  }
  window.hasWon = hasWon;

  // Artificial Intelligence Functions
  // AI is blue player

  function cellImportance(index) {
    // How close it is to the opponent's base, and how centered it is
    var positionInColumn = Math.floor(index/8)+1,
    positionInLine = index%8 +1,
    centerIndex = Math.abs(positionInLine - positionInColumn),
    importance = 64 - positionInLine * positionInColumn;
    // importance is high if the cell is on the left
    if (centerIndex >= 4) {
      // decrease cell importance if it's not centered
      importance /= centerIndex/3;
    }
    return importance;
  }
  window.cellImportance = cellImportance;

  function getBestSelection() {
    var bestSelection;
    for (i=0; i<64; i++) {
      if (
        config.board[i].blue == true
        && getBestDestination(i) != undefined
        && cellImportance(i) < cellImportance(bestSelection)
      ) {
        bestSelection = i;
      }
    }
    return bestSelection;
  }
  window.getBestSelection = getBestSelection;

  var bounce = false;
  function getBestDestination(index) {
    var bestDestination = 63;
    for (i=0; i<64; i++) {
      // One-cell-long moves
      if (
        isAccessible(i, index)
        && cellImportance(i) > cellImportance(bestDestination)
        && bounce == false
      ) {
        bestDestination = i;
        bounce = false;
      }
    }
    // Regular bounces
    if (canBounce(index).length > 0) {
      for (j=0; j < canBounce(index).length; j++) {
        if (
          cellImportance(canBounce(index)[j]) > cellImportance(bestDestination)
          && Math.abs(xDifference(canBounce(index)[j], index)) <= 2
          && Math.abs(yDifference(canBounce(index)[j], index)) <= 2
        ) {
          bestDestination = canBounce(index)[j];
          bounce = true;
        }
      }
    }
    // Recursive bounces
    if (bounce == true && canBounce(bestDestination).length > 0) {
      for (j=0; j < canBounce(i).length; j++) {
        if (
          cellImportance(canBounce(bestDestination)[j]) > cellImportance(bestDestination)
          && Math.abs(xDifference(canBounce(bestDestination)[j], bestDestination)) <= 2
          && Math.abs(yDifference(canBounce(bestDestination)[j], bestDestination)) <= 2
        ) {
          console.log('recursive');
          getBestDestination(bestDestination);
        }
      }
    }
    console.log(bounce);
    return bestDestination;
    // returns undefined if dot cannot move
  }
  window.getBestDestination = getBestDestination;

});
