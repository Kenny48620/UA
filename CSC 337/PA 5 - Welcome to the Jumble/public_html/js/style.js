/*

	Author: Kaichun Lee
	Class: CS337
	Description: This is a javascript for index.html.

*/

// store alphabet
arr = [];

// dispaly the currrent value of the slider
function displayValue(){
	var val = document.getElementById("slider");
	var cur = document.getElementById("curVal");
	cur.innerText = val.value;
}

// set caesar cipher 
function setCaesar(){
	// assign upper case inputText to variable text
	var text = document.getElementById("inputText").value.toUpperCase();
	var caesar = document.getElementById("caesar");
	var offset = parseInt(document.getElementById("slider").value);
	var encrypted = "";

	for (var i=0; i<text.length; i++){
		var letterAscii = text.charCodeAt(i);
		if (letterAscii >= 65 && letterAscii <= 90){
			letterAscii += offset;
			if (letterAscii > 90){
				letterAscii = 64 + (letterAscii - 90);
			}

		}
		encrypted += String.fromCharCode(letterAscii);
	}
	caesar.innerText = encrypted;
}

// create a table and set the value
function setTable(){
	var tb = document.getElementById("table");
	var content = "";

	var index = 0;

	for (var row = 0; row<5; row++){
		content += '<tr>';
		for (var col = 0; col<5; col++){
			content += '<td>' + arr[index] + '</td>';
			index++;
		}
		content += '</tr>';		
	}
	tb.innerHTML = content;

}

// create an array for shuffle algorithm
function squareAlgorithm(status){
	
	if (status == "default"){
		for (var i=0; i<25; i++){
			arr.push(String.fromCharCode(i+65));
		}
		return;
	}
	// shuffle the element randomly in the array 
	arr = arr.sort(() => Math.random() - 0.5);
	
}

// set square cipher
function setSquare(){
	var text = document.getElementById("inputText").value.toUpperCase();
	var square = document.getElementById("square");
	var encrypted = "";

	for (var i=0; i<text.length; i++){
		var index = text.charCodeAt(i);
		if (index >= 65 && index < 90){
			encrypted += arr[index-65];
		}
		else{
			encrypted += text[i];
		}
	}
	square.innerText = encrypted;
}

// use to set the website initially 
function main(){
	displayValue();
	squareAlgorithm("default");
	setTable();
	setCaesar();
	setSquare();
}

main();