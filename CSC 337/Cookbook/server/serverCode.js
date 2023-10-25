/*
	SERVER SIDE CODE

	The server for this will handle requests and will basically manage the 3 datatypes in the data base
		Requests
			creating new users with hash passwords			
			allowing users to login

			add new cook books to db (making is client side)
			get cookbook from db

			add new recipe
			get recipe

			find a user by username
			find a cookbook by keyword or all
			find a recipe by keyword or all


		
			server 931 line long and the client side js totals up to 1015 lines of code ha.

*/


//  HOST and PORT update host for droplet server when ready
const hostname = '165.232.158.26';
const port = 80;



const express = require('express');
const mongoose = require('mongoose')
const parser = require('body-parser');
const cookieParser = require('cookie-parser')
const crypto = require('crypto');


const app = express();
app.use(parser.json());
app.use(parser.urlencoded({extended: true}));



//connect to database
const db = mongoose.connection;
const localDBURL = 'mongodb://127.0.0.1/TheCookbook';


var Schema = mongoose.Schema;

var userSchema = new Schema(
{
	userName: String,

	userSalt: String,
	userHash: String, //the hash password

	//this will be the cook books id, either a mongodb id or something
	myCookBooks: [{type: mongoose.Schema.Types.ObjectId, ref:'Cookbook'}],
	//this will be a string of usernames
	myFriends: [],
	//this is another list of unqiue recipeID,
	myAuthoredRecipies: [{type: mongoose.Schema.Types.ObjectId, ref:'RecipeModel'}],


});


var recipeSchema = new Schema({
	
	recipeTitle: String,

	category: String,

	//when a user creates a new recipe they will be the original author
	origAuthor: String,
	//a list of	usernames strings when someone copies a recipe they can add or change it and they will get added here
	contributors: [],
	//this can be one long string
	instructions: String,
	//this is more specifically an array of strings
	ingredients: String,

	difficulty: Number,

	//how long it takes in hours
	timeToMake: Number,

	//this is a list of ids. a feature in this is that users can copy recipes from other books and the recipe will keep track of the books its been copied too building a record of popular recipes
	listOfBooks: [{type: mongoose.Schema.Types.ObjectId, ref:'Cookbook'}],



});

var cbCategories = ["Appetizers", "Soups & Salads", "Breads", "Eggs", "Vegetable", "Pasta", "Breakfast", "Meat", "Seafood", "Sauces", "Beverages", "Desserts"];

//this is a collection of recipes and hold collection of all users who can edit(Family) and readonly(Friends) as well as whether the book is publicly available.
var cookBookSchema = new Schema({

	cookBookTitle: String,

	categories: ["Appetizers", "Soups & Salads", "Breads", "Eggs", "Vegetable", "Pasta", "Breakfast", "Meat", "Seafood", "Sauces", "Beverages", "Desserts"],
	//a list of recipeID to fetch with
	recipes: [{type: mongoose.Schema.Types.ObjectId, ref:'RecipeModel'}],
	//there can be a global search to browse other users books. when true the book is viewable in the global search
	publicAccess: String, //TRUE = PUBLIC   FALSE = PRIVATE
	//this is the creator of the cookbook
	author: String,

	//list of editors usernames
	family: [],
	//list of readonly who have access when the book is private
	friends: [],

	description: String,

});

var chatMessageSchema = new Schema({
	userName: String,
	message: String
});

var grocerySchema = new Schema({
	userName: String,
	grocery: String
});



//create the static object model
var UserModel = mongoose.model('User', userSchema );
var CookBookModel = mongoose.model('CookBook', cookBookSchema, 'cookbooks');
var RecipeModel = mongoose.model('RecipeModel', recipeSchema, 'recipes');
var chatModel = mongoose.model('Chat', chatMessageSchema);
var groceryModel = mongoose.model('Grocery', grocerySchema);



//Set up the connection to the DB
mongoose.connect(localDBURL, { useNewUrlParser: true });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));











// ssssssssssssssssssssssssssssssss Server sssssssssssssssssssssssss


//listener
//this will print on start with name and port
app.listen(port, hostname, () => 
  {
    console.log(`Server running at http://${hostname}:${port}/`);
  }
);


// Tell the express app to pare any body type and to use a cookie parser
app.use(parser.text({type: '*/*'}));
app.use(cookieParser());



//server functions



app.use(express.static('public_html'))
app.use('/app/*', authenticate)
app.get('/', (req, res) => { res.redirect('/account/account.html'); });





// HASHING

