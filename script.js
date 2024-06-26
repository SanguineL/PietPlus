//Initial references
let container = document.querySelector(".container");
let dialog = document.getElementById("dialog");
let importDialog = document.getElementById("importDialog");
let asciiDialog = document.getElementById("asciiDialog");

//Grid Controls
let gridButton = document.getElementById("submit-grid");
let clearGridButton = document.getElementById("clear-grid");
let resetGridButton = document.getElementById("reset-grid");
let gridWidth = document.getElementById("width-range");
let gridHeight = document.getElementById("height-range");
let eraseBtn = document.getElementById("erase-btn");
let paintBtn = document.getElementById("paint-btn");
let widthValue = document.getElementById("width-range");
let heightValue = document.getElementById("height-range");
let asciiEntry = document.getElementById("ascii-entry");
let importDialogButton = document.getElementById("upload-image-btn");
let importButton = document.getElementById("image-import");
let saveButton = document.getElementById("save-image-btn");

//Interpreter Controls
let startButton = document.getElementById("start-button");
let stepButton = document.getElementById("step-button");
let pauseButton = document.getElementById("pause-button");

//Interpreter Displays
let input = document.getElementById("input");
let output = document.getElementById("output");
let stackDisplay = document.getElementById("stack-display");
let commandDisplay = document.getElementById("command-display");
let dpccLabel = document.getElementById("dpcc-label");

let toolSwitchButton = document.getElementById("toolswitch");

let blockInfoLabel = document.getElementById("block-info-label");
let asciiPietLabel = document.getElementById("ascii-piet-label");

let imageImportButton = document.getElementById("image-import");
let asciiImportButton = document.getElementById("ascii-import");
let submitAsciiButton = document.getElementById("submit-ascii");
let asciiDiv = document.getElementById("ascii-div");


//Events object
let events = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
    up: "mouseup",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
  },
};
let deviceType = "";
//Initially draw and erase would be false
let draw = false;
let erase = false;
let tool = 'paint';

let selected_pos = {0: 0, 1: 0};
let current_pos = {0: 0, 1: 0};

let grid_width = 0;
let grid_height = 0;

const hshift = (array, index) => array.map(a => [...a.slice(index), ...a.slice(0, index)]);
const vshift = (array, index) => array.map(a => [...a.slice(index), ...a.slice(0, index)]);

const reader = new FileReader();


let colors = [[[255, 192, 192], [255, 0, 0], [192, 0, 0]],
              [[255, 255, 192], [255, 255, 0], [192, 192, 0]],
              [[192, 255, 192], [0, 255, 0], [0, 192, 0]],
              [[192, 255, 255], [0, 255, 255], [0, 192, 192]],
              [[192, 192, 255], [0, 0, 255], [0, 0, 192]],
              [[255, 192, 255], [255, 0, 255], [192, 0, 192]],
              [[255, 255, 255], [0, 0, 0]]
             ];

let color_strings = {
    0: {0: "*", 1: "push", 2: "pop"},
    1: {0: "add", 1: "sub", 2: "mult"},
    2: {0: "div", 1: "mod", 2: "not"},
    3: {0: "great", 1: "point", 2: "switch"},
    4: {0: "dup", 1: "roll", 2: "in(n)"},
    5: {0: "in(c)", 1: "out(n)", 2: "out(c)"}
};

window.onload = () => {
  gridWidth.value = 10;
  gridHeight.value = 10;

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (urlParams.has("ascii")) {
        url_ascii(0, urlParams.get("ascii"))
    }

    if (urlParams.has("input")) {
        config_input(urlParams.get("input"));
    }


  buttons = document.getElementsByClassName('colorbutton');
  

  toolSwitchButton.addEventListener("click", () => switch_tool());

  resetGridButton.addEventListener("click", () => show_dialog());
  importDialogButton.addEventListener("click", () => show_import_dialog());
  saveButton.addEventListener("click", () => begin_save());


  for (var p = 0; p < 20; p++) {
    (function(p) {
      buttons[p].style.backgroundColor= 'rgb(' + colors[Math.floor(p/3)][p%3].join(',') + ')';
      buttons[p].addEventListener("click", () => shift_words(Math.floor(p/3), (p % 3)));
    }(p));
  }

  shift_words(0, 0);

};

//On Press, create grid
gridButton.addEventListener("click", () => create_grid());

