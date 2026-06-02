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

import http.server
import json
import logging
import os
import socketserver
import sys
import threading
import time
import types
from dataclasses import dataclass
from pathlib import Path

import pytest
import rich.console
import rich.traceback
import urllib3

try:
    from python.runfiles import Runfiles  # only exists when using bazel
except ModuleNotFoundError:
    Runfiles = None

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.utils import free_port
from selenium.webdriver.remote.server import Server
from test.selenium.webdriver.common.network import get_lan_ip
from test.selenium.webdriver.common.webserver import SimpleWebServer

logger = logging.getLogger(__name__)

drivers = (
    "chrome",
    "edge",
    "firefox",
    "ie",
    "safari",
    "webkitgtk",
    "wpewebkit",
)


TRACEBACK_WIDTH = 130
# don't force colors on RBE since errors get redirected to a log file
force_terminal = "REMOTE_BUILD" not in os.environ
console = rich.console.Console(force_terminal=force_terminal, width=TRACEBACK_WIDTH)


def extract_traceback_frames(tb):
    """Extract frames from a traceback object."""
    frames = []
    while tb:
        if hasattr(tb, "tb_frame") and hasattr(tb, "tb_lineno"):
            # Skip frames without source files
            if Path(tb.tb_frame.f_code.co_filename).exists():
                frames.append((tb.tb_frame, tb.tb_lineno, getattr(tb, "tb_lasti", 0)))
        tb = getattr(tb, "tb_next", None)
    return frames


def filter_frames(frames):
    """Filter out frames from pytest internals."""
    skip_modules = ["pytest", "_pytest", "pluggy"]
    filtered = []
    for frame, lineno, lasti in reversed(frames):
        mod_name = frame.f_globals.get("__name__", "")
        if not any(skip in mod_name for skip in skip_modules):
            filtered.append((frame, lineno, lasti))
    return filtered


def rebuild_traceback(frames):
    """Rebuild a traceback object from frames list."""
    new_tb = None
    for frame, lineno, lasti in frames:
        new_tb = types.TracebackType(new_tb, frame, lasti, lineno)
    return new_tb


def pytest_runtest_makereport(item, call):
    """Hook to print Rich traceback for test failures."""
    if call.excinfo is None:
        return
    exc_type = call.excinfo.type
    exc_value = call.excinfo.value
    exc_tb = call.excinfo.tb
    frames = extract_traceback_frames(exc_tb)
    filtered_frames = filter_frames(frames)
    new_tb = rebuild_traceback(filtered_frames)
    tb = rich.traceback.Traceback.from_exception(
        exc_type,
        exc_value,
        new_tb,
        show_locals=False,
        max_frames=5,
        width=TRACEBACK_WIDTH,
    )
    console.print("\n", tb)


def pytest_addoption(parser):
    parser.addoption(
        "--driver",
        action="append",
        choices=drivers,
        dest="drivers",
        metavar="DRIVER",
        help="Driver to run tests against ({})".format(", ".join(drivers)),
    )
    parser.addoption(
        "--browser",
        action="append",
        choices=drivers,
        dest="drivers",
        metavar="BROWSER",
        help="Browser to run tests against (alias for --driver)",
    )
    parser.addoption(
        "--browser-binary",
        action="store",
        dest="binary",
        help="Location of the browser binary",
    )
    parser.addoption(
        "--driver-binary",
        action="store",
        dest="executable",
        help="Location of the service executable binary",
    )
    parser.addoption(
        "--browser-args",
        action="store",
        dest="args",
        help="Arguments to start the browser with",
    )
    parser.addoption(
        "--headless",
        action="store_true",
        dest="headless",
        help="Run tests in headless mode",
    )
    parser.addoption(
        "--use-lan-ip",
        action="store_true",
        dest="use_lan_ip",
        help="Start test server with lan ip instead of localhost",
    )
    parser.addoption(
        "--bidi",
        action="store_true",
        dest="bidi",
        help="Enable BiDi support",
    )
    parser.addoption(
        "--remote",
        action="store_true",
        dest="remote",
        help="Run tests against a remote Grid server",
    )


def pytest_ignore_collect(collection_path, config):
    drivers_opt = config.getoption("drivers")
    _drivers = set(drivers).difference(drivers_opt or drivers)
    if drivers_opt:
        _drivers.add("unit")
    if len([d for d in _drivers if d.lower() in collection_path.parts]) > 0:
        return True
    return None


