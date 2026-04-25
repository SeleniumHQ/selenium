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

import os
import subprocess
import sys
from pathlib import Path
from unittest.mock import patch

import pytest

from selenium.common.exceptions import SessionNotCreatedException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.driver_finder import DriverFinder


@pytest.mark.no_driver_after_test
def test_reuses_chromedriver_log(clean_driver, clean_options, driver_executable) -> None:
    log_file = "chromedriver.log"

    service1 = Service(
        log_output=log_file,
        executable_path=driver_executable,
    )

    service2 = Service(
        log_output=log_file,
        service_args=["--append-log"],
        executable_path=driver_executable,
    )

    driver = None
    try:
        driver = clean_driver(options=clean_options, service=service1)
        with open(log_file) as fp:
            lines = len(fp.readlines())
    finally:
        if driver:
            driver.quit()
    try:
        driver = clean_driver(options=clean_options, service=service2)
        with open(log_file) as fp:
            assert len(fp.readlines()) >= 2 * lines
    finally:
        if driver:
            driver.quit()
        os.remove(log_file)


@pytest.mark.no_driver_after_test
def test_log_output_as_filename(clean_driver, clean_options, driver_executable) -> None:
    log_file = "chromedriver.log"
    service = Service(log_output=log_file, executable_path=driver_executable)
    try:
        assert "--log-path=chromedriver.log" in service.service_args
        driver = clean_driver(options=clean_options, service=service)
        with open(log_file) as fp:
            out = fp.read()
        assert "Starting" in out
        assert "started successfully" in out
    finally:
        driver.quit()
        os.remove(log_file)


@pytest.mark.no_driver_after_test
def test_log_output_as_file(clean_driver, clean_options, driver_executable) -> None:
    log_name = "chromedriver.log"
    log_file = open(log_name, "w", encoding="utf-8")
    service = Service(log_output=log_file, executable_path=driver_executable)
    try:
        driver = clean_driver(options=clean_options, service=service)
        with open(log_name) as fp:
            out = fp.read()
        assert "Starting" in out
        assert "started successfully" in out
    finally:
        driver.quit()
        log_file.close()
        os.remove(log_name)


@pytest.mark.no_driver_after_test
def test_log_output_as_stdout(clean_driver, clean_options, capfd, driver_executable) -> None:
    service = Service(log_output=subprocess.STDOUT, executable_path=driver_executable)
    driver = clean_driver(options=clean_options, service=service)
    out, err = capfd.readouterr()
    assert "Starting" in out
    assert "started successfully" in out
    driver.quit()


@pytest.mark.no_driver_after_test
def test_log_output_null_default(driver, capfd) -> None:
    out, err = capfd.readouterr()
    assert "Starting" not in out
    assert "started successfully" not in out
    driver.quit()


@pytest.mark.xfail(
    sys.platform == "win32", reason="chromedriver doesn't return an error on windows if you use an invalid profile path"
)
@pytest.mark.no_driver_after_test
def test_driver_is_stopped_if_browser_cant_start(clean_driver, clean_options, driver_executable) -> None:
    clean_options.add_argument("--user-data-dir=/no/such/location")
    service = Service(executable_path=driver_executable)
    with pytest.raises(SessionNotCreatedException):
        clean_driver(options=clean_options, service=service)
    assert not service.is_connectable()
    assert service.process.poll() is not None


def test_service_allows_reusing_stdout_for_logging(clean_driver, clean_options, driver_executable) -> None:
    browser1 = None
    browser2 = None
    try:
        service1 = Service(executable_path=driver_executable, log_output=sys.stdout)
        browser1 = clean_driver(service=service1, options=clean_options)
        assert browser1.session_id is not None
        browser1.quit()
        service2 = Service(executable_path=driver_executable, log_output=sys.stdout)
        browser2 = clean_driver(service=service2, options=clean_options)
        assert browser2.session_id is not None
        browser2.quit()
    finally:
        if browser1:
            browser1.quit()
        if browser2:
            browser2.quit()


def _is_within_cache(path: Path, cache_dir: Path) -> bool:
    """Check if a path is within a given cache directory."""
    try:
        path.relative_to(cache_dir)
        return True
    except ValueError:
        return False


@pytest.mark.skipif(
    not os.environ.get("SE_FORCE_BROWSER_DOWNLOAD"),
    reason="Only runs when SE_FORCE_BROWSER_DOWNLOAD is set",
)
def test_selenium_manager_resolves_browser_and_driver(clean_options) -> None:
    """Verify Selenium Manager resolves both driver and browser via DriverFinder.

    These paths should point to executable files downloaded into the SM cache.
    """
    cache_dir = Path(os.environ.get("SE_CACHE_PATH", Path.home() / ".cache" / "selenium"))
    service = Service()
    driver_finder = DriverFinder(service, clean_options)

    driver_path = Path(driver_finder.get_driver_path())
    browser_path = Path(driver_finder.get_browser_path())

    assert driver_path.is_file(), f"Driver not found: {driver_path}"
    assert browser_path.is_file(), f"Browser not found: {browser_path}"

    assert os.access(str(driver_path), os.X_OK), f"Driver not executable: {driver_path}"
    assert os.access(str(browser_path), os.X_OK), f"Browser not executable: {browser_path}"

    assert _is_within_cache(driver_path, cache_dir), f"Driver path outside cache: {driver_path}"
    assert _is_within_cache(browser_path, cache_dir), f"Browser path outside cache: {browser_path}"


@pytest.fixture
def service():
    return Service()


@pytest.mark.usefixtures("service")
class TestChromeDriverService:
    service_path = "/path/to/chromedriver"

    @pytest.fixture(autouse=True)
    def setup_and_teardown(self):
        os.environ["SE_CHROMEDRIVER"] = self.service_path
        yield
        os.environ.pop("SE_CHROMEDRIVER", None)

    def test_uses_path_from_env_variable(self, service):
        assert "chromedriver" in service.path

    def test_updates_path_after_setting_env_variable(self, service):
        service.executable_path = self.service_path  # Simulating the update
        with patch.dict("os.environ", {"SE_CHROMEDRIVER": "/foo/bar"}):
            assert "chromedriver" in service.executable_path
