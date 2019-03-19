import pytest


@pytest.fixture(autouse=True)
def preserve_driver_path():
    from selenium.webdriver import Opera
    old_driver_path = Opera.driver_path
    yield
    Opera.driver_path = old_driver_path


def test_driver_path_default(mocker):
    from selenium.webdriver import Opera
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.chrome.service.Service",
        autospec=True,
    )
    Opera()
    args = {
        "executable_path": "operadriver",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_driver_path_override(mocker):
    from selenium.webdriver import Opera
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.chrome.service.Service",
        autospec=True,
    )

    Opera.driver_path = "/alternate/path"
    Opera()
    args = {
        "executable_path": "/alternate/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override(mocker):
    from selenium.webdriver import Opera
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.chrome.service.Service",
        autospec=True,
    )

    Opera(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override_priority_over_driver_path_override(mocker):
    from selenium.webdriver import Opera
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.chrome.service.Service",
        autospec=True,
    )

    Opera.driver_path = "/alternate/path"
    Opera(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)
