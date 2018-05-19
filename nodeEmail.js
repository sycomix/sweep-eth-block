/*
* @Author: Mr.Sofar
* @Date:   2018-05-19 18:30:04
* @Last Modified by:   Mr.Sofar
* @Last Modified time: 2018-05-19 18:44:34
*/
var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');
var config = require("./email-config");
smtpTransport = nodemailer.createTransport(smtpTransport({
    service: config.email.service,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
}));
module.exports = smtpTransport;
