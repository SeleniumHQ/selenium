### Adding support for a new version of Chromium DevTools Protocol to the .NET bindings

To add support for a new version of the Chromium DevTools Protocol to the .NET bindings,
perform the following steps, where `<N>` is the major version of the protocol:

1. Add the new version string (`v<N>`) to the `SUPPORTED_DEVTOOLS_VERSIONS` list in
[`//dotnet:selenium-dotnet-version.bzl`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/selenium-dotnet-version.bzl).
2. Create a new directory at `//dotnet/src/webdriver/DevTools/v<N>`, and copy the
contents of the `//dotnet/src/webdriver/DevTools/v<N-1>` directory into it.
3. Rename each of the `*.cs` files in `//dotnet/src/webdriver/DevTools/v<N>` so that
the file names start with `V<N>` instead of `V<N-1>`.
4. In each of the `*.cs` files in `//dotnet/src/webdriver/DevTools/v<N>`, update all
occurrences of `V<N-1>` to `V<N>`. **IMPORTANT:** Do _not_ change the case of `V<N>` in
each `.cs` file.
5. In [`//dotnet/src/webdriver/DevTools/DevToolsDomains.cs`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/DevTools/DevToolsDomains.cs),
add an entry for version `<N>` to the `SupportedDevToolsVersions` dictionary initialization.
6. In [`//dotnet/src/webdriver:WebDriver.csproj.prebuild.cmd`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/WebDriver.csproj.prebuild.cmd),
add the following block (substituting the proper value for `<N>`):

```
if not exist  "%1..\..\..\bazel-bin\dotnet\src\webdriver\cdp\v<N>\DevToolsSessionDomains.cs" (
  echo Generating CDP code for version <N>
  pushd "%1..\..\.."
  bazel build //dotnet/src/webdriver/cdp:generate-v<N>
  popd
)
```

7. In [`//dotnet/src/webdriver:WebDriver.csproj.prebuild.sh`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/WebDriver.csproj.prebuild.sh),
add the following block (substituting the proper value for `<N>`):

```
if [[ ! -f "$1../../../bazel-bin/dotnet/src/webdriver/cdp/v<N>/DevToolsSessionDomains.cs" ]]
then
  echo "Generating CDP code for version <N>"
  bazel build //dotnet/src/webdriver/cdp:generate-v<N>
fi
```

8. In each of the `*.cs` files in `//dotnet/test/common/DevTools/`, update all
      occurrences of `V<N-1>` to `V<N>`.
9. Commit the changes.

### Removing support for a version of Chromium DevTools Protocol from the .NET bindings

To remove support for a version of the Chromium DevTools Protocol from the .NET bindings,
perform the following steps, where `<N>` is the major version of the protocol:

1. Delete the contents of the `//dotnet/src/webdriver/DevTools/v<N>` directory.
2. In [`//dotnet/src/webdriver/DevTools/DevToolsDomains.cs`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/DevTools/DevToolsDomains.cs),
remove the entry for version `<N>` from the `SupportedDevToolsVersions` dictionary initialization.
3. Remove the version string (`v<N>`) from the `SUPPORTED_DEVTOOLS_VERSIONS` list in
[`//dotnet:selenium-dotnet-version.bzl`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/selenium-dotnet-version.bzl).
4. In [`//dotnet/src/webdriver:WebDriver.csproj.prebuild.cmd`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/WebDriver.csproj.prebuild.cmd),
remove the `if not exist` block for version `<N>`.
5. In [`//dotnet/src/webdriver:WebDriver.csproj.prebuild.sh`](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/src/webdriver/WebDriver.csproj.prebuild.sh),
remove the `if-fi` block for version `<N>`.
6. Commit the changes.

