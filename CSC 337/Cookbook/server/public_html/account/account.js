/*
	CLIENT SIDE CODE

	This is the login methods
*/



// login
function login(){
	var username = $('#LoginUsernameInput').val();
	var password = $('#LoginPasswordInput').val();
	localStorage.setItem('Username', username);
	$.ajax({
		url:`/account/login/`,
		method:'POST',
		data: {
			username: username,
			password: password
		},
		success: (data) => {
			if (data == 'GRANTED') {
				window.location.href = '/app/home.html';
			}
			else {
				alert(data); //the data will be a message from the server as to why the login failed
			}
		}
	});	
}



//This function will send a request to add a user to the db
function createAccount()
{
	let username = $('#NewUserNameInput').val();
	let password = $('#NewUserPassInput').val();
	$.ajax({
		url: `/account/create/user`,
		method: 'POST',
		data: {
			'username': username,
			'password': password
		},
		success: (data) => {
			alert(data);
			//$('#creationMsg').text(data);
		}
	});
}

function clearDB() {
	$.ajax({
		url: '/clear',
		method: 'GET',
		success: (data) => {
			$('#body').html = '';
			alert('Database is empty.');
		}
	});
}
