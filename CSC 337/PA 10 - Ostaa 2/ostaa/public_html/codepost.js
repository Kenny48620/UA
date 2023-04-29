/*
	Author:Kaichun Lee
	Course:CSC337
	Description:
	a html page that the user can create an item

*/


/*
	add a post to the user
*/
function createPost(){
	console.log('Loc: createPost()');

	var t = $('#title').val();
	var d = $('#desc').val();
	var i = $('#image').val();
	var p = $('#price').val();
	var s = $('#status').val();

	var u = localStorage.getItem('username');
	

	var item = {title:t, description:d, image:i, price:p, stat:s};
	var itemData  = JSON.stringify(item);


	$.ajax({
		url:'add/item/'+u,
		data:{item:itemData},
		method:'POST',
		success:function(result){
			
			console.log(result);
			if(result.redirect){
				window.location.href = result.redirectUrl;
			}
		}
	})
}