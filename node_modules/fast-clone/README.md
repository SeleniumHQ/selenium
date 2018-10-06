<center>
	<img src="https://raw.githubusercontent.com/codeandcats/fast-clone/master/logo.png" />
</center>

The ***fastest deep cloning*** function on NPM that supports the following types:
- Objects (POJOs, null, undefined)
- Arrays
- Dates
- Regular Expressions
- Strings
- Numbers (NaN, Positive Infinity, Negative Infinity)
- Booleans

## Speed Comparison
Average runtime of various NPM clone libraries on a **large** complex object loaded from json files of varying sizes ranging from 3.5 MB to 15 MB.

Library            |      3.5 MB |        7 MB |      15 MB |
-------------------|-------------|-------------|------------|
✔ **fast-clone**   |  **65 ms**  | **135 ms**  | **275 ms** |
✘ deepClone        |    72 ms    |   162 ms    |   313 ms   |
✘ lodash.cloneDeep |    96 ms    |   214 ms    |   476 ms   |
✘ snapshot         |   337 ms    | 1,145 ms    | 3,420 ms   |
✘ clone            |   504 ms    | 1,843 ms    | 7,221 ms   |
✘ angular.copy     |   514 ms    | 1,895 ms    | 7,308 ms   |

## Installation

### NPM
```sh
npm install fast-clone --save
```

### Yarn
```sh
yarn add fast-clone
```

## Usage
Fast-clone is a UMD module so you can use it in Node.js, or in Browser either using Browserfy/Webpack, or by using the global clone function if not using a module loader.

### TypeScript
```ts
import clone = require('fast-clone');
```

### JavaScript
```js
const clone = require('fast-clone');
```

```ts
const a = {
	name: 'Natasha Rominov',
	age: 30,
	skills: [
		'Pistols',
		'Espionage'
	],
	dateOfBirth: new Date('1986-05-21T00:00:00.000Z')
};

const b = clone(a);

b.skills.push('That grabby thing she does with her legs');

console.log(a.skills)
console.log(b.skills);
```

Output will be:
```ts
['Pistols', 'Espionage']
['Pistols', 'Espionage', 'That grabby thing she does with her legs']
```

## Got an Issue or Feature Suggestion?
Then [create an issue on GitHub](https://github.com/codeandcats/fast-clone/issues) and I'll fix/add it asap. :)

Or fork the [repo](https://github.com/codeandcats/fast-clone) and shoot me a pull request
