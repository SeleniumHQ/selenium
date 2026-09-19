# NNNN. Files are uploaded and downloaded through a file namespace

- Status: Proposed
- Discussion:

## Context

Moving a file between the machine running the test and the machine running the browser is one
user-facing concern with two directions, and Selenium expresses neither of them directly.

Uploading is an overload. A user calls `sendKeys` on a file input with a path, and a file detector
decides whether the string is a path worth uploading to the remote end first. The detector is
implicit — Python installs `LocalFileDetector` by default and offers `UselessFileDetector` to turn
it off — so a test that sends a string which happens to look like a path can upload a file without
meaning to. BiDi offers `input.setFiles`, which takes an element and a list of files and says what
it does.

Downloading is Grid-shaped. `HasDownloads` — `getDownloadableFiles`, `downloadFile`,
`deleteDownloadableFiles` — is gated on the `se:downloadsEnabled` capability and exists because
the browser writes the file where the test cannot see it. BiDi can configure download behavior
directly, and reports a completed download's path from the navigation status, though that path is
still on the machine running the browser.

BiDi also reports both directions as events: `input.fileDialogOpened` when the browser asks for
files, and `browsingContext.downloadWillBegin` and `downloadEnd` around a download. Two protocol
facts constrain what a handler for them can be. Neither event waits for a client response — the
file dialog steps emit the event, compute whether to dismiss from the prompt handler, and return;
`downloadWillBegin` emits and returns the configured download behavior — so unlike the network
events, neither can be blocked on. And `fileDialogOpened` carries the element only when there
is one, which a `showOpenFilePicker()` call has not, while `input.setFiles` requires an element.

Whether a file dialog opens at all is the `file` key of the prompt handler capability, decided by
the capabilities record: the dialog is allowed to open unless configured otherwise, and any value
other than `ignore` dismisses it.

| Binding    | Current behavior |
|------------|------------------|
| Java       | `sendKeys` with a path plus `setFileDetector` on `RemoteWebDriver`; `HasDownloads` on `RemoteWebDriver`. |
| Python     | `sendKeys` with a path; `LocalFileDetector` installed by default, `file_detector_context` to swap it; downloads on the driver. |
| Ruby       | `send_keys` with a path plus a file detector; downloads exposed. |
| .NET       | `SendKeys` with a path; no file detector of the same shape. |
| JavaScript | `sendKeys` with a path plus a file detector; no downloads API. |

## Decision

**1. A `driver.file` namespace holds both directions.** Uploads and downloads are one concern for
the user, they share the remote-versus-local problem, and grouping them keeps one set of names for
one idea.

**2. Elements gain an upload method.** `element.upload(path, ...)` sets the files on that element
over `input.setFiles`, accepting one or more paths. It is the supported way to fill a file input.

**3. Passing a path to `sendKeys` is deprecated, and so are the file detectors.** The deprecation
names `element.upload` as the replacement and follows the project's policy: a release warning,
removal no sooner than two releases later. Until removal, `sendKeys` behaves as it does today.

**4. Uploads to a remote browser keep working without a detector.** The upload method uploads the
file to the remote end when the session is remote, because the method knows it is being given a
file — which is the ambiguity the detector existed to guess at.

**5. Downloads are configured and read through `driver.file`.** Where the browser writes downloads
is configured through the namespace; listing, retrieving, and deleting downloaded files move there
from the driver. `HasDownloads` and its per-binding equivalents are deprecated in favor of it, on
the same timeline.

**6. `se:downloadsEnabled` remains the switch for retrieving files from a remote browser.**
Configuring download behavior through BiDi does not make a remote browser's filesystem reachable;
the capability is what makes Grid keep the file and serve it. A local session may read the path the
protocol reports directly.

**7. File dialogs and downloads are exposed as handlers, and they observe rather than
intercept.** `driver.file.add_upload_handler` and `add_download_handler`, each with a remove and a
clear. The record states plainly that these cannot block: the browser does not wait for them, so a
handler reacts to what is happening rather than deciding it. This is a deliberate difference from
the network handlers, which do block, and the difference is documented at the API rather than
discovered.

**8. An upload handler receives the element when there is one.** When the dialog came from a file
input the handler can call the upload method on that element; when it came from
`showOpenFilePicker()` there is no element and the handler can only observe. The value expresses
the difference rather than hiding it.

**9. Registering an upload handler requires the file dialog to be allowed to open.** If the prompt
handler's `file` value would dismiss dialogs, the binding raises when a handler is registered
rather than delivering events for dialogs that are already gone.

## Considered options

- **Separate upload and download records** — decide each on its own. Rejected: they share a
  namespace decision, a handler-shape decision, and the remote-versus-local problem, so splitting
  them would settle the same questions twice.
- **Keep uploads on `sendKeys` and fix only the detector** — make the detector explicit rather
  than adding a method. Rejected: the ambiguity is in the overload, not the detector; a method
  that says "upload" removes the guess entirely.
- **A `driver.upload` and a `driver.downloads`** — two namespaces named for the directions.
  Rejected: it puts the two halves of one idea in two places, and the download half is then a
  namespace with three methods.
- **Give the file handlers the same blocking contract as network handlers** — let a handler hold a
  dialog or a download. Rejected: the protocol does not wait for the client at either point, so the
  contract could not be honored.
- **Do not expose the file handlers at all** — ship the commands and leave the events. Rejected
  here, though it stays the obvious thing to cut if the release needs scope: an observational
  handler is still the only way to learn that a page asked for a file, which today is
  invisible.
- **Retire `se:downloadsEnabled`** — treat BiDi's download configuration as sufficient. Rejected:
  it configures the browser, not the node, and Grid still has to keep and serve the file.

## Consequences

Uploading becomes explicit and unambiguous, at the cost of a deprecation that touches every binding
and a long-standing idiom in user code. Tests that rely on `sendKeys` with a path keep working for
at least two releases, and the file detectors keep working until removal, so the migration is
gradual; but the detector's implicit behavior is the kind of thing users do not know they depend on
until it is gone.

Downloads gain a namespace and lose their place on the driver, which is the visible half of the
change. The invisible half is that a local session can now read a completed download's path from
the protocol while a remote one still goes through Grid — one API with two mechanisms behind it,
which the record accepts because the alternative is one mechanism that does not work locally.

The file handlers introduce the first handler family in Selenium that cannot block, and users who
reason by analogy from the network handlers will expect otherwise. That is the main risk this
record takes: the naming is parallel, the contract is not.

Follow-up decisions: whether `element.upload` should accept anything other than a path, such as
content the binding writes to a temporary file; and how downloads interact with a navigation wait,
which the navigation record settles from its side.
