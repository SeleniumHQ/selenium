"""This module contains some decorators that can be used to support
the page models. For example for an action that needs a page to be fully
loaded, the @require_loaded decorator will make sure the page is loaded
before the call is invoked.
This pattern is also useful for waiting for certain asynchronous events
to happen before excuting certain actions."""

def require_loaded(func):
    def load_page(page, *params, **kwds):
        if not page.is_loaded():
            page.load()
        assert page.is_loaded(), "page should be loaded by now"
        return func(page, *params, **kwds)
    return load_page
