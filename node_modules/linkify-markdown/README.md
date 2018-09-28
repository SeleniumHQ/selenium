**This project is work in progress 🚧. Thanks for having patience!**

# Linkify markdown

![version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
[![Build Status](https://travis-ci.org/nitin42/linkify-markdown.svg?branch=master)](https://travis-ci.org/nitin42/linkify-markdown)

> ***A cli tool which automatically adds references to issues, pull requests, user mentions and forks to your project markdown file.***

<p align="center">
  <img src="https://gyazo.com/1518fc90b43476098c17ee268f911fce.png" />
</p>

## Demo

![demo](http://g.recordit.co/ZTPOJp7ouz.gif)

## Install

To use the cli-tool, install using the following command -

```
npm install linkify-markdown -g
```

To use this as a package on web -

```
npm install linkify-markdown
```

## Why ?

Easy to add references automatically to:

* **issues** - `#1` or `GH-1`

* **pull requests** - `#4`

* **commits** - `dfaec38da4cd170dd1acce4e4c260f735fe2cfdc`

* **commit comment** - `dfaec38da4cd170dd1acce4e4c260f735fe2cfdc#commitcomment-16345693`

* **issues across forks** - `repo/#1`

* **issues across projects** - `project-org/project/#2`

* **@mentions** - `@nitin42`

## Usage

To use this tool, you will need to add a `repository` relative to which references will be added. To add a `repository`, you can add these fields to your `package.json` file:

```json
{
  "repository": {
    "url": "your_project_url"
  }
}
```

or you can also provide the `repository` url through command line options API.

```
linkify readme.md --repo <repository_url>
```

> **Note** - This will overwrite the package.json `url` field.

### Adding references/links to a single markdown file

To add links or references to a single markdown file, use command

```
linkify sample.md
```

where `sample.md` might look like this:

```markdown
# Heading

@nitin42

@kentcdodds

Issue 1 - #1

Issue 2 - #2

Commit - 609fc19d2fc1d70e43dcaff3311ad4a79f651c9e
```

Running the above command will convert this to -

```markdown
# Heading

[@nitin42](https://github.com/nitin42)

[@kentcdodds](https://github.com/kentcdodds)

Issue 1 - [#1](https://github.com/<username>/<repo-name>/issues/1)

Issue 2 - [#2](https://github.com/<username>/<repo-name>/issues/2)

Commit - [`dfaec38`](https://github.com/<username>/<repo-name>/commit/dfaec38da4cd170dd1acce4e4c260f735fe2cfdc)
```

Notice one thing that we haven't passed the option `--repo` to provide the repository url so running this command assumes that you have added the `repository` field in your `package.json` file.

### Adding references/links to multiple files

To use this tool for multiple files, use this command

```
linkify samples/A.md samples/B.md samples/C.md samples/D.md
```

Running the above command will convert only those files which are either in markdown format or if they are not empty. If they are empty or not in markdown format, the tool will skip processing those files.

The output will look like this:

<p align="center">
  <img src="https://gyazo.com/16fb0cabaf2635afcf3bd71ec3012e7a.png" />
</p>

The same is applicable to running the command for a single file i.e if it the file is empty, it will skip processing it.

### Adding references/links to a directory of markdown files

You can also add links to all the files in a directory. Use this command -

```
linkify -d samples/
```

This will add links to all the files (except those which are empty or not in markdown format)

### Usage on web

You will need to install the package locally in your project repo instead of globally installing it in order to use it on web.

```
npm install linkify-markdown
```

Here is an example to use this on web to process a markdown string of code.

```js
const { linkify } = require('linkify-markdown')

const sample = `
# Sample

@nitin42

@kentcdodds

#1

#2

Commit - dfaec38da4cd170dd1acce4e4c260f735fe2cfdc
`

const options = {
  strong: true,
  repository: 'https://github.com/nitin42/cli-test-repo'
}

linkify(sample, options)
```

This will return the output as a string -

```
# Sample

[**@nitin42**](https://github.com/nitin42)

[**@kentcdodds**](https://github.com/kentcdodds)

[#1](https://github.com/nitin42/cli-test-repo/issues/1)

[#2](https://github.com/nitin42/cli-test-repo/issues/2)

Commit - [`dfaec38`](https://github.com/nitin42/cli-test-repo/commit/dfaec38da4cd170dd1acce4e4c260f735fe2cfdc)
```

[Learn more about the Web api](#api)

## Messages

This is a reference section.

* You will get an error if you don't provide a file or directory -

![msg](https://i.gyazo.com/ba53752071db872258fb7453d1dacf91.png)

* You will receive warning for the empty files or directory

![file](https://gyazo.com/34646a73d23b4dbe59beae9ba8765a37.png)

## API

**For a single or multiple files**

Command - `linkify <file 1> <file 2> ... <file n> options`

**For directory of files**

Command - `linkify -d <directory_name> options`

`options`

* `-s` or `--strong` - Uses strong nodes for `@mentions`.

* `-h` or `--help` - Use this option for help

**For usage on web**

`linkify(markdown_string, [options])`

Returns the processed markdown code as a string.

`options`

An object with options `strong` and `repository`.

* `strong` (**`Boolean`**) - Uses strong nodes for `@mentions`. Default value is `false`.

* `repository` (**`String`**) - Repository url. If not given, uses `repository` field from `package.json` file.


## License

MIT

**If you liked this project, then ⭐ it or either [share it on Twitter](https://twitter.com/NTulswani) or I'd also love to see your contributions or ideas to improve the tool. Thanks!**
