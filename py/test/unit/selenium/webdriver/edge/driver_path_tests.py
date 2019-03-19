import pytest


@pytest.fixture(autouse=True)
def preserve_driver_path():
    from selenium.webdriver import Edge
    old_driver_path = Edge.driver_path
    yield
    Edge.driver_path = old_driver_path

def test_driver_path_default(mocker):
    from selenium.webdriver import Edge
    from selenium.webdriver.edge.service import Service
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.edge.service.Service",
        autospec=True,
    )
    Edge()
    args = {
        "executable_path": "MicrosoftWebDriver.exe",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_driver_path_override(mocker):
    from selenium.webdriver import Edge
    from selenium.webdriver.edge.service import Service
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.edge.service.Service",
        autospec=True,
    )

    Edge.driver_path = "/alternate/path"
    Edge()
    args = {
        "executable_path": "/alternate/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override(mocker):
    from selenium.webdriver import Edge
    from selenium.webdriver.edge.service import Service
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.edge.service.Service",
        autospec=True,
    )

    Edge(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)


def test_executable_path_override_priority_over_driver_path_override(mocker):
    from selenium.webdriver import Edge
    from selenium.webdriver.edge.service import Service
    mocker.patch("selenium.webdriver.remote.webdriver.WebDriver", autospec=True)
    mocked_service = mocker.patch(
        "selenium.webdriver.edge.service.Service",
        autospec=True,
    )

    Edge.driver_path = "/alternate/path"
    Edge(executable_path="/alternate/other/path")
    args = {
        "executable_path": "/alternate/other/path",
        "port": mocker.ANY,
        "service_args": mocker.ANY,
        "log_path": mocker.ANY,
        "env": mocker.ANY,
    }
    mocked_service.__init__.assert_called_with(args)
