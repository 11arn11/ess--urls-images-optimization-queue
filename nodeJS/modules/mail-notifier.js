const mailer = require('nodemailer-promise');

module.exports = async function (smtp_config, message) {

	if (!smtp_config)
		throw new Error('SMTP config not found');

	if (!message.from)
		throw new Error('Sender not found');

	if (!message.to)
		throw new Error('Recipient not found');

	if (!message.subject)
		throw new Error('Subject not found');

	if (!message.text)
		throw new Error('Body not found');

	if (!message.attachments)
		throw new Error('Attachments not found');

	const config = require('../config');

	let sendEmail = mailer.config(config.smtp);

	return sendEmail(message);

};