def pytest_generate_tests(metafunc):
    if "driver" in metafunc.fixturenames and metafunc.config.option.drivers:
        metafunc.parametrize("driver", metafunc.config.option.drivers, indirect=True)


selenium_driver = None


def _resolve_bazel_path(path):
    """Resolve a path through Bazel Rlocation if the given path does not exist on disk.

    When running under Bazel, paths from ctx.expand_location are relative to
    the execroot (e.g. 'external/+ext+repo/binary') which may not resolve from
    the test process CWD. Rlocation maps them to their absolute runfiles location.
    """
    if not path:
        return path
    cleaned = path.strip("'")
    if Path(cleaned).exists():
        return path
    if Runfiles is not None and cleaned.startswith("external/"):
        r = Runfiles.Create()
        resolved = r.Rlocation(cleaned.removeprefix("external/"))
        if resolved:
            return resolved
    return path


# Maps the test driver name to its (browserName, vendor options key).
_GRID_VENDOR_OPTIONS = {
    "chrome": ("chrome", "goog:chromeOptions"),
    "edge": ("MicrosoftEdge", "ms:edgeOptions"),
    "firefox": ("firefox", "moz:firefoxOptions"),
}


def _pinned_grid_args(config):
    """Pin the driver and browser in a driver-configuration so the Grid node skips Selenium Manager.

    Returns an empty list when nothing is pinned, keeping the default Selenium Manager behavior.
    """
    drivers_opt = config.option.drivers or []
    driver = next((d for d in drivers_opt if d.lower() in _GRID_VENDOR_OPTIONS), None)
    executable = config.option.executable  # --driver-binary
    binary = config.option.binary  # --browser-binary
    if not (driver and executable and binary):
        return []

    driver_path = _resolve_bazel_path(executable).strip("'")
    browser_path = _resolve_bazel_path(binary).strip("'")
    browser_name, vendor_key = _GRID_VENDOR_OPTIONS[driver.lower()]
    stereotype = json.dumps({"browserName": browser_name, vendor_key: {"binary": browser_path}})
    return [
        "--enable-managed-downloads",
        "true",
        "--detect-drivers",
        "false",
        "--driver-configuration",
        f"display-name={driver}",
        "max-sessions=1",
        f"webdriver-executable={driver_path}",
        f"stereotype={stereotype}",
    ]


def get_extensions_location():
    """Locate the test extensions directory.

    Use Runfiles to locate it if running with bazel, otherwise find it in the local source tree.
    """
    if Runfiles is not None:
        r = Runfiles.Create()
        extensions = r.Rlocation("selenium/py/test/extensions")
    else:
        extensions = str((Path(__file__).parent.parent / "common" / "extensions").resolve())
    return extensions


class ContainerProtocol:
    def __contains__(self, name):
        if name.lower() in self.__dict__:
            return True
        return False


@dataclass
class SupportedDrivers(ContainerProtocol):
    chrome: str = "Chrome"
    firefox: str = "Firefox"
    safari: str = "Safari"
    edge: str = "Edge"
    ie: str = "Ie"
    webkitgtk: str = "WebKitGTK"
    wpewebkit: str = "WPEWebKit"


@dataclass
class SupportedOptions(ContainerProtocol):
    chrome: str = "ChromeOptions"
    firefox: str = "FirefoxOptions"
    edge: str = "EdgeOptions"
    safari: str = "SafariOptions"
    ie: str = "IeOptions"
    webkitgtk: str = "WebKitGTKOptions"
    wpewebkit: str = "WPEWebKitOptions"


@dataclass
class SupportedBidiDrivers(ContainerProtocol):
    chrome: str = "Chrome"
    firefox: str = "Firefox"
    edge: str = "Edge"