//this function gets the hash of the password plus its salt
function getHash(password, salt) {
  var cryptoHash = crypto.createHash('sha512');
  var toHash = password + salt;
  var hash = cryptoHash.update(toHash, 'utf-8').digest('hex');
  return hash;
 
}

function isPasswordCorrect(account, password) {
  var hash = getHash(password, account.userSalt);
  return account.userHash == hash;
}

/** END HASHING CODE **/




 
// sssssssssssssssssssssssssse             SESSIONS                ssssssssssss


// Some code for tracking the sessions on the server

// map usernames to timestamp
var sessions = {};
const LOGIN_TIME = 600000;

function filterSessions() {
  	var now = Date.now();
  	for (x in sessions) {
    	username = x;
    	time = sessions[x];
    	if (time + LOGIN_TIME < now) {
			console.log('delete user session: ' + username);
      		delete sessions[username];
    	}
  	}
}

//filter the sessions every 2 seconds
setInterval(filterSessions, 2000);


function addSession(username) {
  var now = Date.now();
  sessions[username] = now;
}

function doesUserHaveSession(username) {
  return username in sessions;
}


function authenticate(req, res, next) {
  var c = req.cookies;
  if (c && c.login) 
  {
    var username = c.login.username;

    //console.log("authenticating: " + username);

    if (doesUserHaveSession(username)) {
    	//console.log("user is valid");
      addSession(username);
      next();
    } else 
    {
    	//console.log("user is failed authentication");

  		res.redirect('app/home.html');
    }
  }
}


//sssssssssssssssssssssssEND of SESSIONS






// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr REQUEST HANDLES


//user related
//this gets all users debug purposes
app.get('/get/users/',(req, res) =>
{
	UserModel.find({})
	.exec(function (err, results)
		{
			if (err) return handleError(err);
			res.end(JSON.stringify(results));
		});
});


//log in
app.post('/account/login/',(req, res) =>
{
	console.log("attempting to log in: " + req.body.username);

	//when we get a login request we will look for the user
	UserModel.find({userName : req.body.username})
	.exec(function (err, results) {
		if (err) return res.end('Login failed: Error occured when searching the database');
		console.log(results.length);
		//if we find the user then we can check the password
		
		if (results.length == 0)
		{
			res.end('Login Failed: User does not exist!');
			//res.end('Login failed: could not locate username');

		}
		else
		{
			var passwordInput = req.body.password;
			var salt = results[0].salt;
			var isCorrect = isPasswordCorrect(results[0], passwordInput);


			//if we have one result then we can check the password these passwords are hash values
			if (isCorrect)
			{
				//if the passwords match then yay we add the user to the session and then implant a cookie
				addSession(req.body.username);
				res.cookie("login", {username: req.body.username}, {maxAge: 600000}); //set for 10 minutes
				res.end('GRANTED'); // we send granted back to the client
			}
			else res.end('Login failed: passwords do not match');
		
		}
	});
});


// make new user with post user and pass in body pass should be hashed
app.post('/account/create/user',(req, res) =>
{

	//to make a user we need to see its already take so first we search
	UserModel.find({userName: req.body.username})
	.exec((err, results) =>
	{
			//if we find nothing then it means we can create a new account with that name
			if (results.length > 0)
			{
				//if we find a user with that name then return this
				res.send('Username already taken!');
			}
			else
			{

				var salt = Math.floor(Math.random()* 99999999999999);
				var hash = getHash(req.body.password, salt); //this will get a new hash from the entered password and new generated salt

					//create the new object out of the db schema and then save it
				var nu = UserModel({
						userName: req.body.username,
						userSalt: salt,				
						userHash: hash,

				}); //the user saves the salt and hash




				nu.save(function (err) { if (err) console.log('FAIL user not added'); });
				console.log("New user saved!");
				res.send('New User Added!');	

			}
	});

});




//////////////////   /app/     requests



//this gets everysingle book made by all authors
app.get('/get/cookbooks', (req, res) => {

	CookBookModel.find({}).exec( (error, results) => {
		if (error) { return res.end('ERROR'); }
		
		res.send(JSON.stringify(results));
	});

});



//make new cook book with title and username
app.post('/app/cookbook/post', (req, res) => {
	var newCookbook = new CookBookModel({
		cookBookTitle: req.body.cookBookTitle, 
		
		author: req.body.author,

		categories: ["Appetizers", "Soups & Salads", "Breads", "Eggs", "Vegetable", "Pasta", "Breakfast", "Meat", "Seafood", "Sauces", "Beverages", "Desserts"],
	
	});
	newCookbook.save( (error) => {
		if (error) res.end('PROBLEM: ' + res.status);
		//after we save the cookbook into existance we need to then save the book to the user by id i suppose

		UserModel.find({UserName: req.body.author}).exec((err, results) =>
		{
			//so we get the author and lets save this new book to it
			results[0].myCookBooks.push(newCookbook._id);
			results[0].save();
			retStr = "CREATED :"+newCookbook._id;
			res.end(''+newCookbook._id);
		});
	});
});

