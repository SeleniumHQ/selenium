load("@io_bazel_rules_closure//closure:defs.bzl", "closure_js_binary", "closure_js_library")

def _internal_closure_fragment_export_impl(ctx):
    ctx.actions.write(
        output = ctx.outputs.out,
        content = """
goog.require('%s');
goog.exportSymbol('_', %s);
""" % (ctx.attr.module, ctx.attr.function),
    )

_internal_closure_fragment_export = rule(
    implementation = _internal_closure_fragment_export_impl,
    attrs = {
        "function": attr.string(mandatory = True),
        "module": attr.string(mandatory = True),
    },
    outputs = {"out": "%{name}.js"},
)

def _closure_fragment_impl(ctx):
    defs = ctx.attr.defines + [
        "goog.userAgent.ASSUME_MOBILE_WEBKIT=true",
        "goog.userAgent.product.ASSUME_ANDROID=true",
    ]

def closure_fragment(
        name,
        module,
        function,
        browsers = None,
        **kwargs):
    if browsers == None:
        browsers = []
    if type(browsers) != "list":
        fail("browsers must be None or a list of strings")

    exports_file_name = "_%s_exports" % name
    _internal_closure_fragment_export(
        name = exports_file_name,
        module = module,
        function = function,
    )

    exports_lib_name = "%s_lib" % exports_file_name
    closure_js_library(
        name = exports_lib_name,
        srcs = [exports_file_name],
        deps = kwargs.get("deps", []),
    )

    # Wrap the output in two functions. The outer function ensures the
    # compiled fragment never pollutes the global scope by using its
    # own scope on each invocation. We must import window.navigator into
    # this unique scope since Closure's goog.userAgent package assumes
    # navigator and document are defined on goog.global. Normally, this
    # would be window, but we are explicitly defining the fragment so that
    # goog.global is _not_ window.
    #     See http://code.google.com/p/selenium/issues/detail?id=1333
    wrapper = (
        "function(){" +
        "return (function(){%output%; return this._.apply(null,arguments);}).apply({" +
        "navigator:typeof window!='undefined'?window.navigator:null," +
        "document:typeof window!='undefined'?window.document:null" +
        "}, arguments);}"
    )

    browser_defs = {
        "*": [],
        "android": [
            "--define=goog.userAgent.ASSUME_MOBILE_WEBKIT=true",
            "--define=goog.userAgent.product.ASSUME_ANDROID=true",
        ],
        "chrome": [
            "--define=goog.userAgent.ASSUME_WEBKIT=true",
            "--define=goog.userAgent.product.ASSUME_CHROME=true",
        ],
        "ie": [
            "--define=goog.userAgent.ASSUME_IE=true",
        ],
        "ios": [
            "--define=goog.userAgent.ASSUME_MOBILE_WEBKIT=true",
        ],
        "firefox": [
            "--define=goog.userAgent.ASSUME_GECKO=true",
            "--define=goog.userAgent.product.ASSUME_FIREFOX=true",
        ],
    }
    for browser, defs in browser_defs.items():
        if len(browsers) > 0 and (browser == "*" or browser not in browsers):
            continue

        bin_name = name
        if browser != "*":
            bin_name = bin_name + "-" + browser

        closure_js_binary(
            name = bin_name,
            deps = [":" + exports_lib_name],
            defs = kwargs.get("defs", []) + defs,
            output_wrapper = wrapper,
            visibility = kwargs.get("visibility"),
        )
