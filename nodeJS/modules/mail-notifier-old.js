const nodemailer = require('nodemailer');

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

	return nodemailer.createTestAccount((err, account) => {

		if (err) {
			return Promise.reject(err);
		}

		let transporter = nodemailer.createTransport(smtp_config);

		return transporter.sendMail(message, (error, info) => {

			if (error) {
				return Promise.reject(err);
			}

			let output = 'Message sent: %s ' + info.messageId;

			console.log(output);

			return Promise.resolve(output)

		});

	});

};