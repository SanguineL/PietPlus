//Piet Interpreter, by Alex Strickland

let directions = {
	"right": [1, 0],
	"left": [-1, 0],
	"up": [0, -1],
	"down": [0, 1]
};

let inputs = 0;
let running = false;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function start() {
	let startCodel = getCodel(0, 0);
	let currentBlock = getBlock(0, 0);
	let previousBlock = getBlock(0, 0);
	let stack = [];

	let runs = 0;

	running = true;
	inputs = 0;

	let dp = "right"; //DIRECTION POINTER
	let cc = "left"; // CODEL CHOOSER (tie breaker)

	dpccLabel.innerHTML = genDPCCLabel(dp, cc);
	commandDisplay.innerHTML = "";
	output.innerHTML = "";

	pauseButton.addEventListener("click", () => {running = false;});


	while (running) {	
		runs = runs + 1;
		previousBlock = structuredClone(currentBlock);

		for (let i = 0; i < 8; i++) {
			possibleNextBlock = get_next_block(currentBlock, dp, cc);

			if (possibleNextBlock != "hitWallError") {
				if (!isBlack(possibleNextBlock)) {
					currentBlock = possibleNextBlock;
					break;
				}
			}

			if (i%2 == 0) {
				cc = toggleCC(cc, 1)
			} else {
				dp = toggleDP(dp, 1);
			}

			dpccLabel.innerHTML = genDPCCLabel(dp, cc);

			if (i == 7) {
				running = false;
				endCode("Debug Terminated.");
			}

			//await sleep(200);
			
		}
		unhighlight_block(previousBlock);
		if (running) {
			let i = 0;
			highlight_block(currentBlock);

			switch (get_command(previousBlock, currentBlock)) {
				case 'push':
					stack = push(stack, previousBlock.length);
					break;
				case 'pop':
					stack = pop(stack);
					break;
				case 'add':
					stack = add(stack);
					break;
				case 'sub':
					stack = subtract(stack);
					break;
				case 'mult':
					stack = multiply(stack);
					break;
				case 'div':
					stack = divide(stack);
					break;
				case 'mod':
					stack = modulo(stack);
					break;
				case 'not':
					stack = not(stack);
					break;
				case 'great':
					stack = greater(stack);
					break;
				case 'point':
					stack, i = pointer(stack, dp);
					dp = toggleDP(dp, i);
					break;
				case 'switch':
					stack, i = switch_(stack, cc);
					cc = toggleCC(cc, i);
					break;
				case 'dup':
					stack = duplicate(stack);
					break;
				case 'roll':
					stack = roll(stack);
					break;
				case 'in(n)':
					stack = input_n(stack, get_next_input());
					if (stack[stack.length - 1] == 'null') {
						running = false;
						endCode("Terminated. Input(n) did not receive Integer.");
					}
					break;
				case 'in(c)':
					stack = input_c(stack, get_next_input());
					if (stack[stack.length - 1] == 'null') {
						running = false;
						endCode("Terminated. Input(c) did not receive Char.");
					}
					break;
				case 'out(n)':
					stack, out = output_n(stack);
					output.innerHTML = output.innerHTML + out;
					break;
				case 'out(c)':
					stack, out = output_c(stack);
					output.innerHTML = output.innerHTML + out;
					break;
				case 'null':
					break;
			}
			if (get_command(previousBlock, currentBlock) != 'null') {
				commandDisplay.innerHTML = commandDisplay.innerHTML + get_command(previousBlock, currentBlock).toUpperCase();

				if (get_command(previousBlock, currentBlock) == "push") {
					commandDisplay.innerHTML = commandDisplay.innerHTML + " " + previousBlock.length;
				}

				commandDisplay.innerHTML = commandDisplay.innerHTML + "\n";
				commandDisplay.scrollTop = commandDisplay.scrollHeight;
			}

			stackDisplay.innerHTML = JSON.stringify(stack);
		} //COMMANDS

		if (runs > 10000) {
			running = false;
			commandDisplay.innerHTML = commandDisplay.innerHTML + "Terminated. 10,000 attempts exceeded.";
		}

		runs = runs + 1;

		await sleep(500);
	}
}

