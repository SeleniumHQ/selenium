const execa = require("execa")

execa.shell('node src/index.js samples/D.md -s').then(result => {
	console.log(result);
});
