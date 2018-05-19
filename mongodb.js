var mongoose = require("mongoose"); 
var emaile = require("./nodeEmail");

var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/block');
mongoose.connection.on("connected",function(){
	console.log("链接数据库成功");
})
mongoose.connection.on("error",function(err){
	console.log("链接数据库失败");
	emaile.sendMail({
	    from: config.email.user,
	    to: config.email.receive,
	    subject: "数据库错误报告",
	    text: err
	}, function (error, response) {
	    if (error) {
	        console.log(error);
	    }else{
	    	console.log('发送成功')
	    }
	});
})
mongoose.connection.on("disconnected",function(err){
	console.log("distake");
})
var DB = new Object();
var block = new Schema({
	"blockNumber": {type: Number,unique: true},
	"transactions": {type: Array},
	"queryStatus": {type: Number},
	"date": { type: Date, default: Date.now }
});
var txid = new Schema({
	"blockNumber": {type: Number},
	"txid": {type: String,unique: true},
	"transaction": {type: Object},
	"date": { type: Date, default: Date.now }
});
DB.block = mongoose.model("blockNumber", block);
DB.txid = mongoose.model("txid", txid);

module.exports = DB;
