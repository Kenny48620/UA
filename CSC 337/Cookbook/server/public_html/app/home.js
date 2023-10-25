

function welcomeUser() {
    username = localStorage.getItem('Username');
    $.ajax({
        url: '/app/home.html',
        method: 'GET',
        success: (data) => {
            $('#welcome-user').text(`Hello Chef ${username}!`)
        }
    });
}

function createNewCookbook() {
    username = localStorage.getItem('Username'); //get the author
    cookbook = $('#cookbookBar').val();           //get the title
    
    if (cookbook)
    {        
        console.log("Making a new book called "+cookbook+" by " + username)

        $.ajax({
            url: '/app/cookbook/post',
            method: 'POST',
            data: {
                cookBookTitle: cookbook,
                author: username
            },
            success: (data) => {
                //data will return as CREATED:_id
                localStorage.setItem('Selected', data); 
                window.location.href = './post/editCookBook.html'; //then go to the post page
                
            }

        });
    }
    else 
    {
        alert('Enter a name for the CookBook');
    }
}


//to delete then we will get the input name like when making it, we can search by name and author
function deleteACookbook()
{
    bookToDel = $('#cookbookBar').val();

    if(bookToDel)
    {

        console.log('ok going to delete this book ' +bookToDel);


        $.ajax({
            url: `/app/delete/cookbook/`+localStorage.getItem('Username')+'/'+bookToDel,
            method: 'GET',
            success: (data) => 
            {
                alert('Cookbook has been deleted!');
                RefreshPage();
            }
        });
    }
    else
    {
        alert('Enter the name of a CookBook to delete');
    }
}

function editACookBook(editBtn)
{
    //this will get a the button that will have the cookbook id

    var cbID = editBtn.value;
     $.ajax({
        url: `/app/cookbook/get/`+cbID,
        method: 'GET',
        success: (data) => 
        {
        localStorage.setItem('Selected', data);
        window.location.href = './post/editCookBook.html'; //then go to the post page
        }
    });
}

function loadCookBookToEdit()
{

}


//this function will get html of the cookbook object this also needs to get books the user is a friend or family of
function getAllMyCookbooks() 
{
    console.log('getting all my books')   
    $.ajax({
        url: `/app/cookbook/get/all/`+localStorage.getItem('Username'),
        method: 'GET',
        success: (data) => 
        {
            console.log(data);
            //this is getting a all the users books
            parsed = JSON.parse(data);

            //console.log(parsed);

            if (parsed)
            {
                for (book in parsed)
                {
                    //console.log(parsed[book]);

                    //here we can build the html
                    buildandDisplayCookBookHTML(parsed[book]);

                }
            }
            
        }
    });
}

function getAllFamCookbooks()
{

    $.ajax({
        url: `/app/cookbook/get/family/`+localStorage.getItem('Username'),
        method: 'GET',
        success: (data) => 
        {
            console.log(data);
            //this is getting a all the users books
            parsed = JSON.parse(data);

            console.log(parsed);

            if (parsed)
            {
                for (book in parsed)
                {
                    console.log(parsed[book]);

                    //here we add the book with us s fam to the cb list
                    buildandDisplayCookBookHTML(parsed[book]);

                }
            }
            
        }
    });
}

function flushCBOutput()
{

    cookbookOutput = $('#cookbookOutput').text('');
}

//this function will display one book at a time this should be called in a loop
function buildandDisplayCookBookHTML(cookbook)
{ 
    console.log(cookbook);
    if (cookbook._id)
    {
    var idstr = ""+cookbook._id;
    console.log(idstr);


    var htmlline = '<button name="cbID" class="myCBLink" onclick="getCookBooksRecipes(this)" value="'+idstr+'" >'+ cookbook.cookBookTitle + '</button> <br>';

    $('#cookbookOutput').append(htmlline);
    }
}


function flushOutputArea()
{
    $('#outputArea').html('');
}


