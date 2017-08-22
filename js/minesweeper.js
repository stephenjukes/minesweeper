/*
// http://www.codethinked.com/preparing-yourself-for-modern-javascript-development

var myModule = (function($, undefined){
  var myVar1 = '',
  myVar2 = '';

  var someFunction = function(){
    return myVar1 + " " + myVar2;
  };

  return {
    getMyVar1: function() { return myVar1; }, //myVar1 public getter
    setMyVar1: function(val) { myVar1 = val; }, //myVar1 public setter
    someFunction: someFunction //some function made public
  }
})(jQuery);
*/

"use strict";


var minesweeper = (function(size) {

    const totalCells = Math.pow(size, 2);
    const mines = setMines( Math.floor(totalCells / 6) );
    const board = setBoard();
    const cellValues = setCellValues();
    let flags = mines.length;
    let cellsRemaining = totalCells - mines.length;

    function setMines(n) {
        let mines = [];

        while (mines.length < n) {
            let randNum = Math.floor( Math.random() * totalCells );

            if (mines.indexOf(randNum) === -1)
                 mines.push(randNum);
        };
        return mines;
    };

    function setBoard() {
        let grid = [];

        for (let row = 0; row < size; row++) {
			let line = [];

            for (var col = 0; col < size; col++) {
                let mine = row * size + col;
                line.push(mines.indexOf(mine) > -1);
            };
		    grid.push(line);
        };
        return grid;
    };

    function perimeter(row, col, format = 'toString') {
        let cells = [];

        for (let i = (row - 1); i <= (row + 1); i++) {
    		for (let j = (col - 1); j <= (col + 1); j++) {

    			if ( i > -1 && j > -1 && i < size && j < size)// && !(i === row && j === col) )
    				cells.push(format === 'toString' ? i + " " + j : [i, j]);
    			}
    		}
    	return cells;
    }

	function searchMines(row, col) {
		let count = 0;

		for (let i = (row - 1); i <= (row + 1); i++) {
				for (let j = (col - 1); j <= (col + 1); j++) {

// TO DO: Research on how to deal with this by handling 'undefined'
					if (i !== -1 && j !== -1 && i !== size && j !== size)
							count += Number(board[i][j]);
				}
		}
		return count || '';
	}

// TO DO: Similar to setBoard. Consider abstracting or mapping
	function setCellValues() {
		let cellValues = [];

		for (let row = 0; row < size; row++) {
			let line = [];

			for (var col = 0; col < size; col++) {

				if (board[row][col] === true)
						line.push('M')
				else
				    line.push( String(searchMines(row, col)) );

			}
			cellValues.push(line);
		}
		return cellValues;
	}

	function render() {
        $('#info p').html(flags);
        $('#info time').html(0);

		for (let row = 0; row < size; row++) {
			const $row = $('<div></div>').addClass('row')
										 .attr('data-row', row);
			$('#board').append($row);

			for (var cell = 0; cell < size; cell++) {
				const $cell = $('<div></div>').addClass('cell covered')
											  .attr( {'data-row': row, 'data-cell': cell} );

				$($row).append($cell);
			}
		}
	}

    function uniqueValues(array) {
      let unique = [];

      for (let i = 0; i < array.length; i++) {
        let value = array[i];
        if (i === array.indexOf(value)) {
          unique.push(value);
        }
      }
      return unique.sort();
    }

	function cellsToReveal(row, col, toReveal = [], depth = 0) {
		let p = perimeter(row, col);
		let newPos, newRow, newCol;

		if (cellValues[row][col]) {                                    // ie. has a mine
			toReveal.push(row + " " + col);
			return toReveal;
		}

		for (let i = 0; i < p.length; i++) {
			if ( toReveal.indexOf(p[i]) === -1 ) {                   // if element hasn't already been added.
				newPos = ( p[i].match(/\d+/g) );
				newRow = Number(newPos[0]);
				newCol = Number(newPos[1]);

				toReveal.push(newRow + " " + newCol);
				toReveal.concat( cellsToReveal(newRow, newCol, toReveal, depth - 1) );
			}
		}
		return toReveal;
	}

    function reveal($cell, row, col, cells) {
        const color = [null, '#00f', '#080', '#c00', '#008', '#600', '#0ff', '#000', '#888'];

        let newPos, newRow, newCol;
        console.log('reveal ')

        for (let i = 0; i < cells.length; i++) {
            newPos = cells[i].match(/\d+/g);
            newRow = newPos[0];
            newCol = newPos[1];

            let cell = $('[data-row="' + newRow + '"][data-cell="' + newCol + '"]');
            cell.removeClass('covered').addClass('revealed');

            if (cellValues[row][col] == 'M') {
                cell.addClass('mine');
                $cell.addClass('mineHit');
            } else {
                let cellValue = cellValues[newRow][newCol];
                cell.addClass('revealed')
                        .css('color', color[cellValue])
                        .html(cellValue);
            }

        }
    }

	function openCell($cell, row, col) {
        let cells;

        if ( $cell.hasClass('flagged') ) {
            cells = [];
            $('#message').append('<p>Please remove flag in order to select this cell</p>');
        } else if (cellValues[row][col] === 'M') {
            cells = mines.map( n => Math.floor(n / size) + " " + (n % size) );
            gameOver();
        } else {
            cells = uniqueValues( cellsToReveal(row, col) );
            cellsRemaining -= cells.length;
        }

        if (cellsRemaining === 0) {
            $('#message').append('<p>YOU WIN !!!</p>');
        }

        console.log('pos: ' + row, col);
        console.log('openCell cells:');
        console.log(cells);

		reveal($cell, row, col, cells);
        return cells;
	}

    function developCell(row, col) {
        console.log('CLICKED CELL: ');
        console.log(row, col);

        let p = perimeter(row, col);
        let toDevelop = [];
        let newPos, newRow, newCol;

        for (let i = 0; i < p.length; i++) {
            newPos = p[i].match(/\d+/g);
            newRow = newPos[0];
            newCol = newPos[1];

            let $cell = $('[data-row="' + newRow + '"][data-cell="' + newCol + '"]');
            if ( $cell.hasClass('flagged') || $cell.hasClass('revealed') ) { continue; }
            toDevelop.push([newRow, newCol]);
        }

        for (let j = 0; j < toDevelop.length; j++) {
            newRow = toDevelop[j][0];
            newCol = toDevelop[j][1];
            let $cell1 = $('[data-row="' + newRow + '"][data-cell="' + newCol + '"]');

            openCell($cell1, newRow, newCol);
        }
        console.log('---');

        return toDevelop;
    }

    function leftClick($cell, row, col) {
        if ( $cell.hasClass('covered') ) {
            openCell ($cell, row, col)
        } else {
            developCell (row, col)
        }
    }

	function flagDeflag($cell) {
        let flagged = $cell.hasClass('flagged');
        let revealed = $cell.hasClass('revealed');
        !revealed && !flagged ? $cell.addClass('flagged') : $cell.removeClass('flagged');

        playSound('Twang.wav');
        $('#info p').html(flags - $('.flagged').length);
	}

	function select() {
		$('#board').on('mousedown', '.cell', function(e) {
            $('#message').empty();
			let row = Number(e.target.dataset.row);
			let col = Number(e.target.dataset.cell);
			let button = e.which;

			if (button === 1) {
				leftClick($(this), row, col);
			} else {
				flagDeflag( $(this) );
			}
		})
	}

    function gameOver() {
        $('#message').append('<p>Game Over</p>');
    }

    function playSound(soundfile){
    document.getElementById("sound").innerHTML="<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\"/>";
}

	render();
	select();

    for (var i = 0; i < size; i++) {
        console.log(cellValues[i]);
    }

})(9);