function get_next_block(block, dp, cc) { //Get the next block based on the current block, DP, and CC.
	let extreme_codels = get_extreme_codels(block, dp);

	let toNext = [];

	if (extreme_codels.length > 1) {
		let extreme_codel = get_extreme_codels_cc(extreme_codels, dp, cc);
		toNext = [extreme_codel[0] + directions[dp][0], extreme_codel[1] + directions[dp][1]];
	} else {
		try {
			toNext = [extreme_codels[0][0] + directions[dp][0], extreme_codels[0][1] + directions[dp][1]];
		} catch(err) {
			return "hitWallError";
		}
	}

	if (toNext[0] < 0 || toNext[1] < 0 || toNext[0] >= grid_width || toNext[1] >= grid_height) {
		return "hitWallError";
	}
	return getBlock(toNext[0], toNext[1]);
}

function get_command(previous, current) {
	let change = color_comparison(get_block_color(previous), get_block_color(current));

	let commands = {
		 '-5': {'-2': 'sub', '-1': 'mult', '0': 'add', '1': 'sub', '2': 'mult'},
		 '-4': {'-2': 'mod', '-1': 'not', '0': 'div', '1': 'mod', '2': 'not'},
		 '-3': {'-2': 'point', '-1': 'switch', '0': 'great', '1': 'point', '2': 'switch'},
		 '-2': {'-2': 'roll', '-1': 'in(n)', '0': 'dup', '1': 'roll', '2': 'in(n)'},
		 '-1': {'-2': 'out(n)', '-1': 'out(c)', '0': 'in(c)', '1': 'out(n)', '2': 'out(c)'},
		  '0': {'-2': 'push', '-1': 'pop', '0': 'null', '1': 'push', '2': 'pop'},
		  '1': {'-2': 'sub', '-1': 'mult', '0': 'add', '1': 'sub', '2': 'mult'},
		  '2': {'-2': 'mod', '-1': 'not', '0': 'div', '1': 'mod', '2': 'not'},
		  '3': {'-2': 'point', '-1': 'switch', '0': 'great', '1': 'point', '2': 'switch'},
		  '4': {'-2': 'roll', '-1': 'in(n)', '0': 'dup', '1': 'roll', '2': 'in(n)'},
		  '5': {'-2': 'out(n)', '-1': 'out(c)', '0': 'in(c)', '1': 'out(n)', '2': 'out(c)'}
	}

	return commands[change['hue']][change['light']];
}

function toggleCC(cc, int) { //cc or dp
	for (let i = 0; i < int; i++) {
		if (cc == "left") {
			cc = 'right';
		} else {
			cc = 'left';
		}
	}

	return cc;
}

function toggleDP(dp, int) {
	let shifts = {
		'right': {'-3': 'down', '-2': 'left', '-1': 'up', '0': 'right', '1': 'down', '2': 'left', '3': 'up'},
		'down': {'-3': 'left', '-2': 'up', '-1': 'right', '0': 'down', '1': 'left', '2': 'up', '3': 'right'},
		'left': {'-3': 'up', '-2': 'right', '-1': 'down', '0': 'left', '1': 'up', '2': 'right', '3': 'down'},
		'up': {'-3': 'right', '-2': 'down', '-1': 'left', '0': 'up', '1': 'right', '2': 'down', '3': 'left'},
	};

	return shifts[dp][int%4];
}

function get_next_input() {
	toReturn = input.value.split("\n")[inputs];
	inputs = inputs + 1;
	return toReturn;
}

function endCode(code) {
	commandDisplay.innerHTML = commandDisplay.innerHTML + code;
}