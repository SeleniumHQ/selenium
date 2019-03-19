import pytest


@pytest.fixture(autouse=True)
def preserve_driver_path():
    from selenium.webdriver import Firefox
    old_driver_path = Firefox.driver_path
    yield
    Firefox.driver_path = old_driver_path

def test_driver_path_default(mocker):
    from selenium.webdriver import Firefox
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.firefox.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.firefox.remote_connection.FirefoxRemoteConnection",
        autospec=True,
    )
    Firefox()
    args = {
        "executable_path": "geckodriver",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_driver_path_override(mocker):
    from selenium.webdriver import Firefox
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.firefox.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.firefox.remote_connection.FirefoxRemoteConnection",
        autospec=True,
    )

    Firefox.driver_path = "/alternate/path"
    Firefox()
    args = {
        "executable_path": "/alternate/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override(mocker):
    from selenium.webdriver import Firefox
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.firefox.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.firefox.remote_connection.FirefoxRemoteConnection",
        autospec=True,
    )

    Firefox(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override_priority_over_driver_path_override(mocker):
    from selenium.webdriver import Firefox
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.firefox.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.firefox.remote_connection.FirefoxRemoteConnection",
        autospec=True,
    )

    Firefox.driver_path = "/alternate/path"
    Firefox(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)
