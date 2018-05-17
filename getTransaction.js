/*
* @Author: Mr.Sofar
* @Date:   2018-05-17 16:49:23
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-17 21:03:31
* 1、检索当前数据库是否存在数据
* 		true: 检索最大值
* 	 	false: 直接开始检索
* 2、发起请求，获取当前区块高度的对应 transactions，保存到数据库中，保存成功后进行下一个区块高度检索
*/
var axios = require("axios");
var config = require('./config');
var fun = require('./fun');
var DB = require('./mongodb');

var reqBlockData = {"jsonrpc":"2.0","id":12,"method":"eth_getBlockByNumber","params":["",false]}
// var currentBlockNumber = 4788006;
var currentBlockNumber = 4806203;

function getTransactionTxid (){
	let hexadecimal = fun.getHexadecimal(currentBlockNumber);
	reqBlockData.params[0] = hexadecimal;
	axios.post(config.env.infura,reqBlockData)
		.then(data => {
			let result = data.data.result;
			console.log("当前块：" + currentBlockNumber);
			if(result){
				let block = new DB.block();
				block.blockNumber = currentBlockNumber;
				block.transactions = data.data.result.transactions;
				block.save((err,data1) => {
					if(err){
						if(err.code === 11000){
							// blockNumber重复，当前blockNumber +1 进行下一个块查询
							currentBlockNumber ++;
						}
						console.log(err);
					}else{
						// console.log(data1);
						currentBlockNumber ++;
					}
					setTimeout(getTransactionTxid,100);
				})
			}
		})
		.catch(err => {
			console.log(err);
			setTimeout(getTransactionTxid,100);
		})
}
function getBDMaxBlockNumber(){
	DB.block.find({},(err,data)=>{
		if(err){
			console.log(err);
		} else {
			if(data.length>0){
				DB.block.aggregate([{"$group":{"_id":{},"blockNumber":{"$max":"$blockNumber"}}}])
					.then(data1 => {
						currentBlockNumber = data1[0].blockNumber+1
						console.log("从区块高度 " + currentBlockNumber + " 开始检索");
						getTransactionTxid();
					})
			} else {
				console.log("暂无数据，直接开始");
				getTransactionTxid();
			}
		}
	})
}
getBDMaxBlockNumber();



