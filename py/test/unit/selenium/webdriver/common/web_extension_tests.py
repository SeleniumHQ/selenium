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

import base64
import io
import warnings
import zipfile

import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.web_extension import WebExtension
from selenium.webdriver.firefox.webdriver import WebDriver as FirefoxWebDriver
from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver

EXTENSION_ID = "webextensions-selenium-example-v3@example.com"


class FakeWebExtensionModule:
    """Stands in for the BiDi webExtension module, recording what it was asked to do."""

    def __init__(self):
        self.installs = []
        self.uninstalls = []

    def install(self, **kwargs):
        self.installs.append(kwargs)
        return {"extension": EXTENSION_ID}

    def uninstall(self, extension):
        self.uninstalls.append(extension)


class FakeCommandExecutor:
    """Stands in for RemoteConnection's command registry.

    `webdriver.Remote` starts with the plain registry, which has no Firefox
    classic addon endpoints; `webdriver.Firefox` adds them in its own connection.
    """

    def __init__(self, firefox_commands):
        self._commands = {}
        if firefox_commands:
            self._commands["INSTALL_ADDON"] = ("POST", "/session/$sessionId/moz/addon/install")
            self._commands["UNINSTALL_ADDON"] = ("POST", "/session/$sessionId/moz/addon/uninstall")

    def add_command(self, name, method, url):
        self._commands[name] = (method, url)

    def get_command(self, name):
        return self._commands.get(name)


class SessionlessDriver(WebDriver):
    """A driver with its transport replaced by recorders, built without a session."""

    def __init__(
        self,
        browser_name="firefox",
        bidi=True,
        remote=False,
        upload_supported=True,
        firefox_commands=True,
    ):
        self.caps = {"browserName": browser_name}
        if bidi:
            self.caps["webSocketUrl"] = "ws://localhost:4444/session/1"
        self._is_remote = remote
        self._upload_supported = upload_supported
        self.commands = []
        self.uploaded = []
        self.command_executor = FakeCommandExecutor(firefox_commands)
        self.webextension_module = FakeWebExtensionModule()
        # Satisfy the `webextension` property without opening a websocket.
        self._websocket_connection = object()
        self._webextension = self.webextension_module

    def execute(self, driver_command, params=None):
        if driver_command in ("INSTALL_ADDON", "UNINSTALL_ADDON"):
            # RemoteConnection.execute asserts on an unregistered command.
            assert self.command_executor.get_command(driver_command) is not None, (
                f"Unrecognised command {driver_command}"
            )
        self.commands.append((driver_command, params))
        if driver_command == Command.UPLOAD_FILE:
            if not self._upload_supported:
                raise WebDriverException("Unrecognized command: POST /session/1/se/file")
            self.uploaded.append(params["file"])
            return {"value": "/remote/uploads/webextensions-selenium-example"}
        if driver_command == "INSTALL_ADDON":
            return {"value": EXTENSION_ID}
        return {"value": None}

    def command_params(self, name):
        return [params for command, params in self.commands if command == name]


class SessionlessFirefoxDriver(SessionlessDriver, FirefoxWebDriver):
    """Adds the Firefox-only classic methods to the recording driver."""


@pytest.fixture
def extension_dir(tmp_path):
    directory = tmp_path / "webextensions-selenium-example"
    (directory / "content").mkdir(parents=True)
    (directory / "manifest.json").write_text('{"manifest_version": 3}')
    (directory / "content" / "inject.js").write_text("// injected")
    return directory


@pytest.fixture
def extension_archive(tmp_path):
    archive = tmp_path / "webextensions-selenium-example.xpi"
    archive.write_bytes(b"PK\x03\x04 not really a zip, but the bytes must survive the trip")
    return archive


def zip_entries(encoded):
    with zipfile.ZipFile(io.BytesIO(base64.b64decode(encoded))) as archive:
        return sorted(archive.namelist())


