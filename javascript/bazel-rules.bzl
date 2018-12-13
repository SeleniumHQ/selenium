load(
    "@io_bazel_rules_closure//closure:defs.bzl",
    "closure_js_binary",
    "closure_js_library",
)

def selenium_js_fragment(name, function, deps = [], visibility = []):
    (module, func) = function.rsplit(".", 1)

    # Write a file exposing the function
    native.genrule(
        name = "%s-fragment" % name,
        outs = ["%s-fragment.js" % name],
        cmd = "echo \"goog.require('%s'); goog.exportSymbol('_', %s);\" > \"$@\"" % (module, function),
    )

    closure_js_library(
        name = "%s-fragment-lib" % name,
        srcs = ["%s-fragment" % name],
        deps = deps,
    )

    # Wrap the output in two functions. The outer function ensures the
    # compiled fragment never pollutes the global scope by using its
    # own scope on each invocation. We must import window.navigator into
    # this unique scope since Closure's goog.userAgent package assumes
    # navigator and document are defined on goog.global. Normally, this
    # would be window, but we are explicitly defining the fragment so that
    # goog.global is _not_ window.
    #     See http://code.google.com/p/selenium/issues/detail?id=1333
    wrapper = "function(){%output%; return this._.apply(null,arguments);}"
    wrapper = ("function(){return %s.apply({" % wrapper +
               "navigator:typeof window!='undefined'?window.navigator:null," +
               "document:typeof window!='undefined'?window.document:null" +
               "}, arguments);}")

    closure_js_binary(
        name = name,
        output_wrapper = wrapper,
        compilation_level = "ADVANCED",
        defs = [
            "--define=goog.NATIVE_ARRAY_PROTOTYPES=false",
            "--define=bot.json.NATIVE_JSON=false",
            "--generate_exports",
            "--assume_function_wrapper",
        ],
        deps = [
            ":%s-fragment-lib" % name,
        ],
        visibility = visibility,
    )
