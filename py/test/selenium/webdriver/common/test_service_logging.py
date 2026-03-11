import sys
import pytest

from selenium import webdriver
from selenium.webdriver.chrome.service import Service

@pytest.mark.chrome
def test_service_allows_reusing_stdout_for_logging():
    browser1 = None
    browser2 = None
    try:
        service1 = Service(log_output=sys.stdout)
        browser1 = webdriver.Chrome(service=service1) # lazy_import
        assert browser1.session_id is not None
        browser1.quit()
        browser1 = None

        service2 = Service(log_output=sys.stdout)
        browser2 = webdriver.Chrome(service=service2) # lazy_import
        assert browser2.session_id is not None

    finally:
        if browser1:
            browser1.quit()
        if browser2:
            browser2.quit()
