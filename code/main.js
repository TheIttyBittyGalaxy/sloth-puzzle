const grid = document.getElementById("grid");
const SIZE = 5;

document.body.style.setProperty("--size", SIZE);

const squares = [];

const END = "code/img/end.png";
const STRAIGHT = "code/img/straight.png";
const TURN = "code/img/turn.png";
const THREE = "code/img/three.png";
const FOUR = "code/img/four.png";
const BLANK = "code/img/blank.png";

const N = 0;
const E = 1;
const S = 2;
const W = 3;

for (let y = 0; y < SIZE; y++) {
	for (let x = 0; x < SIZE; x++) {
		const isStart = x == 0 && y == 0;
		const isEnd = x == SIZE - 1 && y == SIZE - 1;
		const isStatic = isStart || isEnd;

		const element = document.createElement("div");
		element.classList.add("square");
		if (isStatic) element.classList.add("static");
		grid.appendChild(element);

		const img = document.createElement("img");
		element.appendChild(img);

		let rotations = 0;

		let connections = [false, false, false, false];
		if (isStatic) {
			img.src = END;

			if (isStart) {
				connections = [false, true, true, false];
			} else if (isEnd) {
				connections = [true, false, false, true];
				rotations = 2;
				element.style.rotate = 180 + "deg";
			}
		} else {
			element.addEventListener("click", event => {
				if (mazeActive) {
					square.rotations++;
					element.style.rotate = square.rotations * 90 + "deg";
					square.connections = rotate(square.connections);
					if (checkForWin()) {
						whenWin();
					}
				}
			});
		}

		const square = {
			x,
			y,
			isStart,
			isEnd,
			isStatic,
			element,
			img,
			rotations,
			connections,
		};

		squares.push(square);
	}
}

let mazeActive = false;

function rotate(connections) {
	return [connections[W], connections[N], connections[E], connections[S]];
}

function match(connections, n, e, s, w) {
	return connections[N] == n && connections[E] == e && connections[S] == s && connections[W] == w;
}

function popRandom(arr) {
	const i = Math.floor(Math.random() * arr.length);
	return arr.splice(i, 1)[0];
}

function generateMaze() {
	// Reset maze
	for (const square of squares) {
		if (!square.isStatic) {
			square.connections = [false, false, false, false];
		}
	}

	// Determine a winning route
	const route = [
		{
			i: 0,
			unexplored: [1, SIZE],
			visited: {
				0: true,
			},
		},
	];

	while (true) {
		const node = route[route.length - 1];

		// If last node, route found
		if (node.i == SIZE * SIZE - 1) break;

		// If there are no more neighbours to explore, back track
		if (node.unexplored.length == 0) {
			route.pop();
			continue;
		}

		// Select a neighbour to visit
		const i = popRandom(node.unexplored);

		// If we've already visited that square, try a different neighbour
		if (node.visited[i]) continue;

		// Create a node on the route for this square
		const visited = Object.assign({}, node.visited);
		visited[i] = true;

		const unexplored = [];
		if (i % SIZE > 0) unexplored.push(i - 1);
		if (i % SIZE < SIZE - 1) unexplored.push(i + 1);
		if (i >= SIZE) unexplored.push(i - SIZE);
		if (i < (SIZE - 1) * SIZE) unexplored.push(i + SIZE);

		route.push({ i, unexplored, visited });
	}

	// Create connections along route
	for (let n = 0; n < route.length - 1; n++) {
		const i = route[n].i;
		const j = route[n + 1].i;

		const node = squares[i];
		const next = squares[j];

		if (j + 1 == i) {
			node.connections[W] = true;
			next.connections[E] = true;
		} else if (i == j - 1) {
			node.connections[E] = true;
			next.connections[W] = true;
		} else if (j + SIZE == i) {
			node.connections[N] = true;
			next.connections[S] = true;
		} else if (i == j - SIZE) {
			node.connections[S] = true;
			next.connections[N] = true;
		}
	}

	// Generate random 2-connection tiles
	for (const square of squares) {
		if (square.isStatic) continue;

		if (match(square.connections, false, false, false, false) && Math.random() < 0.55) {
			square.connections = [
				// Straights
				[false, true, false, true],
				[true, false, true, false],

				// Turns
				[true, true, false, false],
				[false, true, true, false],
				[false, false, true, true],
				[true, false, false, true],
			][Math.floor(Math.random() * 6)];
		}
	}

	// Add random connections
	for (let i = 0; i < SIZE * SIZE * 0.2; i++) {
		const square = squares[Math.floor(Math.random() * squares.length)];
		if (square.isStatic) continue;
		if (match(square.connections, false, false, false, false)) continue;
		square.connections[Math.floor(Math.random() * 4)] = true;
	}

	// Shuffle maze
	let shuffles = SIZE * SIZE;
	while (shuffles > 0 || checkForWin()) {
		const i = Math.floor(Math.random() * squares.length);
		const square = squares[i];
		if (square.isStatic) continue;

		square.connections = rotate(square.connections);
		shuffles--;
	}

	// Update elements/rotations
	for (const square of squares) {
		if (square.isStatic) continue;

		if (match(square.connections, false, true, false, true)) {
			square.img.src = STRAIGHT;
			square.rotations = 0;
		} else if (match(square.connections, true, false, true, false)) {
			square.img.src = STRAIGHT;
			square.rotations = 1;
		} else if (match(square.connections, true, true, false, false)) {
			square.img.src = TURN;
			square.rotations = 0;
		} else if (match(square.connections, false, true, true, false)) {
			square.img.src = TURN;
			square.rotations = 1;
		} else if (match(square.connections, false, false, true, true)) {
			square.img.src = TURN;
			square.rotations = 2;
		} else if (match(square.connections, true, false, false, true)) {
			square.img.src = TURN;
			square.rotations = 3;
		} else if (match(square.connections, true, true, false, true)) {
			square.img.src = THREE;
			square.rotations = 0;
		} else if (match(square.connections, true, true, true, false)) {
			square.img.src = THREE;
			square.rotations = 1;
		} else if (match(square.connections, false, true, true, true)) {
			square.img.src = THREE;
			square.rotations = 2;
		} else if (match(square.connections, true, false, true, true)) {
			square.img.src = THREE;
			square.rotations = 3;
		} else if (match(square.connections, true, true, true, true)) {
			square.img.src = FOUR;
		} else if (match(square.connections, false, false, false, false)) {
			square.img.src = BLANK;
		} else {
			console.error(
				`COULD NOT CALIBRATE TILE ${square.connections[0]}, ${square.connections[1]}, ${square.connections[2]}, ${square.connections[3]}`
			);
		}

		// square.rotations += 4 * Math.floor(Math.random() * 3);
		square.element.style.rotate = square.rotations * 90 + "deg";
	}

	mazeActive = true;
}

