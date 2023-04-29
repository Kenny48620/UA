/*
	Author: Kaichun Lee
	Course: CSC337
	Description: This is the server.
*/



//importing module express
const express  = require('express');
//Import the mongoose module
const mongoose = require('mongoose');
const parser   = require('body-parser');

// creating an express application
const app      = express();
// setting port to 80
const port     = 80;
app.use(express.static('public_html'));
app.use(parser.json());
app.use(parser.urlencoded({extended:true}));


//Set up default mongoose connection
var dbURL      = "mongodb://127.0.0.1/chats"
mongoose.connect(dbURL, {useNewUrlParser:true});

//Get the default connection
var db         = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


//Define a schema and the fields
var Schema = mongoose.Schema;
var MessageSchema = new Schema({
	time: Number,
  	alias: String,
  	message: String
});

// compile model from scchema
var Message = mongoose.model('Message', MessageSchema);

// GET request
// description: The client should make a request to this path every 1 second.
//
// display the chat to the client 
app.get('/chats', (req, res)=>{

		var msg = Message;
		msg.find().sort({time:1}).exec(
					function(err, results){
					let result = "";
					for(i in results){
						result += "<b>"+results[i].alias+"</b><br>"+results[i].message+"<br><br>";
					}
					res.send(result);
					}
		)
});
// POST request
app.post('/chats/post', (req, res)=>{
	console.log(req.body.ChatMessage);
	var jsonObj = JSON.parse(req.body.ChatMessage);

	var message = new Message(jsonObj);
	message.save(function(err){if(err)console.log("an error happen in save data");});
});
//debug
app.get("/get/chats/",(req,res)=>{
	var U = Message;
	U.find()
	 .exec(function(error,results){
		res.setHeader('Content-Type', 'text/plain');
		res.send(JSON.stringify(results,null,4));
	});
	
});

// start up the server
app.listen(port,()=>{
	console.log("Start listening");
});









