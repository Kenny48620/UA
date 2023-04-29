/*
	Author: Kaichun Lee
	Course: CSC337
	Description; This file is to send request to the server.
*/

/*
	This function is to send user data to the server

*/
function addUser(){
	console.log("Loc: addUser()");
	var httpRequest = new XMLHttpRequest();
	if (!httpRequest){
		alert('Error, not httpRequest');
		return false;
	}

	httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(httpRequest.status === 200) {
            	console.log(httpRequest.responseText)
            } 
            else { 
            	console.log('here');
            	alert('ERROR0:' + ('' + httpRequest.status)); 
            }
        }
    }

	let u = document.getElementById('username').value;
	let p = document.getElementById('password').value;

	console.log(u);
	console.log(p);
	
	newObj     = {username:u, password:p, listings: [], purchases: []};
	dataString = JSON.stringify(newObj);

	console.log(dataString);

	let method = 'POST';
	let url    = '/add/user/';
	httpRequest.open(method, url);
	httpRequest.setRequestHeader('Content-type', 'application/json');
	httpRequest.send(dataString);

}

/*
	This is to send the item data to the server
*/
function addItem(){
	console.log('Loc: addItem()');
	var httpRequest = new XMLHttpRequest();
	if (!httpRequest){
		alert('Error, not httpRequest');
		return false;
	}

	httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(httpRequest.status === 200) {
            	console.log(httpRequest.responseText)
            } 
            else { 
            	console.log('here');
            	alert('ERROR0:' + ('' + httpRequest.status)); 
            }
        }
    }

    let t = document.getElementById('title').value;
    let d = document.getElementById('desc').value;
    let i = document.getElementById('image').value;
    let p = document.getElementById('price').value;
    let s = document.getElementById('status').value;

    let u = document.getElementById('itemUsername').value;


    newObj 	   = {title:t, description:d, image:i, price:p, stat:s}
    dataString = JSON.stringify(newObj);

    console.log(dataString);
    let method = 'POST';
    let url    = '/add/item/'+u;

	httpRequest.open(method, url);
	httpRequest.setRequestHeader('Content-type', 'application/json');
	httpRequest.send(dataString);

	console.log('Saves !');
}