import pytest


@pytest.fixture(autouse=True)
def preserve_driver_path():
    from selenium.webdriver import Safari
    old_driver_path = Safari.driver_path
    yield
    Safari.driver_path = old_driver_path

def test_driver_path_default(mocker):
    from selenium.webdriver import Safari
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.safari.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.safari.remote_connection.SafariRemoteConnection",
        autospec=True,
    )
    Safari()
    args = {
        "executable_path": "/usr/bin/safaridriver",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_driver_path_override(mocker):
    from selenium.webdriver import Safari
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.safari.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.safari.remote_connection.SafariRemoteConnection",
        autospec=True,
    )

    Safari.driver_path = "/alternate/path"
    Safari()
    args = {
        "executable_path": "/alternate/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override(mocker):
    from selenium.webdriver import Safari
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.safari.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.safari.remote_connection.SafariRemoteConnection",
        autospec=True,
    )

    Safari(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override_priority_over_driver_path_override(mocker):
    from selenium.webdriver import Safari
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.safari.service.Service",
        autospec=True,
    )
    mocker.patch(
        "selenium.webdriver.safari.remote_connection.SafariRemoteConnection",
        autospec=True,
    )

    Safari.driver_path = "/alternate/path"
    Safari(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)
