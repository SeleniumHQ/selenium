# gl-got [![Build Status](https://travis-ci.org/singapore/gl-got.svg?branch=master)](https://travis-ci.org/singapore/gl-got)

> Convenience wrapper for [`got`](https://github.com/sindresorhus/got) to interact with the [GitLab API](https://docs.gitlab.com/ee/api/README.html)

Copied then adapted for GitLab from [gh-got](https://github.com/sindresorhus/gh-got)

## Install

```
$ npm install --save gl-got
```


## Usage

Instead of:

```js
const got = require('got');
const token = 'foo';

got('https://gitlab.com/api/v3/users/979254', {
	json: true,
	headers: {
		'PRIVATE-TOKEN': `${token}`
	}
}).then(res => {
	console.log(res.body.username);
	//=> 'gl-got-tester'
});
```

You can do:

```js
const glGot = require('gl-got');

glGot('users/979254', {token: 'foo'}).then(res => {
	console.log(res.body.username);
	//=> 'gl-got-tester'
});
```

Or:

```js
const glGot = require('gl-got');

glGot('https://gitlab.com/api/v3/users/979254', {token: 'foo'}).then(res => {
	console.log(res.body.username);
	//=> 'gl-got-tester'
});
```


## API

Same as [`got`](https://github.com/sindresorhus/got) (including the stream API and aliases), but with some additional options below.

Errors are improved by using the custom GitLab error messages. Doesn't apply to the stream API.

### token

Type: `string`

GitLab [access token](https://docs.gitlab.com/ee/api/README.html#personal-access-tokens).

Can be set globally with the `GITLAB_TOKEN` environment variable.

### endpoint

Type: `string`<br>
Default: `https://gitlab.com/api/v3/`

Can be set globally with the `GITLAB_ENDPOINT` environment variable.

### body

Type: `Object`

Can be specified as a plain object and will be serialized as JSON with the appropriate headers set.


## License

MIT
© [Sindre Sorhus](https://sindresorhus.com)
© [Rhys Arkins](http://rhys.arkins.net)