//this method will be called when saving changes to a book from the post page
app.post('/app/cookbook/edit/', (req,res)=>
{
	console.log('saving changes to cookbook');
	CookBookModel.find({_id: req.body.cbID}).exec((err,results)=>
	{
		results[0].cookBookTitle = req.body.cBTitle,
		results[0].publicAccess = req.body.publicAccess,
		//the fam gets saved in its own request
		results[0].save();
		res.send('CookBook Updated!');
	});


});


app.get('/app/cookbook/get/:CBID',(req,res)=>
{
	CookBookModel.find({_id: req.params.CBID}).exec((err, results)=>
	{
		if (err)  {return res.end('ERROR');}

		res.send(results[0]._id);
		
	});
});


//this gets one book by its id to edit it
app.get('/app/edit/cookbook/get/:CBID', (req, res) => 
{
	console.log('Looking for ' +  req.params.CBID);
	CookBookModel.find({_id: req.params.CBID})
	.exec( (error, results) => {
		if (error) { return res.end('ERROR'); }
		var resultString = '';
		//this will send a JSON object to the client
		console.log('Got book to edit! ' + results[0]);
		res.end(JSON.stringify(results[0]));
	});
});



//this gets all books by author and those the user is in the family lists of
app.get('/app/cookbook/get/all/:AUTHOR', (req, res) => 
{
	var	cbCollection = '';

	console.log("Getting cookbooks for " +req.params.AUTHOR)
	CookBookModel.find({author: req.params.AUTHOR})
	.exec( (error, myResults) => {
		if (error) { return res.end('ERROR'); }
		

		res.end(JSON.stringify(myResults));
		
		//this will send a JSON object to the client
	});
});


app.get('/app/cookbook/get/family/:USERNAME', (req, res)=>
{
	var	cbCollection = [];
	//this finds a cb with family list containing the user name
	CookBookModel.find({family: {$in: [req.params.USERNAME]}})
		.exec( (error, famResults) => {
		if (error) { return res.end('ERROR'); }
			//this returns the resulting books
			res.send(JSON.stringify(famResults));
		});
});





//this will get all recipes in a book ID is in the req.body.cookbookID
app.get('/app/get/cookbook/recipes/:CBID', (req,res)=>
{
	console.log('getting recipes for a book '+req.params.CBID);

	CookBookModel.findOne({_id: req.params.CBID}).populate('recipes').exec((err, cb) => 
	{
		if (err) return console.log(err);
		console.log("Cookbook populated " + cb.recipes);

		res.end(JSON.stringify(cb.recipes));
	});



});


app.get('/app/delete/cookbook/:AUTH/:CBNAME', (req,res)=>
{
	CookBookModel.deleteOne({cookBookTitle: req.params.CBNAME, author: req.params.AUTH}).then(()=>
	{
		console.log('deleted CookBook');
		res.end('CookBook deleted!')
	}).catch(function(error){
    console.log(error); // Failure
    res.end(error);
  });
});




//  ggggggggggggggggggg          grocery


app.post('/app/grocery/post/:USERNAME/:ITEM', (req, res) => {
	var newGrocery = new groceryModel({userName: req.params.USERNAME, grocery: req.params.ITEM});
	newGrocery.save( (error) => {
        if (error) res.end('PROBLEM: ' + res.status);
        res.end('SAVED');
    });
});

app.get('/app/grocery/get', (req, res) => {
	groceryModel.find({userName: req.cookies.login.username})
	.exec( (error, results) => {
		if (error) { return res.end('ERROR'); }
		var resultString = '';
		console.log(results);
		for (i in results) {
			r = results[i];
			resultString += '<b id="output">' + r.userName + ': </b>' + r.grocery + '<br>';
		}
		res.end(resultString);
	});
});



app.get('/app/grocery/delete/all', (req,res)=>
{
	groceryModel.deleteMany({},(err)=>{if (err) return handleError(err)}); 
})






// 	ffffffffffffffffff				FRIENDS!f fffffffffffffff

