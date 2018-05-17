/*
* @Author: Mr.Sofar
* @Date:   2018-05-17 19:36:47
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-17 20:55:12
*/
var axios = require("axios");
var config = require('./config');
var fun = require('./fun');
var DB = require('./mongodb');
var currentBlockNumber;
var reqTransactionData = {"jsonrpc":"2.0","id":12,"method":"eth_getTransactionByHash","params":["0xb987ec3d1efb9a266df31391a77dd404ec88783e6f8171b12ddddcd4a6de7a55"]};

axios.post(config.env.infura,reqTransactionData)
	.then(data1 => {
		console.log(data1.data);
		let toAddr = data1.data.result.to;
		if(toAddr === "0xf485c5e679238f9304d986bb2fc28fe3379200e5"){
			let txid = new DB.txid();
			txid.blockNumber = +data1.data.result.blockNumber;
			txid.txid = "0xb987ec3d1efb9a266df31391a77dd404ec88783e6f8171b12ddddcd4a6de7a55";
			txid.transaction = data1.data.result;
			txid.save((err,data2) => {
				if(err){
					console.log(err);
				} else {
					console.log("==========")
					console.log(data2);
				}
			});
		}
	})
	.catch(err => {
		console.log(err);
	})
				
