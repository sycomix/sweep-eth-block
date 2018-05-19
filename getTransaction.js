/*
* @Author: Mr.Sofar
* @Date:   2018-05-17 16:49:23
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-19 18:22:55
* 1、检索当前数据库是否存在数据
* 		true: 检索最大值
* 	 	false: 直接开始检索
* 2、发起请求，获取当前区块高度的对应 transactions，保存到数据库中，保存成功后进行下一个区块高度检索
*/
var axios = require("axios");
var config = require('./config');
var fun = require('./fun');
var DB = require('./mongodb');

//请求json数据模版
var reqBlockData = {"jsonrpc":"2.0","id":12,"method":"eth_getBlockByNumber","params":["",false]}
var currentBlockNumber = 4788006;

function getTransactionTxid (){
	// 当前区块高度转化成十六进制
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
				block.queryStatus = 0;

				// 保存数据到数据库
				block.save((err,data1) => {
					if(err){
						if(err.code === 11000){
							//code：11000 当前blockNumber 重复，currentBlockNumber + 1,进入下区块操作
							currentBlockNumber ++;
						}
						console.log(err);
					}else{
						currentBlockNumber ++;
					}
					// 依据当前 currentBlockNumber 进行下一步操作
					setTimeout(getTransactionTxid,100);
				})
			} else {
				// 返回result 为不合法，进入10秒等待，重新发起请求
				setTimeout(getTransactionTxid,10000);
			}
		})
		.catch(err => {
			setTimeout(getTransactionTxid,10000);
		})
}

/**
 * [获取当前blockNmumber最大值]
 */
function getBDMaxBlockNumber(){
	// 查看当前是否有数据
	// 		有数据: 获取最大值，从最大值开始查询数据
	// 		无数据: 使用默认的数据创建数据
	DB.block.find({},(err,data)=>{
		if(err){
			console.log(err);
			// 10秒后重新查询数据
			setTimeout(getBDMaxBlockNumber,10000);
		} else {
			if(data.length>0){
				// 有数据，使用最大值
				DB.block.aggregate([{"$group":{"_id":{},"blockNumber":{"$max":"$blockNumber"}}}])
					.then(data1 => {
						currentBlockNumber = data1[0].blockNumber
						console.log("从区块高度 " + currentBlockNumber + " 开始检索");
						getTransactionTxid();
					})
			} else {
				// 无数据，直接使用默认值开始
				getTransactionTxid();
			}
		}
	})
}
getBDMaxBlockNumber();



