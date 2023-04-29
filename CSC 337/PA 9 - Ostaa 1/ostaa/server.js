/*
	Author: Kaichun Lee
	Course: CSC337
	Description: This is a simplest online-marketplace app.
*/
// importing module
const express  = require('express');
const mongoose = require('mongoose');
const parser   = require('body-parser');

const port     = 3000;

// creating an express applocation
const app 	   = express();

app.use(express.static('public_html'))
app.use(parser.json());
app.use(parser.urlencoded({extended:true}));

// setting up connection with mongoose database
var mongoDB	   = 'mongodb://127.0.0.1/ostaa';
mongoose.connect(mongoDB, {useNewUrlParser:true});
// get the connection
var db 		   = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


// Setting the schema
var Schema     = mongoose.Schema;
// Setting Items
var ItemSchema = new Schema({
					title: String,
					description: String,
					image: String,
					price: Number,
					stat : String,
});

// Setting User
var UserSchema  = new Schema({
					username: String,
  					password: String,
  					// list of item its
  					//	listings: [...list of item its...],
  					listings: [{type:Schema.Types.ObjectId,ref:'Item'}],
  					// list of item ids
  					//	purchases: [...list of item ids...] 
  					purchases: [{type:Schema.Types.ObjectId,ref:'Item'}],
  					
 });

var TestSchema = new Schema({
					name: String,
					date: String,
})

// Compile model from schema
// The first argument is the singular name of the collection that will be created for your model
// The second argument is the schema you want to use in creating the model

const Item = mongoose.model('Item', ItemSchema);
const User = mongoose.model('User', UserSchema);
// after above two line codes run, the mongo will build these two collections, which is items and users


// return a JSON array containing the information for every user in the database.
app.get('/get/users/', (req, res)=>{
	User.find()
		.exec((err, results) => {
			if(err) return res.end('Fail');
			res.end(JSON.stringify(results, null, 2));
		});
});


// return a JSON array containing the information for every item in the database.
app.get('/get/items/', (req, res)=>{
	Item.find()
		.exec((err, results) => {
			if(err) return res.end('Fail');
			res.end(JSON.stringify(results, null, 2));
		});
});


//  return a JSON array containing every listing (item)for the user USERNAME.
app.get('/get/listings/:USERNAME', (req, res)=>{
	var name = req.params.USERNAME;
	console.log('Loc: /get/listings/:USERNAME')
	console.log(name)
	User.find({username: name})
		.populate('listings')
	    .exec((err, results) => {
	    	console.log(results);
      		if (err) return res.end('FAIL');
      		console.log(results[0].listings);
     		for (var i in results){
     			res.setHeader('Content-Type', 'text/plain');
     			res.send(JSON.stringify(results[i].listings, null, 4));
     		}
      		
    });
});


// return a JSON array containing every purchase (item) for the user USERNAME
app.get('/get/purchases/:USERNAME', (req, res)=>{
	var name = req.params.USERNAME;
	console.log('Loc: /get/purchases/:USERNAME');
	console.log(name);

	User.find({username:name})
		.exec((err, results)=>{
			console.log(results);
			if (err) return res.end('FAIL');
			res.end(JSON.stringify(results[0].purchases, null, 2));
		})

})


// return a JSON list of every user whose username has the substring KEYWORD.
app.get('/search/users/:KEYWORD', (req, res)=>{
	var keyword = req.params.KEYWORD;
	console.log('Loc: /search/users/:KEYWORD');
	console.log(keyword);

	User.find()
		.exec((err, results) =>{
			if (err) return res.end('FAIL');
			console.log(results);
			var list = [];
			for (var i in results){
				if (results[i].username.includes(keyword)){
					list.push(results[i]);
				}
			}
			res.end(JSON.stringify(list, null, 2));
		});
		

});
// return a JSON list of every item whose description has the substring KEYWORD
app.get('/search/items/:KEYWORD', (req, res)=>{
	var keyword = req.params.KEYWORD;
	console.log('Loc: /search/items/:KEYWORD');
	console.log(keyword);

	Item.find()
		.exec((err, results)=>{
			if (err) return res.end('FAIL');
			console.log(results);
			var list = [];
			for (var i in results){
				console.log(results[i].description);
				if (results[i].description.includes(keyword)){
					list.push(results[i]);
				}

			}
			res.end(JSON.stringify(list, null, 2));
		});
});



// add a user to the collection users
app.post('/add/user/', (req, res)=>{
	console.log('post: /add/user/');
	
	console.log(req.body);

	let obj     = JSON.stringify(req.body);
	var userObj = JSON.parse(obj);
	var user    = new User(userObj);

	user.save(function(err){if(err)console.log("an error happen in save data");});

	console.log('Add user successfully!');
});


// add a item into the collection items and add the id into user's listings
app.post('/add/item/:USERNAME', (req, res)=>{
	console.log('/add/item/:USERNAME');
	console.log(req.body);

	let obj     = JSON.stringify(req.body);
	let itemObj = JSON.parse(obj);
	let item    = new Item(itemObj);

	item.save(function(err){if(err)console.log("an error happen in save data");});
	console.log('Add item successfully!');

	// get the name 
	var name    = req.params.USERNAME;
	console.log(name);

	// find the data by the username
	User.find({username:name})
		.exec((err, results)=>{
			console.log(results);
			console.log(results[0].username);
			console.log('id = '+item._id);
			// push the elemnt into the listings
			results[0].listings.push(item._id);
			results[0].save(function(err){if(err)console.log("an error happen in save data");});
	})
});


// create a server that browsers can connect to
app.listen(port, ()=>{
	console.log('Start the server on port ' + port);
});