class Driver:
    DRIVER_START_RETRIES = 3
    DRIVER_START_INTERVAL = 1

    def __init__(self, driver_class, request):
        self.driver_class = driver_class
        self._request = request
        self._driver = None
        self._service = None
        self._server = None
        self.options = driver_class
        self.headless = driver_class
        self.bidi = driver_class

    @classmethod
    def clean_options(cls, driver_class, request):
        return cls(driver_class, request).options

    @property
    def supported_drivers(self):
        return SupportedDrivers()

    @property
    def supported_options(self):
        return SupportedOptions()

    @property
    def supported_bidi_drivers(self):
        return SupportedBidiDrivers()

    @property
    def driver_class(self):
        return self._driver_class

    @driver_class.setter
    def driver_class(self, cls_name):
        if cls_name.lower() not in self.supported_drivers:
            raise AttributeError(f"Invalid driver class {cls_name.lower()}")
        self._driver_class = getattr(self.supported_drivers, cls_name.lower())

    @property
    def exe_platform(self):
        if sys.platform == "win32":
            return "Windows"
        elif sys.platform == "darwin":
            return "Darwin"
        elif sys.platform == "linux":
            return "Linux"
        else:
            return sys.platform.title()

    @property
    def browser_path(self):
        if self._request.config.option.binary:
            return _resolve_bazel_path(self._request.config.option.binary)
        return None

    @property
    def browser_args(self):
        if self._request.config.option.args:
            return self._request.config.option.args
        return None

    @property
    def driver_path(self):
        if self._request.config.option.executable:
            return _resolve_bazel_path(self._request.config.option.executable)
        return None

    @property
    def headless(self):
        return self._headless

    @headless.setter
    def headless(self, cls_name):
        self._headless = self._request.config.option.headless
        if self._headless:
            if cls_name.lower() == "chrome" or cls_name.lower() == "edge":
                self._options.add_argument("--headless")
            if cls_name.lower() == "firefox":
                self._options.add_argument("-headless")

    @property
    def bidi(self):
        return self._bidi

    @bidi.setter
    def bidi(self, cls_name):
        self._bidi = self._request.config.option.bidi
        if self._bidi:
            self._options.web_socket_url = True
            self._options.unhandled_prompt_behavior = "ignore"

    @property
    def options(self):
        return self._options

    @options.setter
    def options(self, cls_name):
        if cls_name.lower() not in self.supported_options:
            raise AttributeError(f"Invalid Options class {cls_name.lower()}")

        if self.driver_class == self.supported_drivers.firefox:
            self._options = getattr(webdriver, self.supported_options.firefox)()
            if self.exe_platform == "Linux":
                # There are issues with window size/position when running Firefox
                # under Wayland, so we use XWayland instead.
                os.environ["MOZ_ENABLE_WAYLAND"] = "0"
        else:
            opts_cls = getattr(self.supported_options, cls_name.lower())
            self._options = getattr(webdriver, opts_cls)()

        if cls_name.lower() in ("chrome", "edge"):
            self._options.add_argument("--disable-dev-shm-usage")

        if self.is_remote:
            self._options.enable_downloads = True

        if self.browser_path or self.browser_args:
            if self.driver_class == self.supported_drivers.webkitgtk:
                self._options.overlay_scrollbars_enabled = False
            if self.browser_path is not None:
                self._options.binary_location = self.browser_path.strip("'")
            if self.browser_args is not None:
                for arg in self.browser_args.split():
                    self._options.add_argument(arg)

    @property
    def service(self):
        executable = self.driver_path
        if executable:
            module = getattr(webdriver, self.driver_class.lower())
            self._service = module.service.Service(executable_path=executable)
            return self._service
        return None

    @property
    def driver(self):
        if self._driver is None:
            self._driver = self._initialize_driver()
        return self._driver

    @property
    def is_platform_valid(self):
        if self.driver_class.lower() == "safari" and self.exe_platform != "Darwin":
            return False
        if self.driver_class.lower() == "ie" and self.exe_platform != "Windows":
            return False
        if "webkit" in self.driver_class.lower() and self.exe_platform == "Windows":
            return False
        return True

    @property
    def is_remote(self):
        return self._request.config.getoption("remote")

    def _initialize_driver(self):
        kwargs = {}
        if self.options is not None:
            kwargs["options"] = self.options
        if self.is_remote:
            kwargs["command_executor"] = self._server.status_url.removesuffix("/status")
            return webdriver.Remote(**kwargs)
        return self._start_local_driver(kwargs)

    def _start_local_driver(self, kwargs):
        for attempt in range(1, self.DRIVER_START_RETRIES + 1):
            if self.driver_path is not None:
                kwargs["service"] = self.service
            try:
                return getattr(webdriver, self.driver_class)(**kwargs)
            except (WebDriverException, urllib3.exceptions.HTTPError, OSError) as e:
                if attempt == self.DRIVER_START_RETRIES:
                    raise
                logger.warning(
                    "%s failed to start (attempt %s/%s); retrying. Error: %s",
                    self.driver_class,
                    attempt,
                    self.DRIVER_START_RETRIES,
                    e,
                )
                time.sleep(self.DRIVER_START_INTERVAL)

    def stop_driver(self):
        driver_to_stop = self._driver
        self._driver = None
        if driver_to_stop is not None:
            driver_to_stop.quit()