imageImportButton.addEventListener("click", () => begin_import());
asciiImportButton.addEventListener("click", () => begin_ascii_import());
submitAsciiButton.addEventListener("click", () => importAscii());
asciiDiv.addEventListener("click", () => { let tString = asciiPietLabel.innerHTML;tString=tString.replaceAll("&nbsp;", " ");navigator.clipboard.writeText(tString.substring(13, tString.length - 1))});

//Detect touch device
const isTouchDevice = () => {
  try {
    //We try to create TouchEvent(it would fail for desktops and throw error)
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};
isTouchDevice();

function show_dialog(element) {
  dialog.className = 'dialog';
  dialog.showModal();
}

function show_import_dialog(element) {
    importDialog.className = 'dialog';
    importDialog.showModal();
}

function create_grid(element, file = null, codel_size = 1, ascii = null) {
  dialog.className = '';
  dialog.close();

    if (grid_width == 0 && grid_height == 0 && file == null && ascii == null) {
        grid_width = parseInt(gridWidth.value);
        grid_height = parseInt(gridHeight.value);
        //Initially clear the grid (old grids cleared)
        container.innerHTML = "";
        //count variable for generating unique ids
        let count = 0;
        //loop for creating rows
        for (let i = 0; i < gridHeight.value; i++) {
            //incrementing count by 2
            count += 2;
            //Create row div
            let div = document.createElement("div");
            div.classList.add("gridRow");
            //Create Columns
            for (let j = 0; j < gridWidth.value; j++) {
                count += 2;
                let col = document.createElement("div");
                col.classList.add("gridCol");

                if (gridWidth.value > 45) {
                    col.style.maxWidth = Math.floor((45 * 30) / gridWidth.value) + "px";
                    col.style.maxHeight = Math.floor((45 * 30) / gridWidth.value) + "px";
                } else if (gridHeight.value > 25) {
                    col.style.maxWidth = Math.floor((25 * 30) / gridHeight.value) + "px";
                    col.style.maxHeight = Math.floor((25 * 30) / gridHeight.value) + "px";
                }

                /* We need unique ids for all columns (for touch screen specifically) */
                col.setAttribute("id", `gridCol${count}`);
                col.style.backgroundColor = "rgb(255, 255, 255)"
                /*
                For eg if deviceType = "mouse"
                the statement for the event would be events[mouse].down which equals to mousedown
                if deviceType="touch"
                the statement for event would be events[touch].down which equals to touchstart
                 */
                col.addEventListener("mouseover", () => display_block_size(j, i));
                col.addEventListener(events[deviceType].down, () => {
                    //user starts drawing
                    draw = true;
                    //if erase = true then background = transparent else color
                    if (erase) {
                        col.style.backgroundColor = "rgb(255, 255, 255)";
                        col.style.border = '1px solid #ddd';
                    } else if (tool == 'paint') {
                        col.style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        col.style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                    } else {
                        let block = getBlock(j, i);

                        for (c = 0; c < block.length; c++) {
                            getCodel(block[c][0], block[c][1]).style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                            getCodel(block[c][0], block[c][1]).style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        }
                    }
                    display_block_size(j, i);
                    update_ascii_piet(gridWidth.value, gridHeight.value);
                });
                col.addEventListener(events[deviceType].move, (e) => {
                    /* elementFromPoint returns the element at x,y position of mouse */
                    let elementId = document.elementFromPoint(
                        !isTouchDevice() ? e.clientX : e.touches[0].clientX,
                        !isTouchDevice() ? e.clientY : e.touches[0].clientY
                    ).id;
                    //checker
                    checker(elementId);
                });
                //Stop drawing
                col.addEventListener(events[deviceType].up, () => {
                    draw = false;
                });
                //append columns
                div.appendChild(col);
            }
            //append grid to container
            container.appendChild(div);
        }
    } else if (file && ascii==null) {
        container.innerHTML = "";
        grid_width = file.width / codel_size;
        grid_height = file.height / codel_size;
        //count variable for generating unique ids
        let count = 0;
        //loop for creating rows
        for (let i = 0; i < gridHeight.value; i++) { // I = Y
            //incrementing count by 2
            count += 2;
            //Create row div
            let div = document.createElement("div");
            div.classList.add("gridRow");
            //Create Columns
            for (let j = 0; j < gridWidth.value; j++) { // J = X
                count += 2;
                let col = document.createElement("div");
                col.classList.add("gridCol");
                /* We need unique ids for all columns (for touch screen specifically) */
                col.setAttribute("id", `gridCol${count}`);

                if (gridWidth.value > 45) {
                    col.style.maxWidth = Math.floor((45 * 30) / gridWidth.value) + "px";
                    col.style.maxHeight = Math.floor((45 * 30) / gridWidth.value) + "px";
                } else if (gridHeight.value > 25) {
                    col.style.maxWidth = Math.floor((25 * 30) / gridHeight.value) + "px";
                    col.style.maxHeight = Math.floor((25 * 30) / gridHeight.value) + "px";
                }

                let color = getPixelXY(file, j * codel_size, i * codel_size);
                col.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                col.style.border = '1px solid rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                /*
                For eg if deviceType = "mouse"
                the statement for the event would be events[mouse].down which equals to mousedown
                if deviceType="touch"
                the statement for event would be events[touch].down which equals to touchstart
                 */
                col.addEventListener("mouseover", () => display_block_size(j * codel_size, i * codel_size));
                col.addEventListener(events[deviceType].down, () => {
                    //user starts drawing
                    draw = true;
                    //if erase = true then background = transparent else color
                    if (erase) {
                        col.style.backgroundColor = "rgb(255, 255, 255)";
                        col.style.border = "1px solid #999";
                    } else if (tool == 'paint') {
                        col.style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        if (isWhite(colors[selected_pos[0]][selected_pos[1]])) {
                            col.style.border = '1px solid #999';
                        } else {
                            col.style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        }
                    } else {
                        let block = getBlock(j * codel_size, i * codel_size);

                        for (c = 0; c < block.length; c++) {
                            getCodel(block[c][0], block[c][1]).style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                            if (isWhite(colors[selected_pos[0]][selected_pos[1]])) {
                                getCodel(block[c][0], block[c][1]).style.border = '1px solid #999';
                            } else {
                                getCodel(block[c][0], block[c][1]).style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                            }
                        }
                    }
                    display_block_size(j * codel_size, i * codel_size);
                    update_ascii_piet(gridWidth.value, gridHeight.value);
                });
                col.addEventListener(events[deviceType].move, (e) => {
                    /* elementFromPoint returns the element at x,y position of mouse */
                    let elementId = document.elementFromPoint(
                        !isTouchDevice() ? e.clientX : e.touches[0].clientX,
                        !isTouchDevice() ? e.clientY : e.touches[0].clientY
                    ).id;
                    //checker
                    checker(elementId);
                });
                //Stop drawing
                col.addEventListener(events[deviceType].up, () => {
                    draw = false;
                });
                //append columns
                div.appendChild(col);
            }
            //append grid to container
            container.appendChild(div);
        }
    } else if (ascii!=null) {
        container.innerHTML = "";
        //count variable for generating unique ids
        let count = 0;
        //loop for creating rows
        for (let i = 0; i < grid_height; i++) { // I = Y
            //incrementing count by 2
            count += 2;
            //Create row div
            let div = document.createElement("div");
            div.classList.add("gridRow");
            //Create Columns
            for (let j = 0; j < grid_width; j++) { // J = X
                count += 2;
                let col = document.createElement("div");
                col.classList.add("gridCol");
                /* We need unique ids for all columns (for touch screen specifically) */
                col.setAttribute("id", `gridCol${count}`);

                if (grid_width > 45) {
                    col.style.maxWidth = Math.floor((45 * 30) / grid_width) + "px";
                    col.style.maxHeight = Math.floor((45 * 30) / grid_width) + "px";
                } else if (grid_height > 25) {
                    col.style.maxWidth = Math.floor((25 * 30) / grid_height) + "px";
                    col.style.maxHeight = Math.floor((25 * 30) / grid_height) + "px";
                }

                let color = getPixelASCII(ascii[i * grid_width + j]);
                if (color == null) {
                    color = [0, 0, 0];
                }
                col.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                col.style.border = '1px solid rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
                /*
                For eg if deviceType = "mouse"
                the statement for the event would be events[mouse].down which equals to mousedown
                if deviceType="touch"
                the statement for event would be events[touch].down which equals to touchstart
                 */
                col.addEventListener("mouseover", () => display_block_size(j * codel_size, i * codel_size));
                col.addEventListener(events[deviceType].down, () => {
                    //user starts drawing
                    draw = true;
                    //if erase = true then background = transparent else color
                    if (erase) {
                        col.style.backgroundColor = "rgb(255, 255, 255)";
                        col.style.border = "1px solid #999";
                    } else if (tool == 'paint') {
                        col.style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        if (isWhite(colors[selected_pos[0]][selected_pos[1]])) {
                            col.style.border = '1px solid #999';
                        } else {
                            col.style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                        }
                    } else {
                        let block = getBlock(j * codel_size, i * codel_size);

                        for (c = 0; c < block.length; c++) {
                            getCodel(block[c][0], block[c][1]).style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                            if (isWhite(colors[selected_pos[0]][selected_pos[1]])) {
                                getCodel(block[c][0], block[c][1]).style.border = '1px solid #999';
                            } else {
                                getCodel(block[c][0], block[c][1]).style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
                            }
                        }
                    }
                    display_block_size(j * codel_size, i * codel_size);
                    update_ascii_piet(grid_width, grid_width);
                });
                col.addEventListener(events[deviceType].move, (e) => {
                    /* elementFromPoint returns the element at x,y position of mouse */
                    let elementId = document.elementFromPoint(
                        !isTouchDevice() ? e.clientX : e.touches[0].clientX,
                        !isTouchDevice() ? e.clientY : e.touches[0].clientY
                    ).id;
                    //checker
                    checker(elementId);
                });
                //Stop drawing
                col.addEventListener(events[deviceType].up, () => {
                    draw = false;
                });
                //append columns
                div.appendChild(col);
            }
            //append grid to container
            container.appendChild(div);
        }
    } else {
        grid_width = 0;
        grid_height = 0;
        container.innerHTML = "";
        create_grid();
  }
}

function checker(elementId) {
  let gridColumns = document.querySelectorAll(".gridCol");
  //loop through all boxes
  let i = 0;
  gridColumns.forEach((element) => {
    let x = i%grid_width;
    let y = Math.floor(i/grid_height);
    //if id matches then color
    if (elementId == element.id) {
      if (draw && !erase) {
          element.style.backgroundColor = 'rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
          if (isWhite(colors[selected_pos[0]][selected_pos[1]])) {
              element.style.border = '1px solid #999';
          } else {
              element.style.border = '1px solid rgb(' + colors[selected_pos[0]][selected_pos[1]].join(',') + ')';
          }
        display_block_size(x, y);
      } else if (draw && erase) {
        element.style.backgroundColor = "rgb(255, 255, 255)";
        element.style.border = '1px solid #999';
        display_block_size(x, y);
      }
    }
    i = i + 1;
  });
}

function shift_words(row_index, column_index) {
  selected_pos[0] = row_index;
  selected_pos[1] = column_index;

  //Set toolbutton background color
  toolSwitchButton.style.backgroundColor = 'rgb(' + colors[row_index][column_index].join(',') + ')';
  
  let dy = selected_pos[0] - current_pos[0];
  let dx = selected_pos[1] - current_pos[1];

  if (dx < 0) {
    dx = 3 + dx;
  }

  if (dy < 0) {
    dy = 6 + dy;
  }
  buttons = document.getElementsByClassName('colorbutton');

  if (row_index != 6) {
      color_strings = shift_array(dx, dy, color_strings);
      for (let z = 0; z<18; z++) {
        buttons[z].innerHTML = color_strings[Math.floor(z/3)][z%3];
      }

      current_pos[0] = row_index;
      current_pos[1] = column_index;

  }
}

function shift_array (dx, dy, arr) 
   {
   let newArr = [[],[],[],
               [],[],[],
               [],[],[],
               [],[],[],
               [],[],[],
               [],[],[]];

   let numRows = 6;
   let numCols = 3;
   for(let r = 0; r < numRows; r++)
   {
      for(let c = 0; c < numCols; c++)
         newArr[(r + dy) % numRows][(c + dx) % numCols] = arr[r][c];
   }
   for(let r = 0; r < numRows; r++)
   {
      for(let c = 0; c < numCols; c++)
         arr[r][c] = newArr[r][c];
   }

   return arr;
}

function begin_save(element) {
  var rows = container.getElementsByClassName('gridRow');

  var canvas = document.createElement('canvas');
  canvas.width = grid_width; canvas.height = grid_height;

  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var idt = ctx.getImageData(0, 0, canvas.width, canvas.height);

  for (var r = 0; r < canvas.height; r++) {
    let cells = rows.item(r).getElementsByTagName('div');
    for (var c = 0; c < canvas.width; c++) {
      let rgb = cells.item(c).style.backgroundColor;
      rgb = rgb.replace(/[^\d,]/g, '').split(',');
      setPixelXY(idt, c, r, rgb[0], rgb[1], rgb[2], 255);
    }
  }

  ctx.putImageData(idt, 0, 0);
  let dataURL = canvas.toDataURL("testimage/png");

  let newTab = window.open('about:blank','image from canvas');
  newTab.document.write("<img src='" + dataURL + "' alt=from canvas'/>");
}

function begin_import(element) {
  importDialog.className = "";
  importDialog.close();
  document.getElementById('attachment').click();

  const fileUpload = document.querySelector('input');
  const reader = new FileReader();
  fileUpload.addEventListener('change', () => {
    reader.readAsDataURL(fileUpload.files[0]);
    reader.onload = (e) => {
      const image = new Image();
      image.src = e.target.result;
      image.onload = () => {
        var codelSize = Math.sqrt(parseInt(prompt("Enter codel size (number of pixels in codel):", 1)));
        const {
          height,
          width
        } = image;
        if (height / codelSize > 300 || width / codelSize > 300) {
          alert("Total height and width must not exceed 300 codels.");
        }
        else {
          grid_width = 0; grid_height = 0;
          gridWidth.value = width / codelSize;
          gridHeight.value = height / codelSize;

          var canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0);
          var idt = ctx.getImageData(0, 0, canvas.width, canvas.height);

          create_grid(image, file=idt, codel_size = codelSize);
        }
      };
    };
  });
}

