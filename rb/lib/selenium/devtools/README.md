### Adding support for new Chromium DevTools Protocol to the Ruby bindings

* Add the latest version number to `/rb/lib/selenium/devtools/BUILD.bazel`
* Update `/rb/lib/selenium/devtools/version.rb` with the latest version number

### Releasing selenium-devtools gem

```shell
 bazel build //rb:selenium-devtools
```

```shell
gem push bazel-bin/rb/selenium-devtools.gem
```