/*This function will get the recipes from the db in the book called when the user clicks on the book in their list*/
function getCookBooksRecipes(cbID)//this is a button object
{
        //when this is called we are getting a new set of recipes so we must flush the output
        
        $('#outputArea').html(''); 


        var selectedID = cbID.value; //this is the books ID
        localStorage.setItem('Selected', selectedID);
        //then with hte id we can get the book and its recipes
        console.log("getting book's recipes " + selectedID);



        //request for recipes

        $.ajax({
            url: '/app/get/cookbook/recipes/'+selectedID,
            method: 'GET',
            success: (data) => {

                //we will save the string and parse when needed
                localStorage.setItem('SelectedRecipeCollection', data);

                console.log(data);
                //on success we should be getting back a list of recipes so we need to parse then display
                parsedRec = JSON.parse(data);


                //we will pass the name of the book to this div
                getNewRecipeDiv(cbID.textContent, cbID.value, parsedRec.length);

                //for each recipe we will send it to a method to build and display
                for(rec in parsedRec)
                {
                    buildandDisplayRecipeHTML(parsedRec[rec]);
                }

            }
        });

    

}




//this function will get an entire recipe object
function buildandDisplayRecipeHTML(recipe)
{
    outputElement = $('#outputArea'); 


    var div = `<div class='outputBlock'>` + `<h3 class="recOutTitle">`+ recipe.recipeTitle  +`</h3>`;
    div +=  `<h4>Created by: <span id='recAuth'>` + recipe.origAuthor + `</span></h4> <br>`;


    if (recipe.origAuthor == localStorage.getItem('Username'))
    {
        div +=`<button class='RecBtn' onclick='editRecipe(this)' value='`+''+recipe._id+`'>Edit</button>`;
        div +=`<button class='RecBtn' onclick='deleteRecipe(this)' value='`+''+recipe._id+`'>Remove</button>`;
    }
    div +=`<button class='RecBtn' onclick='copyRecipe(this)' value='`+''+recipe._id+`'>Copy</button>`;

    div += `<span class='RecIngredients'> <b>Ingredients: </b> <br>` + recipe.ingredients + ` </span>`;
    div += `<span class='RecInstructions'> <b>Instructions: </b><br>`+ recipe.instructions+` </span>`;


    div += `<span class='DiffOut'> Difficulty : ` +recipe.difficulty+ `</span>`;
    div += `<span class='CookTimeOut'> Time : ` + recipe.timeToMake + `</span>`;


    div += `</div> </div>`;

    outputElement.append(div);

}


function getNewRecipeDiv(bookName, bookID, numOfRecs)
{
    console.log("Creating the new recipe div " +bookName);

    outputElement = $('#outputArea'); 


    var div = `<div id='cookBookHead' class='outputBlock'> <h1 id='cookBookTitle'>`+ bookName + `</h1>`;

    div += `<div id='newRecipeCBDiv'>`

    div +=  `<div id="newRecTitle">Create a New Recipe! <div id='recCBName'> </div></div>`;

    div += `<input id="newRecipeNameBar" placeholder="Enter name to start"> `;
    div += `<br>`;
    //this div is where the user can make a new recipe only they can not make it out side of a cookbook
    div +=`<button class='RecBtn' id="newRecipeBtn" onclick='createNewRecipe()'>Make new recipe</button>`;

    div+= `</div>`;

    div += `<div id='cookBookStats'>`;
    //this subdiv will out put

    //author
    div +=`<div> Author  : ` + localStorage.getItem('Username');
    //num of recipes
    div +=`<div> Recipes: ` + numOfRecs + `<div>`;

    //num of family on this book

    div +=`<button id='gotoCBEditBtn' class='RecBtn' onclick='editACookBook(this);' value='`+bookID+`'>Edit Cookbook</button>`;
    div +=`</div>`;


    div += `</div>`;

    outputElement.append(div);
}