function begin_ascii_import(element) {
    importDialog.className = "";
    importDialog.close();
    asciiDialog.className = "dialog";
    asciiDialog.showModal();
}

function url_ascii(element, ascii) {
    grid_width = getASCIIWidth(ascii);

    if (grid_width != false) {
        grid_height = Math.ceil(ascii.length / grid_width);
        create_grid(0, img = null, codel_size = 1, ascii = ascii);
    } else {
        grid_width = 0;
        grid_height = 0;
        alert("Invalid ascii-piet from url");
    }
}


function importAscii(element) {
    asciiDialog.className = "";
    asciiDialog.close();

    let asciiE = asciiEntry.value;

    grid_width = getASCIIWidth(asciiE);

    if (grid_width != false) {
        grid_height = Math.ceil(asciiE.length / grid_width);
        console.log(grid_height);
        create_grid(0, img = null, codel_size = 1, ascii = asciiE);
    } else {
        grid_width = 0;
        grid_height = 0;
        alert("Invalid ascii-piet");
    }
        
}

function getPixel(img, index) {
  var i = index*4; d = img.data;
  return [d[i],d[i+1],d[i+2],d[i+3]] // [R,G,B,A]
}

function getPixelXY(img, x, y) {
  return getPixel(img, y*img.width+x, 255);
}

