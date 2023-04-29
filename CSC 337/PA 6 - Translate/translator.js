/*
	Author: Kaichun Lee
	Course: CSC337
	Description: This is a web server that can simlpy translate English, Spanish and German to each other.


*/


const http = require('http');
const hostname = '127.0.0.1';
const port = 5000;

const fs = require('fs');
const readLine = require('readline')


// maps 
e2s = {};
e2g = {};
s2e = {};
g2e = {};



// create data
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
    		//if (interpretation.charCodeAt(i)>=97 && interpretation.charCodeAt(i)<=122){
    			//word+=interpretation.charAt(i);
    		//}
    		if (interpretation.charAt(i) == ';' || interpretation.charAt(i) == ',' || interpretation.charAt(i) == '(' || interpretation.charAt(i) == '[' || interpretation.charAt(i)== '/' || interpretation.charAt(i) == '=' || interpretation.charAt(i) == '?' )
    			break;
    		word+=interpretation.charAt(i);
    	}

    	if(word.charAt(word.length-1)==" ") word = word.substring(0,word.length-1);

    	a2b[words[0]] = word;
    	b2a[word] = words[0];
    	//console.log(words[0] + ":"+ words[1] + "   " + a2b[word[0]]);
    //	console.log(words[0] + ":" + a2b[word[0]]);


  	}
}


//readLines("gm.txt", e2g, g2e);

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
			res += map[word]+' ';
	//		console.log(word);
	//		console.log(map[word]);
		}
	}else if (pass2map == 1){
	//	console.log("in");
		for (word of sentence){
			res += map2[map[word]] + ' ';
		//	console.log(word);
		//	console.log(map[word]);

		}

	}

	return res;
}


async function main(){
	// read file 
	await readLines('Spanish.txt', e2s, s2e);
	await readLines('German.txt', e2g, g2e);

	const server = http.createServer((req, res) => {


		res.statusCode = 200;
	  	res.setHeader('Content-Type', 'text/plain');

	  	urlComponents = req.url.split("/");

	  	if (urlComponents[1] != "translate"){
	  		res.end("OK");
	  	}else if (urlComponents[1] == "translate" && urlComponents.length == 4){
	  

	  		//console.log(urlComponents[3]);

	  	//	res.end(translator(urlComponents[2], urlComponents[3]));

	  	//		console.log('///text begin///')
	  	//		console.log(e2g);

	  		switch (urlComponents[2]){
	  			case 'e2s':
	  				res.end(translator('e2s', urlComponents[3]));
	  				break;
	  			case 'e2g':
	  				res.end(translator('e2g', urlComponents[3]));
	  				break;
	  			case 's2e':
	  				res.end(translator('s2e', urlComponents[3]));
	  				break;
	  			case 'g2e':
	  				res.end(translator('g2e', urlComponents[3]));
	  				break;
	  			case 's2g':
	  				res.end(translator('s2g', urlComponents[3]));
	  				break;
	  			case 'g2s':
	  				res.end(translator('g2s', urlComponents[3]));
	  				break;
	  			default:
	  				res.end("Plz input a valid word");
	  				break;
	  		}
		}else{
			res.end("Length is not valid");
		}
	  
	});

	server.listen(port, hostname, () => {
	  console.log(`Server running at http://${hostname}:${port}/`);
	});
}


main();

