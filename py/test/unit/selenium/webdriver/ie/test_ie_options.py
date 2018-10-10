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


from selenium.webdriver.ie.options import Options, ElementScrollBehavior
import pytest

TIMEOUT = 30


@pytest.fixture
def opts():
    yield Options()


def test_arguments(opts):
    arg1 = '-k'
    arg2 = '-private'
    opts.add_argument(arg1)
    opts.add_argument(arg2)
    assert arg1 in opts.arguments
    assert arg2 in opts.arguments


def test_browser_attach_timeout(opts):
    opts.browser_attach_timeout = TIMEOUT
    assert opts.browser_attach_timeout == TIMEOUT
    assert opts.options.get(Options.BROWSER_ATTACH_TIMEOUT) == TIMEOUT


def test_raises_exception_for_invalid_browser_attach_timeout(opts):
    with pytest.raises(ValueError):
        opts.browser_attach_timeout = 'foo'


def test_element_scroll_behavior(opts):
    opts.element_scroll_behavior = ElementScrollBehavior.BOTTOM
    assert opts.element_scroll_behavior == ElementScrollBehavior.BOTTOM
    assert opts.options.get(Options.ELEMENT_SCROLL_BEHAVIOR) == ElementScrollBehavior.BOTTOM


def test_ensure_clean_session(opts):
    opts.ensure_clean_session = True
    assert opts.ensure_clean_session is True
    assert opts.options.get(Options.ENSURE_CLEAN_SESSION) is True


def test_file_upload_dialog_timeout(opts):
    opts.file_upload_dialog_timeout = TIMEOUT
    assert opts.file_upload_dialog_timeout is TIMEOUT
    assert opts.options.get(Options.FILE_UPLOAD_DIALOG_TIMEOUT) is TIMEOUT


def test_raises_exception_for_file_upload_dialog_timeout(opts):
    with pytest.raises(ValueError):
        opts.file_upload_dialog_timeout = 'foo'


def test_force_create_process_api(opts):
    opts.force_create_process_api = True
    assert opts.force_create_process_api is True
    assert opts.options.get(Options.FORCE_CREATE_PROCESS_API) is True


def test_force_shell_windows_api(opts):
    opts.force_shell_windows_api = True
    assert opts.force_shell_windows_api is True
    assert opts.options.get(Options.FORCE_SHELL_WINDOWS_API) is True


def test_full_page_screenshot(opts):
    opts.full_page_screenshot = True
    assert opts.full_page_screenshot is True
    assert opts.options.get(Options.FULL_PAGE_SCREENSHOT) is True


def test_ignore_protected_mode_settings(opts):
    opts.ignore_protected_mode_settings = True
    assert opts.ignore_protected_mode_settings is True
    assert opts.options.get(Options.IGNORE_PROTECTED_MODE_SETTINGS) is True


def test_ignore_zoom_level(opts):
    opts.ignore_zoom_level = True
    assert opts.ignore_zoom_level is True
    assert opts.options.get(Options.IGNORE_ZOOM_LEVEL) is True


def test_initial_browser_url(opts):
    url = 'http://www.seleniumhq.org'
    opts.initial_browser_url = url
    assert opts.initial_browser_url == url
    assert opts.options.get(Options.INITIAL_BROWSER_URL) == url


def test_native_events(opts):
    opts.native_events = True
    assert opts.native_events is True
    assert opts.options.get(Options.NATIVE_EVENTS) is True


def test_persistent_hover(opts):
    opts.persistent_hover = True
    assert opts.persistent_hover is True
    assert opts.options.get(Options.PERSISTENT_HOVER) is True


def test_require_window_focus(opts):
    opts.require_window_focus = True
    assert opts.require_window_focus is True
    assert opts.options.get(Options.REQUIRE_WINDOW_FOCUS) is True


def test_use_per_process_proxy(opts):
    opts.use_per_process_proxy = True
    assert opts.use_per_process_proxy is True
    assert opts.options.get(Options.USE_PER_PROCESS_PROXY) is True


def test_validate_cookie_document_type(opts):
    opts.validate_cookie_document_type = True
    assert opts.validate_cookie_document_type is True
    assert opts.options.get(Options.VALIDATE_COOKIE_DOCUMENT_TYPE) is True


def test_additional_options(opts):
    opts.add_additional_option('foo', 'bar')
    assert opts.additional_options.get('foo') == 'bar'


def test_to_capabilities(opts):
    opts._options['foo'] = 'bar'
    assert Options.KEY in opts.to_capabilities()
    assert opts.to_capabilities().get(Options.KEY) == opts._options


def test_to_capabilities_arguments(opts):
    arg = '-k'
    opts.add_argument(arg)
    caps_opts = opts.to_capabilities().get(Options.KEY)
    assert caps_opts.get(Options.SWITCHES) == arg


def test_to_capabilities_additional_options(opts):
    name = 'foo'
    value = 'bar'
    opts.add_additional_option(name, value)
    caps_opts = opts.to_capabilities().get(Options.KEY)
    assert caps_opts.get(name) == value


def test_to_capabilities_should_not_modify_set_options(opts):
    opts._options['foo'] = 'bar'
    arg = '-k'
    opts.add_argument(arg)
    opts.add_additional_option('baz', 'qux')
    opts.to_capabilities().get(Options.KEY)
    assert opts.options.get('foo') == 'bar'
    assert opts.arguments[0] == arg
    assert opts.additional_options.get('baz') == 'qux'


def test_starts_with_default_capabilities(opts):
    from selenium.webdriver import DesiredCapabilities
    assert opts._caps == DesiredCapabilities.INTERNETEXPLORER


def test_is_a_baseoptions(opts):
    from selenium.webdriver.common.options import BaseOptions
    assert isinstance(opts, BaseOptions)
