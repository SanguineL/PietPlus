// Piet Commands, by Alex Strickland

function push (stack, num) { //Push to stack
	stack.push(num);

	return stack;
}

function pop (stack) { // Pop off stack.
	if (stack.length < 1) {
		return false;
	}
	stack.pop();

	return stack;
}

function add (stack) { // Add top two values
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	return push(stack, i+j);
}

function subtract (stack) { //Subtract top value from 2nd value
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	return push(stack, j-i); //Important. Top value is always subtracted from 2nd top value.
}

function multiply (stack) { // Multiply top two values
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	return push(stack, i*j);
}

function divide (stack) { // Divide 2nd value from top value
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	return push(stack, Math.floor(j/i)); //Integer division
}

function modulo (stack) { // 2nd value modulo top value
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	return push(stack, j%i);
}

function not (stack) { // Inverts top value
	if (stack.length < 1) {
		return false;
	}
	let i = stack.pop();

	if (i == 0) {
		return push(stack, 1);
	} else {
		return push(stack, 0);
	}
}


function greater (stack) { //If 2nd-top value is greater than top value, push 1, else push 0.
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	if (j > i) {
		return push(stack, 1);
	} else {
		return push(stack, 0);
	}
}

function pointer (stack, dp) { // 
	if (stack.length < 1) {
		return false;
	}

	let i = stack.pop();

	return stack, i;
}

function switch_ (stack) { //Underline neccesary. :(
	if (stack.length < 1) {
		return false;
	}

	let i = Math.abs(stack.pop());

	return stack, i;
}

function duplicate (stack) {
	if (stack.length < 1) {
		return false;
	}

	let i = structuredClone(stack[stack.length - 1]);

	return push(stack, i); //put on again
}

function roll (stack) {
	if (stack.length < 2) {
		return false;
	}

	let i = stack.pop();
	let j = stack.pop();

	if (j > stack.length) {
		j = stack.length;
	}

	if (i > 0) {
		for (var roll = 0; roll < i; roll++) {
			stack.splice(-j, 0, stack[stack.length - 1]);
			stack.pop();
		} 
	} else {
		for (var roll = 0; roll > i; roll--) {
			stack.push(...stack.splice(-j, 1));
		}
	}

	return stack;


}


function input_n(stack, n) {
	try {
		if (n.length != 1) {
			return stack;
		}

		return push(stack, parseInt(n));
	} catch (err) {
		return [null];
	}
}

function input_c(stack, c) {
	try {
		if (c.length != 1) {
			return stack;
		}

		return push(stack, c.charCodeAt(0));
	} catch (err) {
		return [null];
	}
}

function output_n (stack) {
	if (stack.length < 1) {
		return false;
	}
	let i = stack.pop();

	return stack, i;
}

function output_c (stack) {
	if (stack.length < 1) {
		return false;
	}
	let i = stack.pop();

	return stack, String.fromCharCode(i);
}


