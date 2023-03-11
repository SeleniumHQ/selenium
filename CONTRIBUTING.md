# Contributing to Selenium

The Selenium project welcomes contributions from everyone. There are a
number of ways you can help:

## Bug Reports

When opening new issues or commenting on existing issues please make
sure discussions are related to concrete technical issues with the
Selenium software.

It's imperative that issue reports outline the steps to reproduce
the defect. If the issue can't be reproduced it will be closed.
Please provide [concise reproducible test cases](http://sscce.org/)
and describe what results you are seeing and what results you expect.

Issues shouldn't be used for support. Please address questions to the
[`selenium-users@` mailing list](https://groups.google.com/forum/#!forum/selenium-users).
Discussion of high level project ideas or non-technical topics should
move to the
[`selenium-developers@` mailing list](https://groups.google.com/forum/#!forum/selenium-developers)
instead.

We also need help with triaging
[issues that needs investigation](https://github.com/SeleniumHQ/selenium/labels/I-needs%20investigation).
This means asking the right questions, procuring the right information
to properly debug and verify the issue, and bisecting a commit range if
the issue is a regression.

## Feature Requests

If you find that Selenium is missing something, feel free to open an issue
with details describing what feature(s) you'd like added or changed.

If you'd like a hand at trying to implement the feature yourself, please refer to the [Code Contributions](#code-contributions) section of the document.


## Documentation

Selenium is a big software project and documentation is key to
understanding how things work and learning effective ways to exploit
its potential.

The [seleniumhq.github.io](https://github.com/SeleniumHQ/seleniumhq.github.io/)
repository contains both Selenium’s site and documentation. This is an ongoing effort (not targeted
at any specific release) to provide updated information on how to use Selenium effectively, how to
get involved and how to contribute to Selenium.

The official documentation of Selenium is at https://selenium.dev/documentation/. More details on
how to get involved and contribute, please check the site's and
documentation [contributing guidelines](https://www.selenium.dev/documentation/about/contributing/).

## Code Contributions

The Selenium project welcomes new contributors. Individuals making
significant and valuable contributions over time are made _Committers_
and given commit-access to the project.

If you're looking for easy bugs, have a look at
[issues labelled E-easy](https://github.com/SeleniumHQ/selenium/issues?q=is%3Aopen+is%3Aissue+label%3AE-easy)
on Github.

This document will guide you through the contribution process.

### Step 1: Fork

Fork the project [on Github](https://github.com/seleniumhq/selenium)
and check out your copy locally. Use `--depth 1` for a quick check out.
The repository is ~2GB and checking the whole history takes a while.

```shell
% git clone git@github.com:username/selenium.git --depth 1
% cd selenium
% git remote add upstream git://github.com/seleniumhq/selenium.git
```

#### Dependencies

We bundle dependencies in the _third-party/_ directory that is not
part of the proper project. Any changes to files in this directory or
its subdirectories should be sent upstream to the respective projects.
Please don't send your patch to us as we cannot accept it.

We do accept help in upgrading our existing dependencies or removing
superfluous dependencies. If you need to add a new dependency it's
often a good idea to reach out to the committers on the
[IRC channel or the mailing list](https://github.com/SeleniumHQ/selenium/blob/trunk/CONTRIBUTING.md#communication)
to check that your approach aligns with the project's
ideas. Nothing is more frustrating than seeing your hard work go to
waste because your vision doesn't align with the project's.

#### License Headers

Every file in the Selenium project must carry the following license
header boilerplate:

```text
Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The SFC licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
```

There's no need to include a copyright statement in the file's header.
The copyright attributions can be reviewed in the
[NOTICE](https://github.com/SeleniumHQ/selenium/blob/trunk/NOTICE)
file found in the top-level directory.

### Step 2: Branch

Create a feature branch and start hacking:

```shell
% git checkout -b my-feature-branch
```

We practice HEAD-based development, which means all changes are applied
directly on top of trunk.

### Step 3: Commit

First make sure git knows your name and email address:

```shell
% git config --global user.name 'Santa Claus'
% git config --global user.email 'santa@example.com'
```

**Writing good commit messages is important.** A commit message
should describe what changed, why, and reference issues fixed (if
any). Follow these guidelines when writing one:

1. The first line should be around 50 characters or less and contain a
    short description of the change.
2. Keep the second line blank.
3. Wrap all other lines at 72 columns.
4. Include `Fixes #N`, where _N_ is the issue number the commit
    fixes, if any.

A good commit message can look like this:

```text
explain commit normatively in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.

Fixes #141
```

The first line must be meaningful as it's what people see when they
run `git shortlog` or `git log --oneline`.

### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time.

```shell
% git fetch upstream
% git rebase upstream/trunk
```

### Step 5: Test

Bug fixes and features **should have tests**. Look at other tests to
see how they should be structured. Verify that new and existing tests are
passing locally before pushing code.

#### Running tests locally

Build your code for the latest changes and run tests locally.

##### Python
<details>
  <summary>
    Click to see How to run Python Tests.
  </summary>

  It's not mandatory to run tests sequentially but running Unit tests
  before browser testing is recommended.

  Unit Tests
  ```shell
  % bazel test //py:unit
  ```

  Remote Tests
  ```shell
  % bazel test --jobs 1 //py:test-remote
  ```

  Browser Tests
  ```shell
  % bazel test //py:test-<browsername> #eg test-chrome, test-firefox
  ```
</details>

##### Javascript
<details>
  <summary>
    Click to see How to run JavaScript Tests.
  </summary>

  Node Tests
  ```shell
  % bazel test //javascript/node/selenium-webdriver:tests
  ```

  Firefox Atom Tests
  ```shell
  % bazel test --test_tag_filters=firefox //javascript/atoms/... //javascript/selenium-atoms/... //javascript/webdriver/...
  ```

  Grid UI Unit Tests
  ```shell
  % cd javascript/grid-ui && npm install && npm test
  ```
</details>

##### Java
<details>
  <summary>
    Click to see How to run Java Tests.
  </summary>

  Small Tests
  ```shell
  % bazel test --cache_test_results=no --test_size_filters=small grid java/test/...
  ```

  Large Tests
  ```shell
  % bazel test --cache_test_results=no java/test/org/openqa/selenium/grid/router:large-tests
  ```

  Browser Tests
  ```shell
  bazel test --test_size_filters=small,medium --cache_test_results=no --test_tag_filters=-browser-test //java/...
  ```
</details>

##### Ruby

Please see https://github.com/SeleniumHQ/selenium#ruby for details about running
tests.

### Step 6: Push

```shell
% git push origin my-feature-branch
```

Go to https://github.com/yourusername/selenium.git and press the _Pull
Request_ and fill out the form.

Pull requests are usually reviewed within a few days. If there are
comments to address, apply your changes in new commits (preferably
[fixups](http://git-scm.com/docs/git-commit)) and push to the same
branch.

### Step 7: Integration

When code review is complete, a committer will take your PR and
integrate it on Selenium's trunk branch. Because we like to keep a
linear history on the trunk branch, we will normally squash and rebase
your branch history.

## Stages of an Issue or PR

From your create your issue or pull request, through code review and
towards integration, it will be assigned different Github labels. The
labels serve for the committers to more easily keep track of work
that's pending or awaiting action.

Component labels are yellow and carry the **C** prefix. They highlight
the subsystem or component your PR makes changes in.

The driver labels (**D**) indicate if the changes are related to a
WebDriver implementation or the Selenium atoms.

The review labels (**R**) are:

* **awaiting answer**: awaits an answer from you
* **awaiting merge**: waits for a committer to integrate the PR
* **awaiting reviewer**: pending code review
* **blocked on external**: a change in an upstream repo is required
* **needs code changes**: waiting for you to fix a review issue
* **needs rebase**: the branch isn't in sync with trunk and needs to
    be rebased

Issues are labelled to make them easier to categorise and find by:

* which **component** they relate to (java, cpp, dotnet, py, rb, nodejs)
* which **driver** is affected
* their presumed **difficulty** (easy, less easy, hard)
* what **type** of issue they are (defect, race condition, cleanup)

## Communication

Selenium contributors frequent the `#selenium` channel on
[`irc.freenode.org`](https://webchat.freenode.net/). You can also join
the [`selenium-developers@` mailing list](https://groups.google.com/forum/#!forum/selenium-developers).
Check https://selenium.dev/support/ for a complete list of options to communicate.
