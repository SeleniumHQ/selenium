# Javascript Atoms

These "atoms" provide reusable building blocks for browser automation
(which is why we call them "atoms"!) They're currently built with the
Google Closure Compiler, but at some point, we'd love to migrate them
to TypeScript since Closure isn't as widely known.

## Testing the Atoms

### Iteratively

While working on the atoms, it can be helpful to be able to iterate on
the code in your IDE of choice, and then run the tests in a
browser. You can do this by starting a debug server:

```shell
bazel run javascript/atoms:test_debug_server  
```

And then navigating to: http://localhost:2310/filez/selenium/javascript/atoms/

You'll be able to browse around the filesystem until you find the test
you want to work on.

These files are symlinked by bazel to the ones in the source code, so
edits you make there will be reflected in the code in the browser,
however, new files and removed files may cause you to need to restart
the `bazel run` command.

### Using Bazel

You can run all the tests for a browser using:

```shell
bazel test //javascript/atoms:test{,-chrome,-edge,-safari}
```

You can also filter to a specific test using the name of the file
stripped of it's `.html` suffix. For example:

```shell
bazel test --test_filter=shown_test --//common:headless=false javascript/atoms:test-chrome 
```