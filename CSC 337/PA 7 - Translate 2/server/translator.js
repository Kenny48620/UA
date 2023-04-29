/*
	Author: Kaichun Lee
	Course: CSC337
	Description: This is a web server that build with express and can simlpy translate English, 
	Spanish and German to each other. I makes a little change in this one from previous.
*/

//importing module express
const express = require('express');
//importing module fs
const fs = require('fs');
//importing module readLine
const readLine = require('readline')

// creating an express application
const app = express();
//setting the port
const port = 3000;


// maps 
e2s = {};
e2g = {};
s2e = {};
g2e = {};


/*
	This function is to read files and create data
*/
async function readLines(fileName, a2b, b2a) {

	const fileStream = fs.createReadStream(fileName);
  	const rl = readLine.createInterface({ 
    input: fileStream, 
    crlfDelay: Infinity });

	for await (const line of rl) {
		// skip the title of the file
    	if (line[0] == '#') continue;


    	words = line.split("\t");
    	interpretation = words[1].toLowerCase();
    	word = "";
    	for (var i=0; i<interpretation.length; i++){
    		if (interpretation.charAt(i) == ';' || interpretation.charAt(i) == ',' || interpretation.charAt(i) == '(' || interpretation.charAt(i) == '[' || interpretation.charAt(i)== '/' || interpretation.charAt(i) == '=' || interpretation.charAt(i) == '?' )
    			break;
    		word+=interpretation.charAt(i);
    	}

    	if(word.charAt(word.length-1)==" ") word = word.substring(0,word.length-1);

    	a2b[words[0]] = word;
    	b2a[word] = words[0];
 
  	}
}


/*
	This function it to read the input from url path and process the input and translate it
*/
function translator(request, inputs){


	sentence = inputs.split('+');
	pass2map = 0;
	res = '';
	switch(request){
		case 'e2s':
			map = e2s;
			break;
		case 'e2g':
			map = e2g;

			break;
		case 's2e':
			map = s2e;
			break;
		case 'g2e':
			map = g2e;
			break;
		case 's2g':
			map = s2e;
			map2 = e2g;
			pass2map = 1;
			break;
		case 'g2s':
			map = g2e;
			map2 = e2s;
			pass2map = 1;
			break;
		default:
			break;
	}
	if (pass2map == 0){
		for (word of sentence){
			if (map[word] != undefined)
				res += map[word]+' ';
			else
				res += "?";
			console.log(res);
		}
	}else if (pass2map == 1){
		for (word of sentence){
			if (map2[map[word]] != undefined)
				res += map2[map[word]] + ' ';
			else
				res += "?";
		}
	}

	return res;
}
/*
	This is the main function of this whole program. It structure how this program looks like and
	determine where the input is going to go.
	
*/
async function main(){
	// read file and create data
	await readLines('Spanish.txt', e2s, s2e);
	await readLines('German.txt', e2g, g2e);

	app.use(express.static("public_html"));
	app.get("/:operation/:lang/:text",(req, res) => {

		// lang is the language that we want to translate from and to
		// text is the input that user want to translate eg. a sentence or a word
		var lang = req.params.lang;
	  	var text = req.params.text;

	  	switch (lang){
	  		// maps to itself
	  		case 'e2e':
	  			res.send('unchange');
	  			break;
	  		case 's2s':
	  			res.send('unchange');
	  			break;
	  		case 'g2g':
	  			res.send('unchange');
	  			break;
	  		// maps to others
  			case 'e2s':
  				res.send(translator('e2s', text));
  				break;
  			case 'e2g':
  				res.send(translator('e2g', text));
  				break;
  			case 's2e':
  				res.send(translator('s2e', text));
  				break;
  			case 'g2e':
  				res.send(translator('g2e', text));
  				break;
  			case 's2g':
  				res.send(translator('s2g', text));
  				break;
  			case 'g2s':
  				res.send(translator('g2s', text));
  				break;
  			default:
  				res.send("Plz input a valid translation");
  				break;
	  		}
	  
	});
	// start up the server
	app.listen(port, () => 
		console.log(`Server running at http://localhost:${port}/`));
}


main();

