# Chrome Debugging Protocol

We keep multiple versions of the protocol in the tree in order to allow us to generate bindings as
needed.

They are typically downloaded from the [devtools source][]

Fortunately both Chrome and Edge are based off Chromium releases and those are OSS. In order to get
the versions of the protocol spoken by particular releases of Chrome:

* Find out the latest version of [Stable Channel Update for Desktop][] (e.g., `96.0.4664.45`).
* Create a `vXX` directory under `//common/devtools/chromium` (e.g. `v96` for `96.0.4664.45`)
* Copy the `BUILD.bazel` file from the `vXX-1` directory.
* Navigate to the [Chromium source][] and open the tag matching the release number.
* Find `//third_party/blink/public/devtools_protocol/browser_protocol.pdl` and download the file
  to `//common/devtools/chromium/vXX`.
  * (Quick link:
    `https://raw.githubusercontent.com/chromium/chromium/<LATEST_VERSION_NUMBER>/third_party/blink/public/devtools_protocol/browser_protocol.pdl`)
* Now figure out the version of v8 used by the version of Chromium. In Chromium's source, navigate
  to `//:DEPS` and search for `v8_revision`
  * (Quick
    link: `https://github.com/chromium/chromium/blob/<LATEST_VERSION_NUMBER>/DEPS#:~:text=the%20commit%20queue%20can%20handle%20cls%20rolling%20v8`)
* Head over to the [v8 source](https://github.com/v8/v8) and switch to the indicated revision
  * (e.g., `451d38b60be0a0f692b11815289cf8cbc9b1dc98`)
* Find `//include/js_protocol.pdl` and download the file to `//common/devtools/chromium/vXX`.
  (Quick link: `https://github.com/v8/v8/raw/<V8_REVISION_NUMBER>/include/js_protocol.pdl`)

You may also find the same information at the [OmahaProxy CSV Viewer][]

We have a modified form of the scripts used by Chromium to generate the protocol files. The
originals were in:

https://github.com/chromium/chromium/blob/master/third_party/inspector_protocol/convert_protocol_to_json.py

[devtools source]: https://github.com/ChromeDevTools/devtools-protocol/tree/master/json

[Stable Channel Update for Desktop]: https://chromereleases.googleblog.com/search/label/Stable%20updates

[Chromium source]: https://github.com/chromium/chromium/

[OmahaProxy CSV Viewer]: https://omahaproxy.appspot.com
