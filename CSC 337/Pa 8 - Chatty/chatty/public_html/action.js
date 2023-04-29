/*
	Author: Kaichun Lee
	Course: CSC337
	Description: This file is to do a action that sending data, and my
	IP address for my sever is 165.232.158.26:80

*/

/*
This function is used to grasp the chat and send it to server
*/
function sendMsg(){
	var httpRequest = new XMLHttpRequest(); 
	    if(!httpRequest){
        alert('Error, not httpRequest!');
        return false;
    }
	
	httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(httpRequest.status === 200) {
            } 
            else { 
            	alert('ERROR0:' + ('' + httpRequest.status)); 
            }
        }
    }
	
    
	var alias   = document.getElementById('alias').value;
	var msg     = document.getElementById('msg').value;
    
	//let url   =  'http://165.232.158.26:80/chats/post';
	

	var msgObj = {time:Date.now(), alias:alias, message:msg};
	var msgJson = 'ChatMessage='+JSON.stringify(msgObj);

    var method = 'POST';
    var url    = 'http://127.0.0.1:80/chats/post';
    var asy    = true
    // post msg 
	httpRequest.open(method, url, asy);
    httpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	httpRequest.send(msgJson);
	
	// make the chat box to be empty
    document.getElementById("msg").value = "";
}

/*
This function is used to set the interval to 1 second 
*/
setInterval(() => {
    var httpRequest = new XMLHttpRequest();
	if(!httpRequest){
        alert('Error');
        return false;
    }

    httpRequest.onreadystatechange = () => {
        if(httpRequest.readyState === XMLHttpRequest.DONE) {
            if(httpRequest.status === 200) {
                document.getElementById('chatRoom').innerHTML = httpRequest.responseText;
				
            } 
            else { 
                alert('ERROR1:' + ('' + httpRequest.status)); 
            }
        }
    }
    var method ='GET'
    var url    = 'http://127.0.0.1:80/chats';

    //var url = 'http://165.232.158.26:80/chats';
    httpRequest.open(method, url);
    httpRequest.send();
}, 1000);
