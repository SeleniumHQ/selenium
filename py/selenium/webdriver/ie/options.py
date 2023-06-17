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
from enum import Enum

from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.common.options import ArgOptions


class ElementScrollBehavior(Enum):
    TOP = 0
    BOTTOM = 1


class _IeOptions:
    """IeOptions descriptor that validates below attributes.

    - BROWSER_ATTACH_TIMEOUT
    - ELEMENT_SCROLL_BEHAVIOR
    - ENSURE_CLEAN_SESSION
    - FILE_UPLOAD_DIALOG_TIMEOUT
    - FORCE_CREATE_PROCESS_API
    - FORCE_SHELL_WINDOWS_API
    - FULL_PAGE_SCREENSHOT
    - IGNORE_PROTECTED_MODE_SETTINGS
    - IGNORE_ZOOM_LEVEL
    - INITIAL_BROWSER_URL
    - NATIVE_EVENTS
    - PERSISTENT_HOVER
    - REQUIRE_WINDOW_FOCUS
    - USE_PER_PROCESS_PROXY
    - USE_LEGACY_FILE_UPLOAD_DIALOG_HANDLING
    - ATTACH_TO_EDGE_CHROME
    - EDGE_EXECUTABLE_PATH
    """

    def __init__(self, name, expected_type):
        self.name = name
        self.expected_type = expected_type

    def __get__(self, obj, cls):
        return obj._options.get(self.name)

    def __set__(self, obj, value) -> None:
        if not isinstance(value, self.expected_type):
            raise ValueError(f"{self.name} should be of type {self.expected_type.__name__}")
        if self.name == "ELEMENT_SCROLL_BEHAVIOR" and value not in [
            ElementScrollBehavior.TOP.value,
            ElementScrollBehavior.BOTTOM.value,
        ]:
            raise ValueError("Element Scroll Behavior out of range.")
        obj._options[self.name] = value


