To regenerate deps.js:
$./go calcdeps

To run the tests locally, start the webserver:
```bash
bazel run //java/test/org/openqa/selenium/environment:appserver
```

You can access it in your browser at http://localhost:2310/javascript.