@pytest.fixture
def driver(request, server):
    global selenium_driver
    driver_class = getattr(request, "param", "Chrome").lower()

    if selenium_driver is None:
        selenium_driver = Driver(driver_class, request)
    if server:
        selenium_driver._server = server

    # skip tests if not available on the platform
    if not selenium_driver.is_platform_valid:
        pytest.skip(f"{driver_class} tests can only run on {selenium_driver.exe_platform}")

    # skip tests in the 'remote' directory if not running with --remote flag
    if request.node.path.parts[-2] == "remote" and not selenium_driver.is_remote:
        pytest.skip("Remote tests require the --remote flag")

    # skip tests for drivers that don't support BiDi when --bidi is enabled
    if selenium_driver.bidi:
        if driver_class.lower() not in selenium_driver.supported_bidi_drivers:
            pytest.skip(f"{driver_class} does not support BiDi")

    # conditionally mark tests as expected to fail based on driver
    marker = request.node.get_closest_marker(f"xfail_{driver_class.lower()}")
    # Also check for xfail_remote when running with --remote
    if marker is None and selenium_driver.is_remote:
        marker = request.node.get_closest_marker("xfail_remote")
    if marker is not None:
        kwargs = dict(marker.kwargs)
        # Support condition kwarg - if condition is False, skip the xfail
        condition = kwargs.pop("condition", True)
        if callable(condition):
            condition = condition()
        if condition:
            if "run" in kwargs:
                if not kwargs["run"]:
                    pytest.skip()
                    yield
                    return
            kwargs.pop("raises", None)
            pytest.xfail(**kwargs)

    # For BiDi tests, only restart driver when explicitly marked as needing fresh driver.
    # Tests marked with @pytest.mark.needs_fresh_driver get full driver restart for test isolation.
    # Cleanup after every test is recommended.
    if selenium_driver is not None and selenium_driver.bidi:
        if request.node.get_closest_marker("needs_fresh_driver"):
            request.addfinalizer(selenium_driver.stop_driver)
        else:

            def ensure_valid_window():
                try:
                    driver = selenium_driver._driver
                    if driver:
                        try:
                            # Check if current window is still valid
                            driver.current_window_handle
                        except Exception:
                            # restart driver
                            selenium_driver.stop_driver()
                except Exception:
                    pass

            request.addfinalizer(ensure_valid_window)  # noqa: PT021

    yield selenium_driver.driver

    if request.node.get_closest_marker("no_driver_after_test"):
        if selenium_driver is not None:
            try:
                selenium_driver.stop_driver()
            except WebDriverException:
                pass
            except Exception:
                raise
            selenium_driver = None


@pytest.fixture(scope="session", autouse=True)
def stop_driver(request):
    def fin():
        global selenium_driver
        if selenium_driver is not None:
            selenium_driver.stop_driver()
        selenium_driver = None

    request.addfinalizer(fin)  # noqa: PT021


def pytest_exception_interact(node, call, report):
    if report.failed:
        global selenium_driver
        if selenium_driver is not None:
            selenium_driver.stop_driver()
        selenium_driver = None


@pytest.fixture
def pages(driver, webserver):
    class Pages:
        def url(self, name, localhost=False):
            return webserver.where_is(name, localhost)

        def load(self, name):
            driver.get(self.url(name))

    return Pages()


@pytest.fixture(autouse=True, scope="session")
def server(request):
    is_remote = request.config.getoption("remote")
    if not is_remote:
        yield None
        return

    remote_env = os.environ.copy()
    if sys.platform == "linux":
        # There are issues with window size/position when running Firefox
        # under Wayland, so we use XWayland instead.
        remote_env["MOZ_ENABLE_WAYLAND"] = "0"

    server = Server(env=remote_env, startup_timeout=60, args=_pinned_grid_args(request.config) or None)

    repo_root = Path(__file__).parent.parent  # py/conftest.py -> py/ -> selenium/
    jar_path = "java/src/org/openqa/selenium/grid/selenium_server_deploy.jar"

    if Path(jar_path).exists():
        # Found in runfiles (bazel test) - relative to cwd
        server.path = jar_path
    elif (repo_root / "bazel-bin" / jar_path).exists():
        # Found in bazel-bin relative to repo root (pytest from anywhere)
        server.path = str(repo_root / "bazel-bin" / jar_path)

    java_location_env = os.environ.get("SE_BAZEL_JAVA_LOCATION")
    if Runfiles is not None and java_location_env:
        # Find bazel's Java
        r = Runfiles.Create()
        java_location_txt = r.Rlocation("_main/" + java_location_env)
        try:
            rel_path = Path(java_location_txt).read_text().strip().removeprefix("external/")
            java_path = r.Rlocation(rel_path)
            if sys.platform == "win32" and java_path and os.path.exists(java_path):
                java_path = os.path.realpath(java_path)
            server.java_path = java_path
        except Exception:
            pass

    server.port = free_port()
    server.start()
    yield server
    server.stop()


