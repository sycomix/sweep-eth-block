var mongoose = require("mongoose"); 
var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/block');
mongoose.connection.on("connected",function(){
	console.log("链接数据库成功");
})
mongoose.connection.on("error",function(err){
	console.log(err);
	console.log("链接数据库失败");
})
mongoose.connection.on("disconnected",function(){
	console.log("distake");
})
var DB = new Object();
var block = new Schema({
	"blockNumber": {type: Number,unique: true},
	"transactions": {type: Array},
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