class TestWebExtensionType:
    def test_wraps_the_id_the_browser_assigned(self):
        assert WebExtension(EXTENSION_ID).id == EXTENSION_ID

    def test_extensions_with_the_same_id_are_equal(self):
        assert WebExtension(EXTENSION_ID) == WebExtension(EXTENSION_ID)
        assert WebExtension(EXTENSION_ID) != WebExtension("other@example.com")

    def test_repr_shows_the_id(self):
        assert EXTENSION_ID in repr(WebExtension(EXTENSION_ID))


class TestInstallOverBiDi:
    def test_returns_a_web_extension_wrapping_the_id(self, extension_dir):
        driver = SessionlessDriver()

        extension = driver.install_web_extension(str(extension_dir))

        assert isinstance(extension, WebExtension)
        assert extension.id == EXTENSION_ID

    def test_local_session_installs_a_directory_by_path(self, extension_dir):
        driver = SessionlessDriver(remote=False)

        driver.install_web_extension(str(extension_dir))

        assert driver.webextension_module.installs == [{"path": str(extension_dir)}]
        assert driver.command_params(Command.UPLOAD_FILE) == []

    def test_remote_session_uploads_a_directory_and_installs_the_returned_path(self, extension_dir):
        driver = SessionlessDriver(remote=True)

        driver.install_web_extension(str(extension_dir))

        assert driver.webextension_module.installs == [{"path": "/remote/uploads/webextensions-selenium-example"}]

    def test_uploaded_archive_keeps_the_directory_as_its_only_root_entry(self, extension_dir):
        # The Grid rejects an upload that unpacks to more than one top-level entry,
        # and answers with the path of the single entry it did find.
        driver = SessionlessDriver(remote=True)

        driver.install_web_extension(str(extension_dir))

        entries = zip_entries(driver.uploaded[0])
        assert entries == [
            "webextensions-selenium-example/content/inject.js",
            "webextensions-selenium-example/manifest.json",
        ]

    def test_trailing_separator_does_not_flatten_the_upload(self, extension_dir):
        driver = SessionlessDriver(remote=True)

        driver.install_web_extension(f"{extension_dir}/")

        assert {entry.split("/")[0] for entry in zip_entries(driver.uploaded[0])} == {"webextensions-selenium-example"}

    def test_remote_session_without_upload_support_raises(self, extension_dir):
        driver = SessionlessDriver(remote=True, upload_supported=False)

        with pytest.raises(WebDriverException, match="upload"):
            driver.install_web_extension(str(extension_dir))

    def test_archive_is_sent_inline_as_base64(self, extension_archive):
        driver = SessionlessDriver(remote=True)

        driver.install_web_extension(str(extension_archive))

        installed = driver.webextension_module.installs[0]
        assert base64.b64decode(installed["base64_value"]) == extension_archive.read_bytes()
        assert driver.command_params(Command.UPLOAD_FILE) == []

    def test_base64_is_passed_through_untouched(self):
        driver = SessionlessDriver()
        encoded = base64.b64encode(b"already encoded").decode("utf-8")

        driver.install_web_extension(encoded)

        assert driver.webextension_module.installs == [{"base64_value": encoded}]

    def test_firefox_options_are_forwarded(self, extension_dir):
        driver = SessionlessDriver(browser_name="firefox")

        driver.install_web_extension(str(extension_dir), permanent=True, allow_private_browsing=True)

        assert driver.webextension_module.installs == [
            {"path": str(extension_dir), "permanent": True, "allow_private_browsing": True}
        ]

    def test_firefox_options_are_rejected_on_chromium(self, extension_dir):
        driver = SessionlessDriver(browser_name="chrome")

        with pytest.raises(ValueError, match="permanent"):
            driver.install_web_extension(str(extension_dir), permanent=True)


class TestUninstallOverBiDi:
    def test_uninstalls_by_the_wrapped_id(self, extension_dir):
        driver = SessionlessDriver()
        extension = driver.install_web_extension(str(extension_dir))

        driver.uninstall_web_extension(extension)

        assert driver.webextension_module.uninstalls == [EXTENSION_ID]

    def test_a_raw_id_is_rejected(self):
        driver = SessionlessDriver()

        with pytest.raises(TypeError, match="WebExtension"):
            driver.uninstall_web_extension(EXTENSION_ID)


