$(document).ready(function() {

  // Getting ready
  var config = getInitconfig();
  window.config = config;
  initializeBoard();

  // Start game
  $('.board > div').click(function() {
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
            $('#instructions').text('Select only red cells!');
          } else {
            $('#instructions').text('Select only blue cells!');
          }
        }
      } else {
        $('#instructions').text('Too far!');
      }
    } else if ($('div.selected').length == 1) {
      var targetIndex = $(this).attr('id');
      window.targetIndex = targetIndex;
      occupyCell(targetIndex);
    }
  });

  // Functions
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
      $('#instructions').text('Okay, which one then?');
      if (window.hasBounced == true) {
        nextPlayer();
      }
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
      $('#instructions').text('Not possible!');
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
      $('#instructions').text('Your turn, red!');
    } else {
      $('#instructions').css('color', '#3F51B5');
      $('#instructions').text('Waiting for you, blue!');
    }
  }

  function getInitconfig() {
    var board = new Array(64);
    var player = 0, j=4, k=0;
    var blueDot = "<div class='dotBorder'><div class='blueDot'></div></div>";
    var redDot = "<div class='dotBorder'><div class='redDot'></div></div>";
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
    for(i=0; i<64; i++) {
      k--;
      for (j=0; j<k; j++) {
        config.board[i+j].empty = false;
        config.board[i+j].red = true;
        $('#' + (i+j)).html(config.redDot);
      }
      i += 7;
    }
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
    var gameOver = true, k=5, l=0, winner = '';
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
      for(i=39; i<64; i++) {
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
      }
    }
    return 'none';
  }

});
