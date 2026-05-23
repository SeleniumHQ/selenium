# CDP Bindings for Java

Before going through these steps, make sure the needed protocol file definitions are in the tree.
Check this [README][] for more information.

They are typically downloaded from the
[devtools source](https://github.com/ChromeDevTools/devtools-protocol/tree/master/json)

* Edit `//java/src/org/openqa/selenium/devtools:versions.bzl` to include the new version number (and
  possibly delete the old one, we tend to support only the last 3 versions). `LATEST_CDP_VERSION` is
  computed automatically from `CDP_VERSIONS` and does not need to be edited.
* Copy the most recent `//java/src/org/openqa/selenium/devtools/vXX` to
  `//java/src/org/openqa/selenium/devtools/vXX+1`.
* Do a search and replace in that directory, converting `XX` to `XX+1`
* Add `//java/src/org/openqa/selenium/devtools/vXX:vXX.publish` version to the [Rakefile][].
* Compile the code and fix the places where signatures have changed.

The `selenium-devtools-latest` artifact is a stable alias that republishes the protocol classes of
`LATEST_CDP_VERSION` under the `org.openqa.selenium.devtools.latest` package. Users who don't want
to update their imports on every Chrome bump can write:

```java
import org.openqa.selenium.devtools.latest.page.Page;
```

The alias artifact contains only the generated protocol types; the runtime `CdpInfo` registration
is provided by the versioned `selenium-devtools-v<LATEST>` artifact, which is pulled in as a
transitive Maven dependency. The alias is rebuilt automatically when a new CDP version is added — no
extra steps are required when bumping `CDP_VERSIONS`.

[README]: https://github.com/SeleniumHQ/selenium/tree/trunk/common/devtools

[versions]: https://github.com/SeleniumHQ/selenium/blob/trunk/java/src/org/openqa/selenium/devtools/versions.bzl

[Rakefile]: https://github.com/SeleniumHQ/selenium/blob/trunk/Rakefile#L102-L105