// CCCCCCCCCCCCCCCCCCCCCCCCCCC CHAT
function sendMessage() {
    username = localStorage.getItem('Username');
    message = $('#chatBar').val();
    $.ajax({
        url: '/app/chat/post/' + encodeURIComponent(username) + '/' + encodeURIComponent(message),
        method: 'POST',
        data: {
            userName: username,
            message: message
        },
        success: (data) => {
            $('#chatBar').val('');
        }
    });
}

function getMessage() {
    chatOutput = $('#chatOutput');
    $.ajax({
        url: `/app/chat/get`,
        method: 'GET',
        success: (data) => {
            chatOutput.html(data);
            chatOutput.scrollTop(chatOutput.scrollHeight);
        }
    });
}

setInterval(() => getMessage(), 1000);




function addGrocery() {
    username = localStorage.getItem('Username');
    item = $('#groceryBar').val();

    if (item)
    {
        $.ajax({
            url: '/app/grocery/post/' + encodeURIComponent(username) + '/' + encodeURIComponent(item),
            method: 'POST',
            data: {
                userName: username,
                grocery: item
            },
            success: (data) => {
                if (data == 'SAVED')
                {
                    $('#groceryBar').val('');
                }
            }
        });
    }
    else
    {

    }
}

function getGrocery() {
    groceryOutput = $('#groceryOutput');
    $.ajax({
        url: `/app/grocery/get`,
        method: 'GET',
        success: (data) => {

            groceryOutput.html(data);
            groceryOutput.scrollTop(groceryOutput.scrollHeight);
        }
    });
}

function deleteAllGrocery()
{
    console.log('Deleting grocery list');
    $.ajax({
        url:'/app/grocery/delete/all',
        method:'GET',
        success: (data)=>
        {
            console.log(data);
            alert('Grocery list cleared!');
            RefreshPage();
        }
    });

}



function addFriend()
{
    friendListOutput = $('#friendOutput');

    friendName = $('#friendsBar').val();

    $.ajax({
        url: `/app/friends/add/`+friendName,
        method: 'GET',
        success: (data) => {
            getFriends();
            $('#friendsBar').val(data);
            
        }
    });
}

function getFriends()
{

    friendListOutput = $('#friendOutput');

    $.ajax({
        url: `/app/friends/get/`,
        method: 'GET',
        success: (data) => {

            console.log(data);
            friendListOutput.html(data);
            friendListOutput.scrollTop(friendListOutput.scrollHeight);
        }
    });
}




function search()
{
    //lets clear out the output
    
    $('#outputArea').html(''); 

    //first lets get that key word
    let key = $('#searchInput').val();

    let searching = $("input[type='radio']:checked").val();

    if (key)
    {
        console.log("Searching for " + key + " in " + searching);

        $.ajax({
            url:'/app/search/' + searching +'/' + key,
            method: 'GET',
            success: (data) => {
        
                //we will need to check what we are getting back, user data, cookbook, or recipe,


                let searchResults = JSON.parse(data);

                let finalOutput = [];

                console.log(searchResults);
                
                for (i in searchResults)
                {
                    console.log(searchResults[i]);
                    buildandDisplayRecipeHTML(searchResults[i]);
                }

            }

        });
    }
    else
    {
        console.log('Error search field is empty');
        alert('Error! Search input is empty!');
    }
}




/*
    this function will need to display stuff
    there will be a variable of selected book,
*/
function updateDisplay()
{

}

setInterval(()=>updateDisplay(),1000)




///////////////// RECIPES


//this gets called when the user clicks teh create new recipe method
//it will do the same as the cookbook, get the new name, get the the book it belongs to makes it and then goes to the edit page.
function createNewRecipe()
{
    username = localStorage.getItem('Username');
    bookid = localStorage.getItem('Selected');

    recName = $('#newRecipeNameBar').val();

    if (recName)
    {
    console.log(username+'is making a new recipe!' + recName);
    $.ajax({
            url: '/app/recipe/create',
            method: 'POST',
            data: {
                recName: recName,
                author: username,
                bookID: bookid
            },
            success: (data) => {
                
                //alert(data);

                localStorage.setItem('Selected', data);
                window.location.href = './post/editRecipe.html'; //then go to the post page
                
            }

        });
    }
    else
    {
        alert('Enter a name to create a new recipe');
    }
}


