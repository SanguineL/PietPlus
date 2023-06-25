//Piet Interpreter, by Alex Strickland

function start() {
	let startCodel = getCodel(0, 0);
	let currentBlock = getBlock(0, 0);

	highlight_block(currentBlock);
	
}

function getBlock(x, y) { //Using x, y of inital codel.
	let currentNeighbor;
	let currentBlockMembers = [[x, y]];
	let currentCodel;

	//Direction vectors
	let dRow = [-1, 0, 1, 0];
	let dCol = [0, 1, 0, -1];

	let queue = [];
	queue.push([x, y]);

	var visited = Array.from(Array(grid_height), ()=> Array(grid_width).fill(false));

	while (queue.length!=0) {
		var cell = queue[0];
		var X = cell[0];
		var Y = cell[1]; 

		queue.shift();

		for (var i = 0; i < 4; i++) {

			var dX = X+dRow[i];
			var dY = Y+dCol[i];

			if (in_same_block(getCodel(X, Y), getCodel(dX, dY)) && visited[dX][dY] == false) {
				currentBlockMembers.push([dX, dY]);
				visited[dX][dY] = true;
				queue.push([dX, dY]);
			}
		}
	}
	
	return currentBlockMembers;

}

function highlight_block(block) { // Outlines current block in BLACK BORDER.
	for (let i = 0; i < block.length; i++) {
		currentCodel = getCodel(block[i][0], block[i][1]); //set current block

		currentCodel.style.border = "5px solid black";

		if (checkArrayInArray(block, [block[i][0]-1, block[i][1]])) { //If codel to left in block
			currentCodel.style.borderLeft = "0px"
		}

		if (checkArrayInArray(block, [block[i][0]+1, block[i][1]])) { //If codel to right in block
			currentCodel.style.borderRight = "0px"
		}

		if (checkArrayInArray(block, [block[i][0], block[i][1]-1])) { //If codel to top not in block
			currentCodel.style.borderTop = "0px"
		}

		if (checkArrayInArray(block, [block[i][0], block[i][1]+1])) { //If codel to bottom not in block
			currentCodel.style.borderBottom = "0px"
		}	
	}
}

function getCodel(x, y){ // Returns DIV of codel at x, y
	if (x < 0 || y < 0 || x >= grid_width || y >= grid_height) {
		return false;
	}

	var rows = container.getElementsByClassName('gridRow');
	let row = rows.item(y).getElementsByTagName('div');
	let cell = row.item(x);

	return cell;
}

function in_same_block(codel1, codel2) { //Checks if codel2 is same color as codel1. Only use for neighbors.
	if (codel1 == false || codel2 == false) {
		return false;
	}
	if (codel1.style.backgroundColor == codel2.style.backgroundColor) {
		return true;
	}
	return false;
}

function checkArrayInArray(arr, farr){ // Checks if array is inside other array.
    if(JSON.stringify(arr).includes(JSON.stringify(farr))) return true;
    return false;
}