//add user to friendlist this will take the username and will search if user exists then it will add user to the user's friendlist
app.get('/app/friends/add/:USERNAME',(req, res) =>
{
	UserModel.find({userName: req.params.USERNAME})
	.exec(function (err, results)
		{
			if (err) return handleError(err);
			console.log(results);
			if(results[0])
			{ 
				console.log("User found! Adding to friends");
				
				//if we found the user then we need to find the current user's account and add the friend to their friend list
				UserModel.find({userName: req.cookies.login.username,})
				.exec(function (err, myResult)
				{
				//then after we find our account get the accounts friend list then add it to the friend list
					myResult[0].myFriends.push(req.params.USERNAME);

					myResult[0].save();
					res.send('Friend saved!')
				});
			}
			else
			{
				res.send('USER: '+ req.params.USERNAME +' doesnt exist');
			}
		});
});


app.get('/app/friends/get',(req,res)=>
{
	UserModel.find({userName: req.cookies.login.username})
		.exec(function (err, results)
			{
				if (err) return handleError(err);

				if(results)
				{ 
					var resultString = '';
					for (i in results[0].myFriends)
					{
						r = results[0].myFriends[i];
						resultString += '<b id="output">' + r + '</b> <br>';
					}
					res.end(resultString);
					
				}
				else
				{
					res.send('USER: '+ req.params.USERNAME +' doesnt exist');
				}
			});
});



//so for this we need to get the cookbook object to add to its fam and friendslist
app.get('/app/edit/cookbook/family/add/:CBID/:NEWFAM',(req, res) =>
{
	//this checks to see if the username is a valid user
	UserModel.find({userName: req.params.NEWFAM})
	.exec(function (err, results)
		{
			if (err) return handleError(err);

			if(results)
			{ 
				console.log("User found! Adding to family");
				
				//if we found the user then we need to find the current user's account and add the friend to their friend list
				CookBookModel.find({_id: req.params.CBID})
				.exec(function (err, myResult)
				{
				//then after we find our account get the accounts friend list then add it to the friend list
					myResult[0].family.push(req.params.NEWFAM);

					myResult[0].save();
					res.send('User saved!')
				});
			}
			else
			{
				res.send('USER: '+ req.params.NEWFAM +' doesnt exist');
			}
		});
});

app.get('/app/edit/cookbook/family/get/:CBID', (req, res)=>
{
		CookBookModel.find({_id: req.params.CBID})
				.exec(function (err, myResult)
				{
				//then after we find our account get the accounts friend list then add it to the friend list
					
					res.send(myResult[0].family); //this sends teh list of family on the book
				});
});


app.get('/app/edit/cookbook/friends/add/:CBID/:NEWFRIEND',(req, res) =>
{
	UserModel.find({userName: req.params.NEWFRIEND})
	.exec(function (err, results)
		{
			if (err) return handleError(err);

			if(results)
			{ 
				console.log("Book found! Adding to friends");
				
				//if we found the user then we need to find the current user's account and add the friend to their friend list
				CookBookModel.find({_id: req.params.CBID})
				.exec(function (err, myResult)
				{
				//then after we find our account get the accounts friend list then add it to the friend list
					myResult[0].friends.push(req.params.NEWFRIEND);

					myResult[0].save();
					res.send('Friend saved!')
				});
			}
			else
			{
				res.send('USER: '+ req.params.NEWFRIEND +' doesnt exist');
			}
		});
});







app.get('/get/recipes', (req,res)=>
{
	RecipeModel.find({}).exec((err, results)=>
	{
		res.send(results);
	});
});


app.get('/app/get/recipes/global', (req,res)=>
{
	RecipeModel.find({}).exec((err, results)=>
	{
		res.send(JSON.stringify(results));
	});
});



//this gets all the recipes made by this id
app.get('/app/get/recipes/all/:USERNAME', (req,res) =>
{


	RecipeModel.find({origAuthor:  req.params.USERNAME}).exec((err,myRecs)=>
		{
			if (err) console.log(err);
			console.log(myRecs);

			res.send(JSON.stringify(myRecs));

		});

});






//this will create a new recipe basically it will save the book it will be called by the home js
app.post('/app/recipe/create', (req,res) =>
{
	var newRecipe = new RecipeModel(
	{
		recipeTitle: req.body.recName,
		origAuthor: req.body.author,
		listOfBooks: [req.body.bookID]

	});

	newRecipe.save((error) => {
		if (error) res.end('PROBLEM: ' + res.status);
		//after we save the cookbook into existance we need to then save the book to the user by id i suppose

		CookBookModel.find({_id: req.body.bookID}).exec((err, book)=>
		{
			if (err) res.end('PROBLEM: ' + res.status);
			//then we save the recipe to the book
			book[0].recipes.push(newRecipe._id);
			book[0].save();
			UserModel.find({UserName: req.body.author}).exec((err, results) =>
			{
				//so we get the author and lets save this new book to it
				results[0].myAuthoredRecipies.push(newRecipe._id);
				results[0].save();
				retStr = "CREATED :"+newRecipe._id;
				res.end(''+newRecipe._id);
			});

		});
	});

});


