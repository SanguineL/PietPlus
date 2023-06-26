//Piet Interpreter, by Alex Strickland

let directions = {
	"right": [1, 0],
	"left": [-1, 0],
	"up": [0, -1],
	"down": [0, 1]
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function start() {
	let startCodel = getCodel(0, 0);
	let currentBlock = getBlock(0, 0);
	let previousBlock = getBlock(0, 0);

	let endCode = "";



	let running = true;

	let dp = "right"; //DIRECTION POINTER
	let cc = "left"; // CODEL CHOOSER (tie breaker)

	dpccLabel.innerHTML = genDPCCLabel(dp, cc);
	commandDisplay.innerHTML = "";


	while (running) {
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
				cc = toggleCC(cc);
			} else {
				cc = toggleCC(cc);
				dp = toggleDP(dp, 1);
			}

			dpccLabel.innerHTML = genDPCCLabel(dp, cc);

			if (i == 7) {
				running = false;
				endCode = "Debug Terminated.";
				commandDisplay.innerHTML = commandDisplay.innerHTML + endCode;
			}
			await sleep(500);
			
		}
		unhighlight_block(previousBlock);
		if (running) {
			highlight_block(currentBlock);
			commandDisplay.innerHTML = commandDisplay.innerHTML + get_command(previousBlock, currentBlock) + "\n";

			await sleep(500);
		}
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

function toggleCC(cc) { //cc or dp
	if (cc == "left") {
		return "right";
	}
	return "left";
}

function toggleDP(dp, int) {
	let shifts = {
		"right": {0: "right", 1: "down", 2: "left", 3: "up"},
		"left": {0: "left", 1: "up", 2: "right", 3: "down"},
		"up": {0: "up", 1: "right", 2: "down", 3: "left"},
		"down": {0: "down", 1: "left", 2: "up", 3: "right"}
	};

	return shifts[dp][int];
}