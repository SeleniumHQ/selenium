import pytest

from selenium.webdriver import (
    Chrome,
    Edge,
    Firefox,
    Ie,
    Opera,
    Safari,
    WebKitGTK,
)

variants = {
    "chrome": {
        "driver": Chrome,
        "default_driver_path": "chromedriver",
        "extra_mocks": [
            "selenium.webdriver.chrome.webdriver.RemoteWebDriver",
            "selenium.webdriver.chrome.webdriver.ChromeRemoteConnection",
        ],
        "service": "selenium.webdriver.chrome.webdriver.Service",
    },
    "edge": {
        "driver": Edge,
        "default_driver_path": "MicrosoftWebDriver.exe",
        "extra_mocks": [
            "selenium.webdriver.edge.webdriver.RemoteWebDriver",
            "selenium.webdriver.edge.webdriver.RemoteConnection",
        ],
        "service": "selenium.webdriver.edge.webdriver.Service",
    },
    "firefox": {
        "driver": Firefox,
        "default_driver_path": "geckodriver",
        "extra_mocks": [
            "selenium.webdriver.firefox.webdriver.RemoteWebDriver",
            "selenium.webdriver.firefox.webdriver.FirefoxRemoteConnection",
        ],
        "service": "selenium.webdriver.firefox.webdriver.Service",
    },
    "ie": {
        "driver": Ie,
        "default_driver_path": "IEDriverServer.exe",
        "extra_mocks": [
            "selenium.webdriver.ie.webdriver.RemoteWebDriver",
        ],
        "service": "selenium.webdriver.ie.webdriver.Service",
    },
    "opera": {
        "driver": Opera,
        "default_driver_path": "operadriver",
        "extra_mocks": [
            "selenium.webdriver.chrome.webdriver.RemoteWebDriver",
            "selenium.webdriver.chrome.webdriver.ChromeRemoteConnection",
        ],
        "service": "selenium.webdriver.chrome.webdriver.Service",
    },
    "safari": {
        "driver": Safari,
        "default_driver_path": "/usr/bin/safaridriver",
        "extra_mocks": [
            "selenium.webdriver.safari.webdriver.RemoteWebDriver",
            "selenium.webdriver.safari.webdriver.SafariRemoteConnection",
        ],
        "service": "selenium.webdriver.safari.webdriver.Service",
    },
    "webkitgtk": {
        "driver": WebKitGTK,
        "default_driver_path": "WebKitWebDriver",
        "extra_mocks": [
            "selenium.webdriver.webkitgtk.webdriver.RemoteWebDriver",
        ],
        "service": "selenium.webdriver.webkitgtk.webdriver.Service",
    },
}


@pytest.fixture(params=list(variants.keys()), autouse=True)
def driver_variant(request):
    """The name of the driver variant.

    This will be used as a key to access other information about the driver from
    the variants dict. This will also operate as a simple means to differentiate
    between the tests of one variant versus another in the names of the tests.
    """
    return request.param


@pytest.fixture(autouse=True)
def mocked_service(mocker, driver_variant):
    """Mock everything that's needed, and return the mock of the service object.
    """
    for extra in variants[driver_variant]["extra_mocks"]:
        mocker.patch(extra, autospec=True)
    mocked_service = mocker.patch(
        variants[driver_variant]["service"],
        autospec=True,
    )
    return mocked_service


@pytest.mark.usesfixtures("mocked_service")
@pytest.fixture(autouse=True)
def driver(driver_variant):
    """Preserve the driver_path and provide the WebDriver's class."""
    d = variants[driver_variant]["driver"]
    old_driver_path = d.driver_path
    yield d
    d.driver_path = old_driver_path


@pytest.fixture
def default_driver_path(driver_variant):
    return variants[driver_variant]["default_driver_path"]


def test_driver_path_default(mocked_service, default_driver_path, driver):
    driver()
    service_call_kwargs = mocked_service.call_args[-1]
    assert service_call_kwargs["executable_path"] == default_driver_path


def test_driver_path_override(mocked_service, driver):
    driver.driver_path = "/alternate/path"
    driver()
    service_call_kwargs = mocked_service.call_args[-1]
    assert service_call_kwargs["executable_path"] == "/alternate/path"


def test_executable_path_override(mocked_service, driver):
    driver(executable_path="/alternate/other/path")
    service_call_kwargs = mocked_service.call_args[-1]
    assert service_call_kwargs["executable_path"] == "/alternate/other/path"


def test_executable_path_overrides_driver_path_override(mocked_service, driver):
    driver.driver_path = "/alternate/path"
    driver(executable_path="/alternate/other/path")
    service_call_kwargs = mocked_service.call_args[-1]
    assert service_call_kwargs["executable_path"] == "/alternate/other/path"


def test_prev_executable_path_does_not_override_driver_path(mocker,
                                                            mocked_service,
                                                            default_driver_path,
                                                            driver):
    driver(executable_path="/alternate/other/path")
    driver()
    service_call_kwargs = mocked_service.call_args[-1]
    assert service_call_kwargs["executable_path"] == default_driver_path
