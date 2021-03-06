// This file is required by app.js. It sets up event listeners
// for the two main URL endpoints of the application - /create and /chat/:id
// and listens for socket.io messages.

// Use the gravatar module, to turn email addresses into avatar images:

var gravatar = require('gravatar');
var db = require('./db');
var sha1 = require('sha1');



// Export a function, so that we can pass 
// the app and io instances from the app.js file:

module.exports = function(app,io){

	app.get('/', function(req, res){

		// Render views/home.html
		res.render('home');
	});


	app.post('/signup', function(req, res) {
		//var db = req.db;
		var toInsert = {};
		toInsert.user = req.body.signName;
		toInsert.passwd = sha1(req.body.signpw);
		console.log(toInsert);
		db.signUpNew(toInsert, function(err) {
			if(err) throw err;
			else res.redirect('/');
		});
		/*db.collection('users').insert(toInsert, function(err, result){
		if (err){
			throw err
		}  
		else {
			req.session.user_id = toInsert._id;
			res.redirect('');
		});*/
	});

	app.get('/create', function(req,res){

		// Generate unique id for the room
		//var id = Math.round((Math.random() * 1000000));

		// Redirect to the random room
		res.redirect('/chat');
	});

	app.get('/chat', function(req,res){
		// Render the chant.html view
		res.render('chat');
	});

	app.get('/chat', function(req,res){
		// Render the chant.html view
		req.session.user_id = items[0]._id;
	});

	// Initialize a new socket.io application, named 'chat'
	var chat = io.of('/socket').on('connection', function (socket) {
		
		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){
			//console.log(data);
			socket.emit('peopleinchat',{chat:true});
			/*if(chat.clients(data).length === 0 ) {
				
				console.log("first comes in\n"+chat.clients(data));
				socket.emit('peopleinchat', {number: 0});
			} else if(chat.clients(data).length === 1) {
				console.log("other people come in");
				socket.emit('peopleinchat', {
					number: 1,
					user: chat.clients(data)[0].username,
					avatar: chat.clients(data)[0].avatar,
					id: data
				});
			}
			else if(chat.clients(data).length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}*/
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {
			var toCheck = {};
			toCheck.user = data.user;
			toCheck.passwd = sha1(data.avatar);
			//console.log(toCheck);
			db.login(toCheck,function(err,docs){
				if(err || !docs) socket.emit('checkLogin', {login:false});
				else {
					/*db.getOldMsgs(3,function(err,docs){
						if(err) throw err
						else {
							docs.forEach(function(data){
								socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
							});
						}
					});*/
					socket.emit('checkLogin', {login:true});
					socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});
					socket.emit('img', socket.avatar);
				}
			});
			
			/*// Only two people per room are allowed
			if(chat.clients(data.id).length < 2){

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);


				// Add the client to the room
				socket.join(data.id);

				if(chat.clients(data.id).length == 2) {

					var usernames = [],
						avatars = [];

					usernames.push(chat.clients(data.id)[0].username);
					usernames.push(chat.clients(data.id)[1].username);

					avatars.push(chat.clients(data.id)[0].avatar);
					avatars.push(chat.clients(data.id)[1].avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}

			}
			else {
				socket.emit('tooMany', {boolean: true});
			}*/
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			db.saveMsg({msg: data.msg, user: data.user , img: data.img},function(err){
				if(err) throw err
			});
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
			
		});


		//store messages in mongodb, format (mess+username+chatroom+time)
		


	});
};