class TestWithoutBiDi:
    def test_firefox_installs_a_directory_over_the_classic_endpoint(self, extension_dir):
        driver = SessionlessDriver(browser_name="firefox", bidi=False)

        extension = driver.install_web_extension(str(extension_dir))

        assert extension.id == EXTENSION_ID
        payload = driver.command_params("INSTALL_ADDON")[0]
        # The classic endpoint takes the extension's own contents at the archive root.
        assert zip_entries(payload["addon"]) == ["content/inject.js", "manifest.json"]

    def test_firefox_installs_an_archive_over_the_classic_endpoint(self, extension_archive):
        driver = SessionlessDriver(browser_name="firefox", bidi=False)

        driver.install_web_extension(str(extension_archive))

        payload = driver.command_params("INSTALL_ADDON")[0]
        assert base64.b64decode(payload["addon"]) == extension_archive.read_bytes()
        assert "temporary" not in payload

    def test_firefox_maps_permanent_onto_the_classic_temporary_flag(self, extension_archive):
        driver = SessionlessDriver(browser_name="firefox", bidi=False)

        driver.install_web_extension(str(extension_archive), permanent=False, allow_private_browsing=True)

        payload = driver.command_params("INSTALL_ADDON")[0]
        assert payload["temporary"] is True
        assert payload["allowPrivateBrowsing"] is True

    def test_firefox_uninstalls_over_the_classic_endpoint(self):
        driver = SessionlessDriver(browser_name="firefox", bidi=False)

        driver.uninstall_web_extension(WebExtension(EXTENSION_ID))

        assert driver.command_params("UNINSTALL_ADDON") == [{"id": EXTENSION_ID}]

    @pytest.mark.parametrize("browser_name", ["chrome", "MicrosoftEdge"])
    def test_chromium_install_raises(self, browser_name, extension_dir):
        driver = SessionlessDriver(browser_name=browser_name, bidi=False)

        with pytest.raises(WebDriverException, match="BiDi"):
            driver.install_web_extension(str(extension_dir))

    @pytest.mark.parametrize("browser_name", ["chrome", "MicrosoftEdge"])
    def test_chromium_uninstall_raises(self, browser_name):
        driver = SessionlessDriver(browser_name=browser_name, bidi=False)

        with pytest.raises(WebDriverException, match="BiDi"):
            driver.uninstall_web_extension(WebExtension(EXTENSION_ID))

    def test_remote_firefox_registers_the_classic_install_endpoint(self, extension_archive):
        # webdriver.Remote uses the plain RemoteConnection, which does not know the
        # moz/addon endpoints that webdriver.Firefox registers in its own connection.
        driver = SessionlessDriver(bidi=False, remote=True, firefox_commands=False)

        extension = driver.install_web_extension(str(extension_archive))

        assert extension.id == EXTENSION_ID
        assert driver.command_executor.get_command("INSTALL_ADDON") == (
            "POST",
            "/session/$sessionId/moz/addon/install",
        )

    def test_remote_firefox_registers_the_classic_uninstall_endpoint(self):
        driver = SessionlessDriver(bidi=False, remote=True, firefox_commands=False)

        driver.uninstall_web_extension(WebExtension(EXTENSION_ID))

        assert driver.command_params("UNINSTALL_ADDON") == [{"id": EXTENSION_ID}]


class TestClassicAddonDeprecation:
    """ADR decision 2: the Firefox-only classic methods are deprecated."""

    def test_install_addon_warns(self, extension_archive):
        driver = SessionlessFirefoxDriver(bidi=False)

        with pytest.warns(DeprecationWarning, match="install_web_extension"):
            driver.install_addon(str(extension_archive))

    def test_uninstall_addon_warns(self):
        driver = SessionlessFirefoxDriver(bidi=False)

        with pytest.warns(DeprecationWarning, match="uninstall_web_extension"):
            driver.uninstall_addon(EXTENSION_ID)

    def test_install_web_extension_does_not_warn(self, extension_archive):
        driver = SessionlessDriver(bidi=False)

        with warnings.catch_warnings():
            warnings.simplefilter("error", DeprecationWarning)
            driver.install_web_extension(str(extension_archive))
