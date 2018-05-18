/*
* @Author: Mr.Sofar
* @Date:   2018-05-17 19:36:47
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-18 11:26:25
*/
var axios = require("axios");
var config = require('./config');
var fun = require('./fun');
var DB = require('./mongodb');
var currentBlockNumber;
var reqTransactionData = {"jsonrpc":"2.0","id":12,"method":"eth_getTransactionByHash","params":[""]};

function queryUGCTxid(){
	console.log("============================");
	console.log("=         " + currentBlockNumber + "          =");
	console.log("============================");

	DB.block.find({"blockNumber": currentBlockNumber})
		.then(data => {
			data[0].transactions.forEach((v,i) => {
				setTimeout(function(){
					let txidObj = JSON.parse(JSON.stringify(reqTransactionData));
						txidObj.params[0] = v;
						axios.post(config.env.infura,txidObj)
							.then(data1 => {
								
								let toAddr = data1.data.result.to;
								if(toAddr === "0xf485c5e679238f9304d986bb2fc28fe3379200e5"){
									let txid = new DB.txid();
									txid.blockNumber = +data1.data.result.blockNumber;
									txid.txid = v;
									txid.transaction = data1.data.result;
									txid.save((err,data2) => {
										if(err){
											console.log(err);
										} else {
											console.log(data2);
										}
									});
								}
								if(data[0].transactions.length-1 === i){
									currentBlockNumber ++;
									setTimeout(queryUGCTxid,3000);
								}
							})
							.catch(err => {
								console.log(err);
							})
				},100*i)
				
			})
		})
}


function getEndBlockNumber(collect){
	DB[collect].find({},(err,data)=>{
		if(err){
			console.log(err);
		} else {
			console.log(data);
			if(data.length>0){
				console.log("有数据");
				DB[collect]
					.find({})
					.sort({'blockNumber':-1})
					.limit(1).
					exec((err,data1) => {
						if(err){
							console.log(err);
						} else {
							currentBlockNumber = data1[0].blockNumber;
							console.log("从区块高度 " + currentBlockNumber + " 开始检索");
							queryUGCTxid();
						}
					})
			} else {
				DB.block.aggregate([{"$group":{"_id":{},"blockNumber":{"$min":"$blockNumber"}}}])
					.then(data1 => {
						currentBlockNumber = data1[0].blockNumber
						console.log("从区块高度 " + currentBlockNumber + " 开始检索");
						queryUGCTxid();
					})
					.catch(err => {
						console.log(err);
					})
			}
		}
	})
}
getEndBlockNumber("txid");