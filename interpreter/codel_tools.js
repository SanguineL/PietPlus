// Codel and Block Tools, by Alex Strickland

let lastColor = "";
let lastBlock;

function getBlock(x, y) { //Using x, y of inital codel.
	let currentNeighbor;
	let currentBlockMembers = [[x, y]];
	let currentCodel;

	//Direction vectors
	let dRow = [-1, 0, 1, 0];
	let dCol = [0, 1, 0, -1];

	if (isWhite([[x, y]]) && running) {
		return [[x, y]];
	}

	if (isWhite([[x, y]]) && lastColor == get_block_color([[x, y]])) { // Save time from searching every time.
		return lastBlock;
	}

	lastColor = get_block_color([[x, y]]);

	let queue = [];
	queue.push([x, y]);

	console.log(grid_width, grid_height);
	var visited = Array.from(Array(grid_width), ()=> Array(grid_height).fill(false));

	while (queue.length!=0) {
		var cell = queue[0];
		var X = cell[0];
		var Y = cell[1]; 

		queue.shift();

		for (var i = 0; i < 4; i++) {

			var dX = X+dRow[i];
			var dY = Y+dCol[i];

			if (in_same_block(getCodel(X, Y), getCodel(dX, dY)) && visited[dX][dY] == false) {
				if (!checkArrayInArray(currentBlockMembers, [dX, dY])) {
					currentBlockMembers.push([dX, dY]);
					visited[dX][dY] = true;
					queue.push([dX, dY]);
				}
			}
		}
	}
	lastBlock = currentBlockMembers;
	return currentBlockMembers;

}

function get_extreme_codels(block, dp) {
	let max = 0;
	let extreme_codels = [];
	if (dp == "right") {
		for (let i = 0; i < block.length; i++) {
			if (block[i][0] == max) {
				extreme_codels.push(block[i]);
			} else if (block[i][0] > max) {
				extreme_codels = [block[i]];
				max = block[i][0];
			}
		}
	} else if (dp == "left") {
		max = grid_width;
		for (let i = 0; i < block.length; i++) {
			if (block[i][0] == max) {
				extreme_codels.push(block[i]);
			} else if (block[i][0] < max) {
				extreme_codels = [block[i]];
				max = block[i][0]; //Technically min, but whatever
			}
		}
	} else if (dp == "up") {
		max = grid_height;
		for (let i = 0; i < block.length; i++) {
			if (block[i][1] == max) {
				extreme_codels.push(block[i]);
			} else if (block[i][1] < max) {
				extreme_codels = [block[i]];
				max = block[i][1];
			}
		}
	} else if (dp == "down") {
		for (let i = 0; i < block.length; i++) {
			if (block[i][1] == max) {
				extreme_codels.push(block[i]);
			} else if (block[i][1] > max) {
				extreme_codels = [block[i]];
				max = block[i][1];
			}
		}
	}

	return extreme_codels;//DP LOGIC
}

function get_extreme_codels_cc(extreme_codels, dp, cc) { // CC LOGIC
	if (cc == "left") {
		return leftMost(extreme_codels, dp);
	} else {
		return rightMost(extreme_codels, dp);
	}
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

function unhighlight_block(block) {
	let color = getCodel(block[0][0], block[0][1]).style.backgroundColor;


	for (let i = 0; i < block.length; i++) {
		let toUnhighlight = getCodel(block[i][0], block[i][1]);
		toUnhighlight.style.border = "1px solid " + color;
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

function get_block_color(block) {
	return getCodel(block[0][0], block[0][1]).style.backgroundColor;
}

function color_comparison(matrix1, matrix2) {
	var newMatrix = [];

	matrix1 = toRGBArray(matrix1);
	matrix2 = toRGBArray(matrix2);

	let index1 = 0;
	let index2 = 0;

	let colorCodes = [[255, 192, 192], [255, 0, 0], [192, 0, 0],
              [255, 255, 192], [255, 255, 0], [192, 192, 0],
              [192, 255, 192], [0, 255, 0], [0, 192, 0],
              [192, 255, 255], [0, 255, 255], [0, 192, 192],
              [192, 192, 255], [0, 0, 255], [0, 0, 192],
              [255, 192, 255], [255, 0, 255], [192, 0, 192]
             ];

	if (JSON.stringify(matrix1) == JSON.stringify([255, 255, 255]) || JSON.stringify(matrix2) == JSON.stringify([255, 255, 255])) {
		return {'hue': 0, 'light': 0};
	}

	for (let i = 0; i < colorCodes.length; i++) {
		if (JSON.stringify(colorCodes[i]) == JSON.stringify(matrix1)) {
			index1 = i;
		}

		if (JSON.stringify(colorCodes[i]) == JSON.stringify(matrix2)) {
			index2 = i;
		}
	}

    let hueChange = (Math.floor(index2 / 3) - Math.floor(index1 / 3)) % 6;
    let lightChange = (index2 - index1) % 3;

    return {'hue': hueChange, 'light': lightChange};
 
}

function genDPCCLabel(dp, cc) {
	let dpD = {
		"right": "->",
		"left": "<-",
		"up": "^",
		"down": "v"
	};

	let ccD = {
		"right": "->",
		"left": "<-"
	};

	return "DP:" + dpD[dp] + "   CC:" + ccD[cc];
}

function isBlack(block) {
	return (getCodel(block[0][0], block[0][1]).style.backgroundColor == "rgb(0, 0, 0)");
}

function isWhite(block) {
	return (getCodel(block[0][0], block[0][1]).style.backgroundColor == "rgb(255, 255, 255)");
}

function leftMost(extreme_codels, dp) {
	let min = grid_height;
	let toReturn = false;

	if (dp == "right") {
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][1] < min) {
				min = extreme_codels[i][1];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "left") {
		min = 0;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][1] > min) {
				min = extreme_codels[i][1];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "up") {
		min = grid_width;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][0] < min) {
				min = extreme_codels[i][0];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "down") {
		min = 0;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][0] > min) {
				min = extreme_codels[i][0];
				toReturn = extreme_codels[i];
			}
		}
	}

	return toReturn;

}

function rightMost(extreme_codels, dp) {
	let min = 0;
	let toReturn = false;

	if (dp == "right") {
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][1] > min) {
				min = extreme_codels[i][1];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "left") {
		min = grid_height;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][1] < min) {
				min = extreme_codels[i][1];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "up") {
		min = 0;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][0] > min) {
				min = extreme_codels[i][0];
				toReturn = extreme_codels[i];
			}
		}
	}

	if (dp == "down") {
		min = grid_width;
		for (let i = 0; i < extreme_codels.length; i++) {
			if (extreme_codels[i][0] < min) {
				min = extreme_codels[i][0];
				toReturn = extreme_codels[i];
			}
		}
	}

	return toReturn;
}

const toRGBArray = rgbStr => rgbStr.match(/\d+/g).map(Number);