@pytest.fixture(autouse=True, scope="session")
def webserver(request):
    host = get_lan_ip() if request.config.getoption("use_lan_ip") else None

    webserver = SimpleWebServer(host=host)
    webserver.start()
    yield webserver
    webserver.stop()


@pytest.fixture
def edge_service():
    from selenium.webdriver.edge.service import Service as EdgeService

    return EdgeService


@pytest.fixture
def driver_executable(request):
    return _resolve_bazel_path(request.config.option.executable)


@pytest.fixture
def clean_driver(request):
    _supported_drivers = SupportedDrivers()
    try:
        driver_class = getattr(_supported_drivers, request.config.option.drivers[0].lower())
    except (AttributeError, TypeError):
        raise Exception("This test requires a --driver to be specified.")
    driver_reference = getattr(webdriver, driver_class)

    # conditionally mark tests as expected to fail based on driver
    marker = request.node.get_closest_marker(f"xfail_{driver_class.lower()}")
    # Also check for xfail_remote when running with --remote
    if marker is None and request.config.getoption("remote"):
        marker = request.node.get_closest_marker("xfail_remote")
    if marker is not None:
        kwargs = dict(marker.kwargs)
        if "run" in kwargs:
            if not kwargs["run"]:
                pytest.skip()
                yield
                return
        kwargs.pop("raises", None)
        pytest.xfail(**kwargs)

    yield driver_reference

    if request.node.get_closest_marker("no_driver_after_test"):
        driver_reference = None


@pytest.fixture
def clean_service(request):
    driver_class = request.config.option.drivers[0].lower()
    selenium_driver = Driver(driver_class, request)
    return selenium_driver.service


@pytest.fixture
def clean_options(request):
    driver_class = request.config.option.drivers[0].lower()
    return Driver.clean_options(driver_class, request)


@pytest.fixture
def firefox_options(request):
    try:
        driver_class = request.config.option.drivers[0].lower()
    except (AttributeError, TypeError):
        raise Exception("This test requires a --driver to be specified")

    # skip if not Firefox
    if driver_class != "firefox":
        pytest.skip(f"This test requires Firefox. Got {driver_class}")

    # skip tests in the 'remote' directory if not running with --remote flag
    is_remote = request.config.getoption("remote")
    if request.node.path.parts[-2] == "remote" and not is_remote:
        pytest.skip("Remote tests require the --remote flag")

    options = Driver.clean_options("firefox", request)

    return options


@pytest.fixture
def chromium_options(request):
    try:
        driver_class = request.config.option.drivers[0].lower()
    except (AttributeError, TypeError):
        raise Exception("This test requires a --driver to be specified")

    # skip if not Chrome or Edge
    if driver_class not in ("chrome", "edge"):
        pytest.skip(f"This test requires Chrome or Edge. Got {driver_class}")

    # skip tests in the 'remote' directory if not running with --remote flag
    is_remote = request.config.getoption("remote")
    if request.node.path.parts[-2] == "remote" and not is_remote:
        pytest.skip("Remote tests require the --remote flag")

    options = Driver.clean_options(driver_class, request)

    return options


@pytest.fixture
def proxy_server():
    """Creates HTTP proxy servers with custom response content, cleans up after the test."""
    servers = []

    def create_server(response_content=b"test response"):
        port = free_port()

        class CustomHandler(http.server.SimpleHTTPRequestHandler):
            def do_GET(self):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(response_content)

        server = socketserver.TCPServer(("localhost", port), CustomHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()

        servers.append(server)
        return {"port": port, "server": server}

    yield create_server

    for server in servers:
        server.shutdown()
        server.server_close()
