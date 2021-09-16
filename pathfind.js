const SQSIZE = 50;

//reset grid
const reset = () => {
    //clear canvas entirely
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    GRIDX = document.getElementById("xsize").value;
    GRIDY = document.getElementById("ysize").value;
    obstacles.clear();
    movingStar = false;
    pathFound = false;
    prev_filled = [GRIDX - 1, GRIDY - 1];
    
    //redraw grid
    for (let i = 0; i < GRIDX; i++) {
        for (let j = 0; j < GRIDY; j++) {
        ctx.strokeRect((SQSIZE * i) + i, (SQSIZE * j) + j, SQSIZE, SQSIZE);
        }
    }
    fill(0, 0, "pink");
    starPos = [GRIDX - 1, GRIDY - 1];
    fill(GRIDX - 1, GRIDY - 1, "pink");
}

//highlight tile mouse is on
const mouseOnTile = (event) => {
    //if path is already found, grid needs to be reset before modifying
    if (pathFound || movingStar) return;

    let canvDims = canvas.getBoundingClientRect();
    let xStart = canvDims['x'];
    let yStart = canvDims['y'];
    let currX = Math.floor((event.x - xStart) / SQSIZE);
    let currY = Math.floor((event.y - yStart) / SQSIZE);
    
    if (!checkBounds(currX, currY) || (currX == 0 && currY == 0)) {
        return;
    }
    if (checkBounds(prev_filled[0], prev_filled[1]) && !haveSamePos(prev_filled, starPos)) {
        clear(prev_filled[0], prev_filled[1]);
    }
    prev_filled = [currX, currY];
    
    if (movingStar || haveSamePos(prev_filled, starPos)) {
        fill(currX, currY, "pink")
    }
    else {
        fill(currX, currY, "orange");
    }
};

//create a grid obstacle in the cell where the mouse is
const createObstacle = (event) => {
    if (pathFound || movingStar) return;
    let canvDims = canvas.getBoundingClientRect();
    let xStart = canvDims['x'];
    let yStart = canvDims['y'];
    let currX = Math.floor((event.x - xStart) / SQSIZE);
    let currY = Math.floor((event.y - yStart) / SQSIZE);
    
    //make sure obstacle is in valid position
    if (!checkBounds(currX, currY) || haveSamePos(prev_filled, starPos) || (currX == 0 && currY == 0)) {
        return;
    }
    fill(currX, currY, "black");
    obstacles.add(String(currX) + "," + String(currY));
}

//return true if two sets of coordinates are equal
const haveSamePos = (cords1, cords2) =>
{
    return cords1[0] == cords2[0] && cords1[1] == cords2[1];
}

//fill a cell at index (i, j) with color
const fill = (i, j, color) => {
    let fillStyle = ctx.fillStyle;
    ctx.fillStyle = color;
    ctx.fillRect((SQSIZE * i) + i, (SQSIZE * j) + j, SQSIZE, SQSIZE)
    ctx.fillStyle = fillStyle;
}

//remove a cell from the canvas
const deleteCell = (i, j) => {
    ctx.clearRect((SQSIZE * i) + i, (SQSIZE * j) + j, 0, 0);
    ctx.beginPath();
    ctx.stroke();
}

//empty a grid cell of its coloring
const clear = (i, j) => {
    ctx.clearRect((SQSIZE * i) + i, (SQSIZE * j) + j, SQSIZE, SQSIZE);
    ctx.strokeRect((SQSIZE * i) + i, (SQSIZE * j) + j, SQSIZE, SQSIZE);

}

//return true if index is inside the current grid
 const checkBounds = (i, j) => {
    if (obstacles.has(String(i) + "," + String(j))) {
        return false;
    }
    return (i >= 0 && j >= 0 && i < GRIDX && j < GRIDY);
}

//do bfs on grid to find shortest path
async function findpath() {
    pathFound = true;
    foundDest = false;
    src = [0,0];
    dest = starPos;
    let explored = new Set();
    let q = [];
    let prev = [];
    for (let i = 0; i < GRIDX; i++) {
        let row = [];
        for (let j = 0; j < GRIDY; j++) {
            row.push(-1);
        }
        prev.push(row);
    }
    q.push(src);

    let directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    while (q.length > 0) {
        //wait time, to show pathfinding animation
        await new Promise(r => setTimeout(r, 100));
        let push = [];
        for (let _ of q) {
            let tile = q.shift();
            if (haveSamePos(tile, dest)) {
                push = [], q = [];
                foundDest = true;
                break;
            }
            
            let i = tile[0], j = tile[1];
            if (i > 0 || j > 0) {
                fill(i, j, "grey");
            }
            
            //add up, down, left, right tiles to explore
            for (let index = 0; index < directions.length; index++) {
                let direction = directions[index];
                let ni = i + direction[0];
                let nj = j + direction[1];
                
                if (checkBounds(ni, nj) && !explored.has(String(ni) + "," + String(nj))) {
                    push.push([ni, nj]);
                    prev[ni][nj] = [i, j];
                    explored.add(String(ni) + "," + String(nj));
                }
            }
            explored.add(String(i) + "," + String(j));
        }
        for (let tile of push) {
            q.push(tile);
        }
    }
    
    let prev_tile = prev[dest[0]][dest[1]];
    let traverse = [];
    while (prev_tile != -1 && prev_tile !== "undefined") {
        traverse.push([prev_tile[0], prev_tile[1]])
        prev_tile = prev[prev_tile[0]][prev_tile[1]]
    }
    
    //the dest was unreachable
    if (!foundDest) {
        fill(starPos[0], starPos[1], "red");
        return;
    }
    
    //show pathfinding from src to dest
    for (let index of traverse.reverse()) {
        await new Promise(r => setTimeout(r, 100));
        fill(index[0], index[1], "pink");
    }
}

//initial gird size
var GRIDX = 8;
var GRIDY = 8;
var prev_filled = [-1,-1];
var obstacles = new Set();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
reset();
document.addEventListener('mousemove', mouseOnTile);
document.addEventListener('mousedown', createObstacle);

