# Selenium .Net Bindings

Just as in the rest of the project, we use Bazel as our build system. This means that you can take advantage of a
hermetic build environment, and know that your build will work on both macOS and Linux, as well as Windows. However,
this does come at the cost of being a little unusual to work with.

Before opening the VS Studio project, the first thing to do is to build everything you might need using Bazel. To do
this: `bazel build dotnet/...` This first build may take a while, as it will download a bunch of required files. Make
sure you've got a good Internet connection too!

## Updating dependencies

We use [paket][] to manage our dependencies. In order to manage them, first `cd` into the `dotnet` directory, and make
sure you have `paket` installed:

```shell
dotnet new tool-manifest
dotnet tool install paket
dotnet tool restore
```

This should be a one-time step. Once complete, edit the `//dotnet:paket.dependencies` file to add or update the deps you
need. Next, from the root of the project (in the directory where the `WORKSPACE` file is),
run `./dotnet/update-deps.sh`. This should execute successfully and will update both the `paket.lock` and `paket.bzl`
files. Once this is done, commit the changes, and you'll be able to use the files in your build.

[paket]: https://fsprojects.github.io/Paket/