function getPixelASCII(char) {
    let asciiToColor = {
        't': [255, 192, 192],
        'l': [255, 0, 0],
        'd': [192, 0, 0],
        'v': [255, 255, 192],
        'n': [255, 255, 0],
        'f': [192, 192, 0],
        'r': [192, 255, 192],
        'j': [0, 255, 0],
        'b': [0, 192, 0],
        's': [192, 255, 255],
        'k': [0, 255, 255],
        'c': [0, 192, 192],
        'q': [192, 192, 255],
        'i': [0, 0, 255],
        'a': [0, 0, 192],
        'u': [255, 192, 255],
        'm': [255, 0, 255],
        'e': [192, 0, 192],
        '?': [255, 255, 255],
        ' ': [0, 0, 0],
        '+': [0, 0, 0],
        ['&nbsp;']: [0, 0, 0],
        'T': [255, 192, 192],
        'L': [255, 0, 0],
        'D': [192, 0, 0],
        'V': [255, 255, 192],
        'N': [255, 255, 0],
        'F': [192, 192, 0],
        'R': [192, 255, 192],
        'J': [0, 255, 0],
        'B': [0, 192, 0],
        'S': [192, 255, 255],
        'K': [0, 255, 255],
        'C': [0, 192, 192],
        'Q': [192, 192, 255],
        'I': [0, 0, 255],
        'A': [0, 0, 192],
        'U': [255, 192, 255],
        'M': [255, 0, 255],
        'E': [192, 0, 192],
        '_': [255, 255, 255],
        '@': [0, 0, 0]
    }
    return asciiToColor[char];
}

