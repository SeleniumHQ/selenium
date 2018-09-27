'use strict';
const ghGot = require('gh-got');

module.exports = (email, token) => {
	if (!(typeof email === 'string' && email.includes('@'))) {
		throw new Error('Email required');
	}

	return ghGot('search/users', {
		token,
		query: {
			q: `${email} in:email`
		},
		headers: {
			'user-agent': 'https://github.com/sindresorhus/github-username'
		}
	}).then(result => {
		const data = result.body;

		if (data.total_count === 0) {
			throw new Error(`Couldn't find username for \`${email}\``);
		}

		return data.items[0].login;
	});
};
