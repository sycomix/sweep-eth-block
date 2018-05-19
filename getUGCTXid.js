/*
* @Author: Mr.Sofar
* @Date:   2018-05-17 19:36:47
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-19 18:47:27
*/
var axios = require("axios");
var config = require('./config');
var fun = require('./fun');
var DB = require('./mongodb');
var currentBlockNumber;
// 请求json数据模版
var reqTransactionData = {"jsonrpc":"2.0","id":12,"method":"eth_getTransactionByHash","params":[""]};

function queryUGCTxid(){
	console.log("============================");
	console.log("=         " + currentBlockNumber + "          =");
	console.log("============================");

	DB.block.find({"blockNumber": currentBlockNumber})
		.then(data => {
			let _count = data[0].transactions.length;
			let arr = data[0].transactions;
			let initIndex = 0;
			sendReqTxid();

			function sendReqTxid(){
				let txidObj = JSON.parse(JSON.stringify(reqTransactionData));
				txidObj.params[0] = arr[initIndex];
				axios.post(config.env.infura,txidObj)
					.then(data1 => {
						let toAddr = data1.data.result.to;
						if(toAddr === "0xf485c5e679238f9304d986bb2fc28fe3379200e5"){
							let txid = new DB.txid();
							txid.blockNumber = +data1.data.result.blockNumber;
							txid.txid = arr[initIndex];
							txid.transaction = data1.data.result;
							txid.save((err,data2) => {
								if(err){
									console.log(err);
									setTimeout(sendReqTxid,10000);
								} else {
									initIndex ++;
									if(initIndex < _count){
										setTimeout(sendReqTxid,0);
									}else{
										saveQueryStatus();
									}
								}
							})
						} else {
							initIndex ++;
							if(initIndex < _count){
								setTimeout(sendReqTxid,0);
							}else{
								saveQueryStatus();
							}
						}
					})
					.catch(err => {
						console.log(err);
						setTimeout(sendReqTxid,10000);
					})
			}
			

			// data[0].transactions.forEach((v,i) => {
			// 	setTimeout(function(){
			// 		let txidObj = JSON.parse(JSON.stringify(reqTransactionData));
			// 			txidObj.params[0] = v;
			// 			axios.post(config.env.infura,txidObj)
			// 				.then(data1 => {
								
			// 					let toAddr = data1.data.result.to;
			// 					if(toAddr === "0xf485c5e679238f9304d986bb2fc28fe3379200e5"){
			// 						let txid = new DB.txid();
			// 						txid.blockNumber = +data1.data.result.blockNumber;
			// 						txid.txid = v;
			// 						txid.transaction = data1.data.result;
			// 						txid.save((err,data2) => {
			// 							if(err){
			// 								console.log(err);
			// 							} else {
			// 								console.log(data2);
			// 							}
			// 						});
			// 					}
			// 					if(data[0].transactions.length-1 === i){
			// 						currentBlockNumber ++;
			// 						setTimeout(queryUGCTxid,3000);
			// 					}
			// 				})
			// 				.catch(err => {
			// 					console.log(err);
			// 				})
			// 	},100*i)
				
			// })
		})
}


// 查询block表 queryStatus为1且blockNumber最大值
function getEndBlockNumber(){
	DB.block.find({},(err,data)=>{
		if(err){
			setTimeout(getEndBlockNumber,10000);
		}else{
			if(data.length>0){
				// 有数据
				DB.block
					.find({"queryStatus": 1})
					.sort({'blockNumber':-1})
					.limit(1)
					.exec((err,data1) => {

						if(err){
							console.log(err);
							setTimeout(getEndBlockNumber,10000);
						} else {
							if(data1.length>0){

								// 存在queryStatus 为1的数据
								currentBlockNumber = data1[0].blockNumber + 1;
								console.log("从区块高度 " + currentBlockNumber + " 开始检索");
								queryUGCTxid();
							}else{
								// 不存在，就取第一个
								DB.block
								.find()
								.limit(1)
								.exec((err,data1) => {
									if(err){
										console.log(err);
										setTimeout(getEndBlockNumber,10000);
									}else{
										currentBlockNumber = data1[0].blockNumber;
										console.log("从区块高度 " + currentBlockNumber + " 开始检索");
										queryUGCTxid();
									}
								})
							}
							
						}
					})
			}else{
				// 无数据
				console.log(`
						NO data
						usage: pm2 restart getTransaction
					`)
			}
		}
	})
}
// 更新已查询的blockNumber
function saveQueryStatus(){
	DB.block.update({blockNumber: currentBlockNumber},{$set:{queryStatus: 1}},(err,data) => {
		if(err){
			console.log(err);
			setTimeout(saveQueryStatus,10000);
		}else{
			currentBlockNumber ++;
			setTimeout(queryUGCTxid,10000);
		}
	})
}
getEndBlockNumber();