function checkForWin() {
	const visited = {};

	const queue = [0];

	while (queue.length > 0) {
		const i = queue.pop();

		// If last node, then there is a valid route
		if (i == SIZE * SIZE - 1) return true;

		// If node already visited, skip it
		if (visited[i]) continue;
		visited[i] = true;

		// Add connected neighbours to queue
		const square = squares[i];

		// WEST
		if (i % SIZE > 0) {
			const j = i - 1;
			const other = squares[j];
			if (square.connections[W] && other.connections[E]) queue.push(j);
		}

		// EAST
		if (i % SIZE < SIZE - 1) {
			const j = i + 1;
			const other = squares[j];
			if (square.connections[E] && other.connections[W]) queue.push(j);
		}

		// NORTH
		if (i >= SIZE) {
			const j = i - SIZE;
			const other = squares[j];
			if (square.connections[N] && other.connections[S]) queue.push(j);
		}

		// SOUTH
		if (i < (SIZE - 1) * SIZE) {
			const j = i + SIZE;
			const other = squares[j];
			if (square.connections[S] && other.connections[N]) queue.push(j);
		}
	}

	return false;
}

const slothIcon = document.getElementById("sloth");
const foodIcon = document.getElementById("food");

let startLeft = 0;
let startTop = 0;
let goalLeft = 0;
let goalTop = 0;

function sizeIcons() {
	const start = squares[0].element.getBoundingClientRect();
	startLeft = start.x + "px";
	startTop = start.y + "px";

	slothIcon.style.width = start.width + "px";
	slothIcon.style.left = startLeft;
	slothIcon.style.top = startTop;

	const goal = squares[squares.length - 1].element.getBoundingClientRect();
	goalLeft = goal.x + "px";
	goalTop = goal.y + "px";

	foodIcon.style.width = goal.width + "px";
	foodIcon.style.left = goalLeft;
	foodIcon.style.top = goalTop;
}

window.addEventListener("resize", sizeIcons);

function whenWin() {
	mazeActive = false;
	document.body.classList.remove("playable");

	yay.play();

	slothIcon.style.left = goalLeft;
	slothIcon.style.top = goalTop;

	setTimeout(() => {
		cronch.play();
	}, 2000);

	setTimeout(() => {
		slothIcon.style.left = startLeft;
		slothIcon.style.top = startTop;

		document.body.classList.add("playable");
		generateMaze();
	}, 4000);
}

const music = new Audio();
music.src = "code/sound/rio-fresh.mp3";
music.loop = true;

const yay = new Audio();
yay.src = "code/sound/yay.mp3";

const cronch = new Audio();
cronch.src = "code/sound/cronch.mp3";

const section = document.querySelector("section");
let started = false;
section.addEventListener("click", event => {
	section.classList.add("fade");
	sizeIcons();
	if (!started) {
		started = true;
		setTimeout(() => {
			section.remove();
			document.body.classList.add("playable");
			generateMaze();
			music.play();
		}, 1000);
	}
});
