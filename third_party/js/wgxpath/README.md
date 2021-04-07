wgxpath - Wicked Good XPath

https://github.com/google/wicked-good-xpath

The source in this directory is from:

https://github.com/google/wicked-good-xpath/tree/829cd0d85e51b7e23d6c4ef596cc83374ac1a430/src

excluding the *_test* files.

The easiest way to update wgxpath is:

```
rm *.js LICENSE
svn export https://github.com/google/wicked-good-xpath.git/trunk/src
rm *_test.js *_test_dom.html compile.sh
```

Once done, run the build and see what's broken :)
