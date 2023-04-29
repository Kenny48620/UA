/*
	Class: CSC337
	Author: Kaichun Lee
	Description: This file is using AJAX to send a message to a server 
	and get the message from the server. Afterthat, the reponse will be represented
	in index.html.
*/


/*
	This function is to process the request and get the response from a static server then
	send it to index.html.
*/
function setupRequest(){

	// create an request
	var httpRequest = new XMLHttpRequest();

	if (!httpRequest){
		alert("Error1");
		return false;
	}

	
	httpRequest.onreadystatechange = () => {
		// check the status
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
	  			console.log("Status 200 OK")
	    		var output = document.getElementById("output");
	    		// if the language is mapped itself, change nothing
	    		if (httpRequest.responseText == "unchange"){
	    			output.innerText = document.getElementById("input").value;
	    		}else{
	    			output.innerText = httpRequest.responseText;
	    		}
	  		}else { 
	  			alert('ERROR2'); 
	  		}
		}
	}

	// get the operation
	var from     = document.getElementById("from").value;
	var to       = document.getElementById("to").value;
	var a2b      = from + to;
	// get the input and split with a space to get each word
	var input    = document.getElementById("input").value;
	var words    = input.split(" ");
	var sentence = "";
	
	// load words 
	if(words.length > 0){
		sentence = words[0];
	}

	if (words.length > 1){
		for (var i=1; i<words.length; i++){
			if(words[i] == ""){
				continue;
			}
			sentence += "+" + words[i];
		}
	}
	 
	console.log(sentence);

	// process the information
	if (sentence==""){
		document.getElementById("output").innerText = "";
	}
	else{
		var method   = "GET";
		var url      = "http://localhost:3000/translate/"+a2b+"/"+sentence;
		var async    = true;

		httpRequest.open(method, url, async);
		httpRequest.send();
	}
	
}