class Options(ArgOptions):
    KEY = "se:ieOptions"
    SWITCHES = "ie.browserCommandLineSwitches"

    BROWSER_ATTACH_TIMEOUT = "browserAttachTimeout"
    ELEMENT_SCROLL_BEHAVIOR = "elementScrollBehavior"
    ENSURE_CLEAN_SESSION = "ie.ensureCleanSession"
    FILE_UPLOAD_DIALOG_TIMEOUT = "ie.fileUploadDialogTimeout"
    FORCE_CREATE_PROCESS_API = "ie.forceCreateProcessApi"
    FORCE_SHELL_WINDOWS_API = "ie.forceShellWindowsApi"
    FULL_PAGE_SCREENSHOT = "ie.enableFullPageScreenshot"
    IGNORE_PROTECTED_MODE_SETTINGS = "ignoreProtectedModeSettings"
    IGNORE_ZOOM_LEVEL = "ignoreZoomSetting"
    INITIAL_BROWSER_URL = "initialBrowserUrl"
    NATIVE_EVENTS = "nativeEvents"
    PERSISTENT_HOVER = "enablePersistentHover"
    REQUIRE_WINDOW_FOCUS = "requireWindowFocus"
    USE_PER_PROCESS_PROXY = "ie.usePerProcessProxy"
    USE_LEGACY_FILE_UPLOAD_DIALOG_HANDLING = "ie.useLegacyFileUploadDialogHandling"
    ATTACH_TO_EDGE_CHROME = "ie.edgechromium"
    EDGE_EXECUTABLE_PATH = "ie.edgepath"

    # Creating descriptor objects for each of the above IE options
    browser_attach_timeout = _IeOptions("BROWSER_ATTACH_TIMEOUT", int)
    """Gets and Sets `browser_attach_timeout`

    Usage
    -----
    `self.browser_attach_timeout`
    `self.browser_attach_timeout` = `value`

    Notes
    -----
    `value` should be an `int` (Timeout) in milliseconds
    """
    element_scroll_behavior = _IeOptions("ELEMENT_SCROLL_BEHAVIOR", int)
    """Gets and Sets `element_scroll_behavior`

    Usage
    -----
    `self.element_scroll_behavior`
    `self.element_scroll_behavior` = `value`

    Notes
    -----
    `value` should be `int` either 0 - Top, 1 - Bottom
    """
    ensure_clean_session = _IeOptions("ENSURE_CLEAN_SESSION", bool)
    """Gets and Sets `ensure_clean_session`

    Usage
    -----
    `self.ensure_clean_session`
    `self.ensure_clean_session` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    file_upload_dialog_timeout = _IeOptions("FILE_UPLOAD_DIALOG_TIMEOUT", int)
    """Gets and Sets `file_upload_dialog_timeout`

    Usage
    -----
    `self.file_upload_dialog_timeout`
    `self.file_upload_dialog_timeout` = `value`

    Notes
    -----
    `value` should be `int` (Timeout) in milliseconds
    """
    force_create_process_api = _IeOptions("FORCE_CREATE_PROCESS_API", bool)
    """Gets and Sets `force_create_process_api`

    Usage
    -----
    `self.force_create_process_api`
    `self.force_create_process_api` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    force_shell_windows_api = _IeOptions("FORCE_SHELL_WINDOWS_API", bool)
    """Gets and Sets `force_shell_windows_api`

    Usage
    -----
    `self.force_shell_windows_api`
    `self.force_shell_windows_api` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    full_page_screenshot = _IeOptions("FULL_PAGE_SCREENSHOT", bool)
    """Gets and Sets `full_page_screenshot`

    Usage
    -----
    `self.full_page_screenshot`
    `self.full_page_screenshot` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    ignore_protected_mode_settings = _IeOptions("IGNORE_PROTECTED_MODE_SETTINGS", bool)
    """Gets and Sets `ignore_protected_mode_settings`

    Usage
    -----
    `self.ignore_protected_mode_settings`
    `self.ignore_protected_mode_settings` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    ignore_zoom_level = _IeOptions("IGNORE_ZOOM_LEVEL", bool)
    """Gets and Sets `ignore_zoom_level`

    Usage
    -----
    `self.ignore_zoom_level`
    `self.ignore_zoom_level` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    initial_browser_url = _IeOptions("INITIAL_BROWSER_URL", str)
    """Gets and Sets `initial_browser_url`

    Usage
    -----
    `self.initial_browser_url`
    `self.initial_browser_url` = `value`

    Notes
    -----
    `value` should be `str`
    """
    native_events = _IeOptions("NATIVE_EVENTS", bool)
    """Gets and Sets `native_events`

    Usage
    -----
    `self.native_events`
    `self.native_events` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    persistent_hover = _IeOptions("PERSISTENT_HOVER", bool)
    """Gets and Sets `persistent_hover`

    Usage
    -----
    `self.persistent_hover`
    `self.persistent_hover` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    require_window_focus = _IeOptions("REQUIRE_WINDOW_FOCUS", bool)
    """Gets and Sets `require_window_focus`

    Usage
    -----
    `self.require_window_focus`
    `self.require_window_focus` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    use_per_process_proxy = _IeOptions("USE_PER_PROCESS_PROXY", bool)
    """Gets and Sets `use_per_process_proxy`

    Usage
    -----
    `self.use_per_process_proxy`
    `self.use_per_process_proxy` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    use_legacy_file_upload_dialog_handling = _IeOptions("USE_LEGACY_FILE_UPLOAD_DIALOG_HANDLING", bool)
    """Gets and Sets `use_legacy_file_upload_dialog_handling`

    Usage
    -----
    `self.use_legacy_file_upload_dialog_handling`
    `self.use_legacy_file_upload_dialog_handling` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    attach_to_edge_chrome = _IeOptions("ATTACH_TO_EDGE_CHROME", bool)
    """Gets and Sets `attach_to_edge_chrome`

    Usage
    -----
    `self.attach_to_edge_chrome`
    `self.attach_to_edge_chrome` = `value`

    Notes
    -----
    `value` should be `bool`
    """
    edge_executable_path = _IeOptions("EDGE_EXECUTABLE_PATH", str)
    """Gets and Sets `edge_executable_path`

    Usage
    -----
    `self.edge_executable_path`
    `self.edge_executable_path` = `value`

    Notes
    -----
    `value` should be `str`
    """

    def __init__(self) -> None:
        super().__init__()
        self._options = {}
        self._additional = {}

    @property
    def options(self) -> dict:
        """:Returns: A dictionary of browser options"""
        return self._options

    @property
    def additional_options(self) -> dict:
        """:Returns: The additional options"""
        return self._additional

    def add_additional_option(self, name: str, value):
        """Adds an additional option not yet added as a safe option for IE.

        :Args:
         - name: name of the option to add
         - value: value of the option to add
        """
        self._additional[name] = value

    def to_capabilities(self) -> dict:
        """Marshals the IE options to the correct object."""
        caps = self._caps

        opts = self._options.copy()
        if len(self._arguments) > 0:
            opts[self.SWITCHES] = " ".join(self._arguments)

        if len(self._additional) > 0:
            opts.update(self._additional)

        if len(opts) > 0:
            caps[Options.KEY] = opts
        return caps

    @property
    def default_capabilities(self) -> dict:
        return DesiredCapabilities.INTERNETEXPLORER.copy()
