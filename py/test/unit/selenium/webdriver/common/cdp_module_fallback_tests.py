import logging
import re
import types

from selenium.webdriver.common.bidi.cdp import import_devtools


def test_missing_cdp_devtools_version_falls_back(caplog):
    with caplog.at_level(logging.DEBUG, logger="selenium"):
        assert isinstance(import_devtools("will_never_exist"), types.ModuleType)
    # assert the fallback occurred successfully offered up a v{n} option.
    assert re.match(r"Falling back to loading `devtools`: v\d+", caplog.records[-1].msg) is not None
