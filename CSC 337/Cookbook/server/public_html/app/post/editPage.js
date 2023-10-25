
var cbCategories = ["Appetizer", "Soups & Salads", "Breads", "Eggs", "Vegetable", "Pasta", "Breakfast", "Meat", "Seafood", "Sauces", "Beverages", "Desserts"];


//this function will return the user to the home page without saving changes
function returnToHome()
{

    window.location.href = '/app/home.html';
}


//This function will save edits on a recipe or cookbook
function saveChanges()
{

}


//this function will instead build the menu so i dont have to
function getDropDownMenu()
{
    console.log("Getting menu items");

    //it will need to loop thru the list of categories and make a tag for each option

    

    //once we have that element we can append html to it
    let html = "";

    //we need to now loop the categories
    for (c in cbCategories)
    {
        //console.log(cbCategories[c]);
        $('.dropdown-content').append(`<a href="#" onclick="setCategoryTo('`+cbCategories[c]+`');">` +cbCategories[c]+ `</a>`);
    }


    console.log($('.dropdown-content').innerHTML);

}


function setCategoryTo(categoryIn)
{

    console.log("selected category: "+categoryIn);

    $('#categorySelection').text(categoryIn);

}




//this function will be called on the edit page to save the changes on the page namely public access, fam and friends lists
function saveCookBookUpdates()
{

    var title = $('#cbNameBar').val(); //get the title from the input line

    var access = $('input[name="access"]:checked').val();//the access value
    //the fam and friends will be allready saved based on how they are implented

     $.ajax({
        url: '/app/cookbook/edit/',
        method: 'POST',
        data: {
            cbID : localStorage.getItem('Selected'),
            cBTitle: title,
            publicAccess: access,
            author: auth
        },
        success: (data) => 
        {

            alert(data);
            window.location.href = '/app/home.html';
            
            
        }
    });
}



//this function will get a cookbook by its user author and name
function getSelectedCookBook()
{
    cbID = localStorage.getItem('Selected');
    auth = localStorage.getItem('Username');
    console.log('Looking for '+cbID);

     $.ajax({
        url: '/app/edit/cookbook/get/'+cbID,
        method: 'GET', 
        success: (data) => {
            //on success we should get the cookbook object itself and we can put it in here
            //this data is the cookbook obj
            
            cbObj = JSON.parse(data);
            console.log(cbObj);
            $('#cbNameBar').val(cbObj.cookBookTitle);

            $('#authorNameBar').val(cbObj.author);

            getBookFamList();
            //we need to get the user's friends from the server.....
            
        }
    });
}

//this method will make arequest to get the user's friends to add to the cb lists
function getMyFriendsList()
{   
    friendListOutput = $('#myFriendListOutput');

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

//these methods will be called on the button click
function addFriendToFamilyList()
{
    var newFam = $('#addFamBar').val();
    console.log(newFam);
    var cbID = localStorage.getItem('Selected');
     $.ajax({
        url: `/app/edit/cookbook/family/add/`+cbID+`/`+newFam,
        method: 'GET',
        success: (data) => {
            $('#addFamBar').val(data);
            
        }
    });
}

function getBookFamList()
{
    $.ajax({
        url: `/app/edit/cookbook/family/get/`+cbID,
        method: 'GET',
        success: (data) => {
            $('#cbFamilyListOutput').html(data + `<br>`);
            
        }
    }); 
}


function addFriendToFriendList()
{
    var newFriend = $('#addFriendBar').val();
    var cbID = localStorage.getItem('Selected');

     $.ajax({
        url: `/app/edit/cookbook/friends/add/`+cbID+`/`+newFriend,
        method: 'GET',
        success: (data) => {
            getFriends();
            $('#addFriendBar').val(data);
            
        }
    });
}












function loadRecipeToEdit()
{
    recID = localStorage.getItem('Selected');
    console.log('getting recipe to edit' + recID);

    $.ajax({
        url: '/app/edit/recipe/load/'+recID,
        method: 'GET', 
        success: (data) => {
            //on success we should get the cookbook object itself and we can put it in here
            //this data is the cookbook obj
            
            recObj = JSON.parse(data);
            console.log(recObj[0]);

            $('#authNameBar').val(recObj[0].origAuthor);
            $('#recipeNameBar').val(recObj[0].recipeTitle);
            $('#categorySelection').text(recObj[0].category);
            $('#ingredArea').val(recObj[0].ingredients);
            $('#instructArea').val(recObj[0].instructions)
            $('#cookTimeBar').val(recObj[0].timeToMake);
            $('#diffBar').val(recObj[0].difficulty);
            
        }
    });
}




function saveRecipe()
{

    var recName = $('#recipeNameBar').val();
    var auth = $('#authNameBar').val();
    var cat = $('#categorySelection').text();
    var ingred = $('#ingredArea').val();
    var instr = $('#instructArea').val();
    var time = $('#cookTimeBar').val();
    var diff= $('#diffBar').val();


$.ajax({
        url: '/app/recipe/edit',
        method: 'POST',
        data: {
            recID: localStorage.getItem('Selected'),
            recipeName : recName,           
            author: auth,
            category: cat,
            ingred : ingred,
            instructs: instr,
            cookTime: time,
            difficulty: diff
        },
        success: (data) => 
        {

            if (data == 'ERROR')
               {
                alert('Error when saving your recipe');
                }
                else
                {
                    alert(data);
                    window.location.href = '/app/home.html';
                }

            
            
        }
    });


}
