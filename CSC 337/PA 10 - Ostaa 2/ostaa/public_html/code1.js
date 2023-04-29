/*
	Author: Kaichun Lee
	Course: CSC337
	Description: to process some basic functionality

*/

/*
	display welcome sentence
*/
$(function(){

	$('#welcome').text("Welcome "+localStorage.getItem("username")+" what do you want?") ;
});

/*
	change the page to post.html
*/
function createList(){
	location.replace('post.html')

}

/*
	show the content of the right part 
*/
function show(data){
	console.log('Loc: show(data)');
	console.log(data);
	let itemList = JSON.parse(data);
	console.log(itemList);
	let newStr = "";
	let buttonStr1 = "<button type='button' onclick='addPurchase(";
	let buttonStr2 = ");'>Buy it</button>";
	let textBox1 = "<textarea  rows='4' cols='40' readonly>";
	let textBox2 = "</textarea>";
	var length = itemList.length;
	for (var i = 0; i < length; i++){
		let t = itemList[i].title;
		let d = itemList[i].description;
		let image = itemList[i].image;
		let p = itemList[i].price;
		let s = itemList[i].stat;
		let id ="\""+itemList[i]._id.toString()+"\"";
		console.log(typeof(id));
		if(s=="SOLD"){
			newStr += "<div class='item'>"+"<h3>"+t+"</h3>"+d+"<br><br>"+textBox1+image+textBox2+"<br><br>"+p+"<br><br>"+s+"<br><br>"+"</div>";
		}else{
			newStr += "<div class='item'>"+"<h3>"+t+"</h3>"+d+"<br><br>"+textBox1+image+textBox2+"<br><br>"+p+"<br><br>"+s+"<br><br>"+buttonStr1+id+buttonStr2+"</div>";
		}
	}
	return newStr;
}

/*
	add purchase
*/
function addPurchase(id){
	var i = id;
	$.ajax({
		url:'/purchase/'+localStorage.getItem('username')+'/'+i,
		method:'GET',
		success:function(result){
			console.log('addPurchase works fine');
		}
	});

}
/*
	search 
*/
function search(){
	console.log('Loc: search()');
	var l = $('#searchBar').val();
	console.log(l);
	
	$.ajax({
		url:'/search/items/'+l,
		method:'GET',
		success:function(result){
			document.getElementById('rightPart').innerHTML = show(result);
		}
	})
}
/*
	show the list of items
*/
function getList(){
	console.log('Loc: getList()');
	let u = localStorage.getItem('username');
	console.log('name='+u);
	$.ajax({
		url:'/get/listings/'+ u,
		method:'GET',
		success:function(res){
			$('#rightPart').html(show(res));
		}
	})

}
/*
	get purchases listings from server
*/
function getPurchases(){
	let u = localStorage.getItem('username');
	$.ajax({
		url: '/get/purchases/' + u,
		method: 'GET',
		success:function(result){
			$("#rightPart").html(show(result));
		}
	});
}