function saveRecipeUpdates()
{
    username = localStorage.getItem('Username');
    bookid = localStorage.getItem('Selected');

    $.ajax({
            url: '/app/recipe/create',
            method: 'POST',
            data: {
                author: username,
                bookID: bookid
            },
            success: (data) => {
                
                alert(data);
                window.location.href = './post/editRecipe.html'; //then go to the post page
                
            }

        });
}

//this is called on a button press
function editRecipe(recipebtn)
{
    //this gets the id and then will save it to the local storage to get in the edit page
    var recipe = recipebtn.value;

    localStorage.setItem('Selected', recipe);

    goToRecipePage();
}


function goToRecipePage()
{
    window.location.href = './post/editRecipe.html';
}


//this operates a little different than the cookbook deleting, this will only take an id and then delete that way
function deleteRecipe(recID)
{
    //this is called by a button so will get handed the id no dom manipulation


    $.ajax({
        url: '/app/delete/recipe/'+recID.value,
            method: 'GET',            
            success: (data) => {
                
                alert(data);
                RefreshPage();
            }
    });

}



function RefreshPage()
{   
    document.location.reload();

}


function getAllGlobalRecipes()
{

    $('#outputArea').html(''); 
    $.ajax({
         url: '/app/get/recipes/global',
            method: 'GET',            
            success: (recipeLibrary) => {
                localStorage.setItem('SelectedRecipeCollection', recipeLibrary);

                var parsed = JSON.parse(recipeLibrary);
                console.log(parsed);
                //this is every recipe in the world.......... this can get laggy like in theory could get a few at a time i get it


                for (rec in parsed)
                {
                    buildandDisplayRecipeHTML(parsed[rec]);
                }
            }
    });


}




function getAllMyRecipes()
{
    $('#outputArea').html(''); 
    var user = localStorage.getItem('Username');
    console.log('getting my recipes ' + user)
     $.ajax({
         url: '/app/get/recipes/all/'+user,
            method: 'GET',            
            success: (recipeLibrary) => {
               

                localStorage.setItem('SelectedRecipeCollection', recipeLibrary);


                //console.log(recipeLibrary);
                //this is all the user's recipeps

                var parsed = JSON.parse(recipeLibrary);

                for (rec in parsed)
                {
                    buildandDisplayRecipeHTML(parsed[rec]);
                }
            }
    });
}

//this will be called by a button click and will pass the button to get hte value of the recipe to copy
function copyRecipe(copyBtn)
{
    var recid = copyBtn.value;
    var user = localStorage.getItem('Username');
    var book = prompt("Enter the name of the Cookbook you want to add this recipe to");
    //console.log('/app/copy/recipe/'+recid+'/'+book+'/'+user);
    if (book)
    {
        $.ajax({
             url: '/app/copy/recipe/'+recid+'/'+book+'/'+user,
                method: 'GET',            
                success: (data) => {
                    
                    alert(data);
                    //this is every recipe in the world.......... this can get laggy like in theory could get a few at a time i get it
                }
        });
    }
}


//this method is called by all the category buttons they pass in their btn object to get the value to display the corresponding recipes
function getRecipeByCategory(catBtn)
{

    var category = catBtn.value;

                
    var selectedRecCollection = JSON.parse(localStorage.getItem('SelectedRecipeCollection')); //this is set when we fetch a collection of recipes either when we get a cookbook, get all by user or all global ones


    $('#outputArea').html(''); 
    console.log(selectedRecCollection);
    for (rec in selectedRecCollection)
    {
        console.log(selectedRecCollection[rec]);

       if (category == 'ALL')
        {
             buildandDisplayRecipeHTML(selectedRecCollection[rec]);
        }
        else (selectedRecCollection[rec].category == category)
        {
            buildandDisplayRecipeHTML(selectedRecCollection[rec]);
        }
    }
        

}