//this is the edit save request
app.post('/app/recipe/edit', (req,res) =>
{

	RecipeModel.find({_id: req.body.recID}).exec((error, results)=>
	{
		
			results[0].recipeTitle= req.body.recipeName;

			results[0].category= req.body.category;

			//when a user creates a new recipe they will be the original author
			results[0].origAuthor= req.body.author;
			
			//this can be one long string
			results[0].instructions= req.body.instructs;
			//this is more specifically an array of strings
			results[0].ingredients= req.body.ingred;

			results[0].difficulty= req.body.difficulty;

			//how long it takes in minutes
			results[0].timeToMake= req.body.cookTime;
		

		results[0].save((error) => 
		{
			if (error) res.end('ERROR');

			res.send('Recipe saved!');
		});
	});
});


//this will take a recipe and add it to a book
app.get('/app/copy/recipe/:RECID/:CBNAME/:AUTH', (req,res) =>
{
	console.log('copying recipe to a new book');
	CookBookModel.find({cookBookTitle: req.params.CBNAME, author: req.params.AUTH}).exec((error, results)=>
	{
		if (error) { return res.end('ERROR: with copying recipe'); }
		results[0].recipes.push(req.params.RECID);
		console.log(results[0].recipes);
		results[0].save((error)=> {res.end('SUCCESS: Recipe Copied'); })

		


	});
});


//this gets the the recipe to edit 
app.get('/app/edit/recipe/load/:RECID', (req,res) =>
{
	console.log('loading recipe ' +req.params.RECID);
	RecipeModel.find({_id : req.params.RECID}).exec((error, results)=>
	{
		if (error) { return res.end('ERROR'); }
		res.send(JSON.stringify(results));

	});
});


app.get('/app/delete/recipe/:RECID', (req,res)=>
{
	console.log('Deleting a recipe '+ req.params.RECID)
	RecipeModel.deleteOne({_id : req.params.RECID}).then(()=>
	{
		console.log('Recipe deleted!');
		res.send('Recipe deleted!');

	}).catch((err)=>{
		
		res.end('Error when deleting recipe!');

	});
});













// ccccccc              CHATccccccccccccc

app.get('/app/chat/get', (req, res) => {
	chatModel.find({})
	.exec( (error, results) => {
		if (error) { return res.end('ERROR'); }
		var resultString = '';
		for (i in results) {
			r = results[i];
			resultString += '<b id="output">' + r.userName + ': </b>' + r.message + '<br>';
		}
		res.end(resultString);
	});
});

app.post('/app/chat/post/:USERNAME/:MESSAGE', (req, res) => {
	var newMessage = new chatModel({userName: req.params.USERNAME, message: req.params.MESSAGE});
	newMessage.save( (error) => {
        if (error) res.end('PROBLEM: ' + res.status);
        res.end('SAVED');
    });
});

app.get('/clear', (req, res) => {
    db.dropDatabase();
});







//this will search for recipe either only authored by the user or anyones
app.get('/app/search/MINE/:KEYWORD',(req,res)=>{
	recToRet = [];
	RecipeModel.find({origAuthor:  req.params.USERNAME}).exec((err,myRecs)=>
		{
			if (err) console.log(err);
			for (rec in myRecs)
			{
				//we get all the recipes by the user then lets search them
				if (myRecs[rec].recipeTitle.includes(req.params.KEYWORD) || myRecs[rec].ingredients.includes(req.params.KEYWORD) || myRecs[rec].category.includes(req.params.KEYWORD))
				{
					recToRet.push(myRecs[rec]);
				}
			}
				res.send(JSON.stringify(myRecs));
			
		});
});



//this will seach for any recipe in any book
app.get('/app/search/ANY/:KEYWORD',(req,res)=>{
	RecipeModel.find({})
	.exec( (error, allRecipes) => 
	{
    
    if (error) res.end('PROBLEM: ' + res.status);
     var recToRet = [];
		for (rec in allRecipes)
		{
			if (allRecipes[rec].recipeTitle.includes(req.params.KEYWORD) || allRecipes[rec].ingredients.includes(req.params.KEYWORD) || allRecipes[rec].category.includes(req.params.KEYWORD))
			{
				recToRet.push(allRecipes[rec])
			}
		}
		res.send(JSON.stringify(recToRet))
	});
});


// rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr END OF REQUESTS
