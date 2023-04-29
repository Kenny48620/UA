/*
	Author:Kaichun Lee
	Course:CSC337
	Description:
	A js file using ajax and jquery to do login and create account opperation

*/


/*
	process login
*/
function login(){
	console.log('Loc: login()');
	var u = $('#username').val();
	var p = $('#password').val();

	$.ajax({
		url:'/login/' + u + '/' + p,
		method:'GET',
		success:function(result){
			console.log('result');
			console.log(result);
			if (result == 'LOGIN'){
				window.location = '/home.html';
			}
		}
	})
}


/*
	create an account
*/
function createAccount(){
	console.log('Loc: createAccount()');

	// get element by id
	var u    = $('#newUser').val();
	var p    = $('#newPass').val();

	var user = {username:u, password:p, listings:[], purchases:[]};
	var str  = JSON.stringify(user);
	console.log(str);
	$.ajax({
		url:'/add/user/',
		data:{user:str},
		method:'POST',
		success:function(result){
			alert('Create an account successfully!');
		}

	}) 

}