function getASCIIWidth(ascii) {
    for (var i = 0; i < ascii.length; i++) {
        if (["T", "L", "D", "V", "N", "F", "R", "J", "B", "S", "K", "C", "Q", "I", "A", "U", "M", "E", "_", "@"].includes(ascii[i])) {

            console.log(i + 1);
            return i + 1;
        }
    }
    return false;
}

function config_input(inputString) {
    input.innerHTML = inputString.replaceAll(",", "\n");
}

function setPixel(imgData, index, r, g, b, a) {
  var i = index*4, d = imgData.data;
  d[i]   = r;
  d[i+1] = g;
  d[i+2] = b;
  d[i+3] = a;
}

function setPixelXY(imgData, x, y, r, g, b, a) {
  return setPixel(imgData, y*imgData.width+x, r, g, b, a);
}

function switch_tool(element) {
  let icon = document.getElementById('tool-icon');
  if (tool == 'paint') {
    tool = 'fill';
    icon.classList.remove("fa-fill");
    icon.classList.add("fa-brush");
  } else {
    tool = 'paint';
    icon.classList.remove("fa-brush");
    icon.classList.add("fa-fill");
  }
}

function display_block_size(x, y) {
  blockInfoLabel.innerHTML = "Block size: " + getBlock(x, y).length + "<br />";
  blockInfoLabel.innerHTML = blockInfoLabel.innerHTML + "XY: (" + x +", " + y + ")";
}

