(function() {
	var intervalId;
	var Life = {
		rules: {
			life: function(){
				var nextGen = Life.utils.makeArray(Life.grid.columns, Life.grid.rows);
				for (i=0; i < Life.grid.columns; i++){
					for (j=0; j < Life.grid.rows; j++){
						var neighbors = Life.model.getNeighbors(i,j);
						var count = neighbors.count;
						if (Life.state[i][j] == 1){ //live cell
							if (count < 2){ // dies - under population
								nextGen[i][j] = 0;
							}else if (count == 2 || count == 3){// lives 
								nextGen[i][j] = 1;
							}else { //dies - overcrowding
								nextGen[i][j] = 0;
							}
						}else{ //dead cell
							if (count == 3){ //reproduction
								nextGen[i][j] = 1;
							}
						}						
					}
				}
				return nextGen.slice(0);
			},
			wireworld: function(){
				var nextGen = Life.utils.makeArray(Life.grid.columns, Life.grid.rows);
				for (i=0; i < Life.grid.columns; i++){
					for (j=0; j < Life.grid.rows; j++){
						var neighbors = Life.model.getNeighbors(i,j);
						var count = neighbors.count;
						if (Life.state[i][j] == 1){ //conductor cell
							var headCount = Life.utils.countOf(neighbors.neighbors, 2);
							if (headCount == 1 || headCount == 2){
								nextGen[i][j] = 2;
							}else{
								nextGen[i][j] = 1;
							}
						}else if (Life.state[i][j] == 2){ //head cell
							nextGen[i][j] = 3;
						}else if (Life.state[i][j] == 3) { //tail cell
							nextGen[i][j] = 1;
						}						
					}
				}
				return nextGen.slice(0);
			}
		},
		state: [],
		model: {
			changeCell: function (x,y,val){
				Life.state[x][y] = val;
			},
			randomize: function(){
				var x,y;
				for (x = 0; x < Life.grid.columns; x++){
					for (y = 0; y < Life.grid.rows; y++){
						Life.state[x][y] = (Math.random() < 0.15 ? 1 : 0);
					}
				}
			},
			getNeighbors: function(x,y){
				var maxX = Life.grid.columns - 1, 
					maxY = Life.grid.rows - 1;
				var state = Life.state;
					
				var hasLeft = x > 0;
				var hasRight = x < maxX;
				var hasTop = y > 0;
				var hasBottom = y < maxY;
				
				var arr = [hasTop && hasLeft ? state[x-1][y-1] : 0, //top left
				hasTop ? state[x][y-1] : 0, 		//top middle
				hasTop && hasRight ? state[x+1][y-1] : 0,	//top right
				hasLeft ? state[x-1][y] : 0, 		//left
				hasRight ? state[x+1][y] : 0,		//right
				hasBottom && hasLeft ? state[x-1][y+1] : 0, 	//bottom left
				hasBottom ? state[x][y+1] : 0, 		//bottom middle
				hasBottom && hasRight ? state[x+1][y+1] : 0];	//bottom right
				return {
					neighbors: arr.slice(0),
					count: arr.reduce(function(prev, curr){
							if (curr != 0){
								return ++prev;
							}
							return prev;
						}, 0),
					
				};
							
			},
			tick: function(){
				var lifeChecked = document.getElementById('rdoLife').checked,
					wireChecked = document.getElementById('rdoWire').checked;
				
				if (lifeChecked){
					Life.state = Life.rules.life();
				}else if (wireChecked){
					Life.state = Life.rules.wireworld();
				}
				
				
			},
		},
		
		grid: {
			//some constants
			rows: 50,
			columns: 50,
			width: document.getElementById("canvas").width,
			height: document.getElementById("canvas").height,
			 
			//methods		
			getCellWidth: function() {
				return Math.floor(Life.grid.width / Life.grid.columns);
			},
			getCellHeight: function() {
				return Math.floor(Life.grid.height / Life.grid.rows);
			},
			draw: function() {
				var canvas = document.getElementById('canvas');
				//reset the grid
				canvas.width = canvas.width;
				var ctx = canvas.getContext('2d');
				ctx.strokeRect(0,0,Life.grid.width, Life.grid.height);
				var cellWidth = Life.grid.getCellWidth(),
						cellHeight = Life.grid.getCellHeight();
						
				if (document.getElementById('chkDrawGrid').checked){
					for (x = cellWidth + .5; x < Life.grid.width; x += cellWidth){
						ctx.moveTo(x,0);
						ctx.lineTo(x, Life.grid.height);
						ctx.stroke();
					}
					for (y = cellHeight + .5; y < Life.grid.height; y += cellHeight){
						ctx.moveTo(0,y);
						ctx.lineTo(Life.grid.width,y);
						ctx.stroke();
					}
				}
			
				for (i = 0; i < Life.grid.columns; i++){
					for (j = 0; j < Life.grid.rows; j++){
						var state = Life.state[i][j];
						if (state != 0){
							var xx = i * cellWidth;
							var yy = j * cellHeight;
							switch (Number(state)){
								case 2:
									ctx.fillStyle = "#0000FF";
									break;
								case 3:
									ctx.fillStyle = "#FF0000";
									break;
								default:
									ctx.fillStyle = "#000000";
									break;
							}
							var centerX = xx + (cellWidth / 2),
								centerY = yy + (cellHeight / 2);
							var squareChecked = document.getElementById('rdoSquare').checked;
							if (squareChecked){
								ctx.fillRect(xx,yy,cellWidth, cellHeight);
							}else { //circle for now
								ctx.beginPath();
								ctx.arc(centerX, centerY,(cellWidth / 2), 0, 2 * Math.PI);
								ctx.fill();
							
							}
							
						}
					}
				}
			},
			
		},	
		
		init: function(){
			$("#btnRandom").on('click',function(){
				Life.model.randomize();
				Life.grid.draw();
			});
			$("#btnTick").on('click',function() {
				Life.model.tick();
				Life.grid.draw();
			});
			$("#btnTimer").one('click',Life.utils.start);
			Life.utils.stop.call();
			$("#canvas").click(function(e){
				var x = e.pageX - $(this).offset().left;
				var y = e.pageY - $(this).offset().top;
				//Life.utils.logNeighbors(x,y);
				
				var cellWidth = Life.grid.getCellWidth(),
					cellHeight = Life.grid.getCellHeight();
				
				var cellX = Math.floor(x / cellWidth);
				var cellY = Math.floor(y / cellHeight);
				var insertVal = Number($('#txtInsert').val());
				Life.model.changeCell(cellX, cellY, insertVal);
				Life.grid.draw();
				
			});
			
			var rows = Number($('#txtRows').val());
			var cols = Number($('#txtColumns').val());
			Life.grid.rows = rows;
			Life.grid.columns = cols;
			
			//initialize the state
			Life.state = Life.utils.makeArray(Life.grid.columns, Life.grid.rows);
			Life.grid.draw();
		},
		
		utils: {
			countOf: function(arr, num){
				var sum = 0;
				var index;
				for (index = 0; index < arr.length; index++){
					if (arr[index] === num){
						sum++;
					}
				}
				return sum;
			},
			isRunning: false,
			logNeighbors: function(x,y){
				//find grid placement
				var cellWidth = Life.grid.getCellWidth(),
					cellHeight = Life.grid.getCellHeight();
				
				var cellX = Math.floor(x / cellWidth);
				var cellY = Math.floor(y / cellHeight);
				console.log("Clicked cell (" + cellX + ", " + cellY + ") - Neighbors: " + Life.model.getNeighbors(cellX,cellY).count);
				
			},
			start: function(){
				var wait = Number($('#txtSpeed').val());
				if (!Life.utils.isRunning){
					intervalId = setInterval(function() {Life.model.tick(); Life.grid.draw();}, wait);
					Life.utils.isRunning = true;
					$("#btnTimer").one('click',Life.utils.stop);
					$("#btnTimer").html('Stop');
				}
			},
			stop: function(){
				if (Life.utils.isRunning){
					clearInterval(intervalId);
					Life.utils.isRunning = false;
					$("#btnTimer").one('click',Life.utils.start);
					$("#btnTimer").html('Start');
				}
			},
			outputGrid: function(){
				for (i=0; i < Life.grid.rows; i++){
					console.log(Life.state[i]);
				}
				console.log('****************************************************');
			},
			makeArray: function(columns, rows){
				var row = [];
				var ret = [];
				for (x = 0; x < columns; x++){
					row.push(0);	
				}
				for (y=0; y < rows; y++){
					ret.push(row.slice(0));
				}
				return ret.slice(0);
			}
		}
	};

	$("#btnReset").on('click',Life.init);
	onload = function(){
		Life.init();
	};
}());