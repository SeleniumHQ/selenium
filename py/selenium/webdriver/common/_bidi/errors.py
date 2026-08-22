# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Exception classes for BiDi wire error codes.

Hand-written (not generated). The generated ``error_codes`` map is pure data; the
reconciliation with Selenium's classic exceptions has to happen here, because it needs
the real classes.

Codes the classic WebDriver error handler already types keep that class, so
``except NoSuchElementException`` catches a BiDi failure and a classic one alike, even
where the classic name does not follow from the wire code (``"no such alert"`` is
``NoAlertPresentException``, ``"unable to capture screen"`` is ``ScreenshotException``).
The rest are minted here as ``WebDriverException`` subclasses.

This is internal, unsupported implementation. See
https://www.selenium.dev/documentation/warnings/bidi-implementation/
"""

from __future__ import annotations

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common._bidi.error_codes import EXCEPTION_NAMES
from selenium.webdriver.remote.errorhandler import ErrorCode, ExceptionMapping


def _classic_exception(code: str) -> type[WebDriverException] | None:
    """The classic exception for a wire code, or None where the code is untyped.

    Resolved through the error handler's own tables rather than a second copy of them,
    so a class the handler retypes later follows here without an edit. A code the handler
    resolves to bare ``WebDriverException`` counts as untyped: a minted subclass is
    strictly more specific and still caught by anyone catching the base.
    """
    for name in dir(ErrorCode):
        codes = getattr(ErrorCode, name)
        if not isinstance(codes, list) or code not in codes:
            continue
        classic = getattr(ExceptionMapping, name, None)
        if classic is not None and classic is not WebDriverException:
            return classic
    return None


def _mint(name: str) -> type[WebDriverException]:
    return type(name, (WebDriverException,), {"__module__": __name__, "__doc__": f"Raised for the BiDi {name}."})


_EXCEPTIONS: dict[str, type[WebDriverException]] = {
    code: _classic_exception(code) or _mint(name) for code, name in EXCEPTION_NAMES.items()
}

_BY_NAME: dict[str, type[WebDriverException]] = {exc.__name__: exc for exc in _EXCEPTIONS.values()}


def __getattr__(name: str) -> type[WebDriverException]:
    """Expose each exception by class name, so a minted one can be imported and caught."""
    try:
        return _BY_NAME[name]
    except KeyError:
        raise AttributeError(f"module {__name__!r} has no attribute {name!r}") from None


def exception_for(code: str | None) -> type[WebDriverException]:
    """The exception class for a wire error code, falling back for an unrecognized one.

    An error the remote end reports must surface as that error even when the code is one
    this schema does not declare, so an unknown code is never a serialization failure.
    """
    return _EXCEPTIONS.get(code, WebDriverException) if code else WebDriverException
