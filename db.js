var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chat', function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Connected to mongodb!');
	}
});

var signSchema = mongoose.Schema({
	user: String,
	passwd: String,
	created: {type: Date, default: Date.now}
});

var chatSchema = mongoose.Schema({
	msg: String, 
	user: String, 
	img: String,
	created: {type: Date, default: Date.now}
});

var Chat = mongoose.model('Message', chatSchema);

var SignUp = mongoose.model('User', signSchema);

exports.login = function(data, cb){
	var query = SignUp.findOne(data);
	query.exec(function(err, docs){
		cb(err, docs);
	});
}

exports.signUpNew = function(data, cb){
	var newUser = new SignUp({user: data.user, passwd: data.passwd});
	newUser.save(function(err){
		cb(err);
	});
}

exports.getOldMsgs = function(limit, cb){
	var query = Chat.find({});
	query.sort('-created').limit(limit).exec(function(err, docs){
		cb(err, docs);
	});
}

exports.saveMsg = function(data, cb){
	var newMsg = new Chat({msg: data.msg, user: data.user, img: data.img});
	newMsg.save(function(err){
		cb(err);
	});
};
