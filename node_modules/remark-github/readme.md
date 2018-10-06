# remark-github [![Build Status][build-badge]][build-status] [![Coverage Status][coverage-badge]][coverage-status] [![Chat][chat-badge]][chat]

Auto-link references to commits, issues, pull-requests, and users like
GitHub: [Writing on GitHub][writing-on-github].

## Installation

[npm][]:

```bash
npm install remark-github
```

## Usage

Say we have the following file, `example.md`:

```markdown
Some references:

-   Commit: f8083175fe890cbf14f41d0a06e7aa35d4989587
-   Commit (fork): foo@f8083175fe890cbf14f41d0a06e7aa35d4989587
-   Commit (repo): remarkjs/remark@e1aa9f6c02de18b9459b7d269712bcb50183ce89
-   Issue or PR (`#`): #1
-   Issue or PR (`GH-`): GH-1
-   Issue or PR (fork): foo#1
-   Issue or PR (project): remarkjs/remark#1
-   Mention: @wooorm

Some links:

-   Commit: https://github.com/remarkjs/remark/commit/e1aa9f6c02de18b9459b7d269712bcb50183ce89
-   Commit comment: https://github.com/remarkjs/remark/commit/ac63bc3abacf14cf08ca5e2d8f1f8e88a7b9015c#commitcomment-16372693
-   Issue or PR: https://github.com/remarkjs/remark/issues/182
-   Issue or PR comment: https://github.com/remarkjs/remark-github/issues/3#issue-151160339
-   Mention: @ben-eb
```

And our script, `example.js`, looks as follows:

```javascript
var vfile = require('to-vfile')
var remark = require('remark')
var github = require('remark-github')

remark()
  .use(github)
  .process(vfile.readSync('example.md'), function(err, file) {
    if (err) throw err
    console.log(String(file))
  })
```

Now, running `node example` yields:

```markdown
Some references:

-   Commit: [`f808317`](https://github.com/remarkjs/remark-github/commit/f8083175fe890cbf14f41d0a06e7aa35d4989587)
-   Commit (fork): [foo@`f808317`](https://github.com/foo/remark-github/commit/f8083175fe890cbf14f41d0a06e7aa35d4989587)
-   Commit (repo): [remarkjs/remark@`e1aa9f6`](https://github.com/remarkjs/remark/commit/e1aa9f6c02de18b9459b7d269712bcb50183ce89)
-   Issue or PR (`#`): [#1](https://github.com/remarkjs/remark-github/issues/1)
-   Issue or PR (`GH-`): [GH-1](https://github.com/remarkjs/remark-github/issues/1)
-   Issue or PR (fork): [foo#1](https://github.com/foo/remark-github/issues/1)
-   Issue or PR (project): [remarkjs/remark#1](https://github.com/remarkjs/remark/issues/1)
-   Mention: [**@wooorm**](https://github.com/wooorm)

Some links:

-   Commit: [remarkjs/remark@`e1aa9f6`](https://github.com/remarkjs/remark/commit/e1aa9f6c02de18b9459b7d269712bcb50183ce89)
-   Commit comment: [remarkjs/remark@`ac63bc3` (comment)](https://github.com/remarkjs/remark/commit/ac63bc3abacf14cf08ca5e2d8f1f8e88a7b9015c#commitcomment-16372693)
-   Issue or PR: [remarkjs/remark#182](https://github.com/remarkjs/remark/issues/182)
-   Issue or PR comment: [#3 (comment)](https://github.com/remarkjs/remark-github/issues/3#issue-151160339)
-   Mention: [**@ben-eb**](https://github.com/ben-eb)
```

## API

### `remark.use(github[, options])`

Adds references to commits, issues, pull-requests, and users similar to how
[GitHub][writing-on-github] renders these in issues, comments, and pull request
descriptions.

###### Conversion

*   Commits:
    `1f2a4fb` → [`1f2a4fb`][sha]
*   Commits across forks:
    `remarkjs@1f2a4fb` → [remarkjs@`1f2a4fb`][user-sha]
*   Commits across projects:
    `remarkjs/remark-github@1f2a4fb` →
    [remarkjs/remark-github@`1f2a4fb`][project-sha]
*   Prefix issues:
    `GH-1` → [GH-1][issue]
*   Hash issues:
    `#1` → [#1][issue]
*   Issues across forks:
    `remarkjs#1` → [remarkjs#1][user-issue]
*   Issues across projects:
    `remarkjs/remark-github#1` → [remarkjs/remark-github#1][project-issue]
*   At-mentions:
    `@mention` and `@wooorm` →
    [**@mention**][mentions] and [**@wooorm**][mention]

###### Repository

These links are generated relative to a project.  In Node this is
auto-detected by loading `package.json` and looking for a `repository`
field.  In the browser, or when overwriting this, you can pass a
`repository` in `options`.

###### Mentions

By default, mentions are wrapped in `strong` nodes (which render to
`<strong>` in HTML), to simulate the look of mentions on GitHub.
However, this creates different HTML markup, as the GitHub site applies
these styles using CSS.  Pass `mentionStrong: false` to turn off this
behaviour.

## Contribute

See [`contributing.md` in `remarkjs/remark`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/remarkjs/remark-github.svg

[build-status]: https://travis-ci.org/remarkjs/remark-github

[coverage-badge]: https://img.shields.io/codecov/c/github/remarkjs/remark-github.svg

[coverage-status]: https://codecov.io/github/remarkjs/remark-github

[chat-badge]: https://img.shields.io/gitter/room/remarkjs/Lobby.svg

[chat]: https://gitter.im/remarkjs/Lobby

[license]: LICENSE

[author]: http://wooorm.com

[npm]: https://docs.npmjs.com/cli/install

[writing-on-github]: https://help.github.com/articles/writing-on-github/#references

[sha]: https://github.com/remarkjs/remark-github/commit/1f2a4fb8f88a0a98ea9d0c0522cd538a9898f921

[user-sha]: https://github.com/remarkjs/remark-github/commit/1f2a4fb8f88a0a98ea9d0c0522cd538a9898f921

[project-sha]: https://github.com/remarkjs/remark-github/commit/1f2a4fb8f88a0a98ea9d0c0522cd538a9898f921

[issue]: https://github.com/remarkjs/remark-github/issues/1

[user-issue]: https://github.com/remarkjs/remark-github/issues/1

[project-issue]: https://github.com/remarkjs/remark-github/issues/1

[mentions]: https://github.com/blog/821

[mention]: https://github.com/wooorm

[contributing]: https://github.com/remarkjs/remark/blob/master/contributing.md

[coc]: https://github.com/remarkjs/remark/blob/master/code-of-conduct.md