function update_ascii_piet(width, height) {
    let lowerAsciiDict =
    {
        "rgb(255, 192, 192)": "t",
        "rgb(255, 0, 0)": "l",
        "rgb(192, 0, 0)": "d",
        "rgb(255, 255, 192)": "v",
        "rgb(255, 255, 0)": "n",
        "rgb(192, 192, 0)": "f",
        "rgb(192, 255, 192)": "r",
        "rgb(0, 255, 0)": "j",
        "rgb(0, 192, 0)": "b",
        "rgb(192, 255, 255)": "s",
        "rgb(0, 255, 255)": "k",
        "rgb(0, 192, 192)": "c",
        "rgb(192, 192, 255)": "q",
        "rgb(0, 0, 255)": "i",
        "rgb(0, 0, 192)": "a",
        "rgb(255, 192, 255)": "u",
        "rgb(255, 0, 255)": "m",
        "rgb(192, 0, 192)": "e",
        "rgb(255, 255, 255)": "?",
        "rgb(0, 0, 0)": "&nbsp;"
    }
    let upperAsciiDict = {
        "rgb(255, 192, 192)": "T",
        "rgb(255, 0, 0)": "L",
        "rgb(192, 0, 0)": "D",
        "rgb(255, 255, 192)": "V",
        "rgb(255, 255, 0)": "N",
        "rgb(192, 192, 0)": "F",
        "rgb(192, 255, 192)": "R",
        "rgb(0, 255, 0)": "J",
        "rgb(0, 192, 0)": "B",
        "rgb(192, 255, 255)": "S",
        "rgb(0, 255, 255)": "K",
        "rgb(0, 192, 192)": "C",
        "rgb(192, 192, 255)": "Q",
        "rgb(0, 0, 255)": "I",
        "rgb(0, 0, 192)": "A",
        "rgb(255, 192, 255)": "U",
        "rgb(255, 0, 255)": "M",
        "rgb(192, 0, 192)": "E",
        "rgb(255, 255, 255)": "_",
        "rgb(0, 0, 0)": "@"
    }

    asciiPietLabel.innerHTML = "ascii-piet: \""
    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            if (getCodel(j, i) == false) {continue }
            if (j == width - 1) {
                asciiPietLabel.innerHTML = asciiPietLabel.innerHTML + upperAsciiDict[getCodel(j, i).style.backgroundColor];
            } else {
                asciiPietLabel.innerHTML = asciiPietLabel.innerHTML + lowerAsciiDict[getCodel(j, i).style.backgroundColor];
            }
        }
    }
    asciiPietLabel.innerHTML = asciiPietLabel.innerHTML + "\"";
}
//Clear Grid
clearGridButton.addEventListener("click", () => {
  grid_width = 0;
  grid_height = 0;
  container.innerHTML = "";
  create_grid();
});
//Erase Button
eraseBtn.addEventListener("click", () => {
  erase = true;
});
//Paint button
paintBtn.addEventListener("click", () => {
  erase = false;
});
//Start button
startButton.addEventListener("click", () =>{
  start();
})

stepButton.addEventListener("click", () => {
  step();
})

pauseButton.addEventListener("click", () => {
  reset();
})

function isWhite(color) {
    return JSON.stringify(color) == "[255, 255, 255]";
}
