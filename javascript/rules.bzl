def closure_fragment(name, **kwargs):
    native.closure_fragment(name = name, **kwargs)

    # Android
    defs = kwargs.get("defines", [])
    defs = defs + [
        "goog.userAgent.ASSUME_MOBILE_WEBKIT=true",
        "goog.userAgent.product.ASSUME_ANDROID=true",
    ]
    args = dict(**kwargs)
    args["defines"] = defs
    fragment_name = name + "-android"
    native.closure_fragment(name = fragment_name, **args)

    # Chrome
    defs = kwargs.get("defines", [])
    defs = defs + [
        "goog.userAgent.ASSUME_WEBKIT=true",
        "goog.userAgent.product.ASSUME_CHROME=true",
    ]
    args = dict(**kwargs)
    args["defines"] = defs
    fragment_name = name + "-chrome"
    native.closure_fragment(name = fragment_name, **args)

    # Edge and IE
    defs = kwargs.get("defines", [])
    defs = defs + [
        "goog.userAgent.ASSUME_IE=true",
    ]
    args = dict(**kwargs)
    args["defines"] = defs
    fragment_name = name + "-ie"
    native.closure_fragment(name = fragment_name, **args)

    # iOS
    defs = kwargs.get("defines", [])
    defs = defs + [
        # We use the same fragments for iPad and iPhone, so just compile a
        # generic mobile webkit.
        "goog.userAgent.ASSUME_MOBILE_WEBKIT=true",
    ]
    args = dict(**kwargs)
    args["defines"] = defs
    fragment_name = name + "-ios"
    native.closure_fragment(name = fragment_name, **args)

    # Firefox
    defs = kwargs.get("defines", [])
    defs = defs + [
        "goog.userAgent.ASSUME_GECKO=true",
        "goog.userAgent.product.ASSUME_FIREFOX=true",
    ]
    args = dict(**kwargs)
    args["defines"] = defs
    fragment_name = name + "-firefox"
    native.closure_fragment(name = fragment_name, **args)