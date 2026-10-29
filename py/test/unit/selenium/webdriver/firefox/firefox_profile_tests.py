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


from pathlib import Path

from selenium.webdriver.firefox.firefox_profile import FirefoxProfile


def generated_prefs(profile):
    profile.update_preferences()
    return (Path(profile.path) / "user.js").read_text(encoding="utf-8").splitlines()


def test_uses_default_preferences():
    prefs = generated_prefs(FirefoxProfile())

    assert 'user_pref("browser.newtabpage.enabled", false);' in prefs
    assert 'user_pref("browser.startup.homepage", "about:blank");' in prefs
    assert 'user_pref("browser.usedOnWindows10.introURL", "about:blank");' in prefs
    assert 'user_pref("network.captive-portal-service.enabled", false);' in prefs
    assert 'user_pref("security.csp.enable", false);' in prefs
    assert 'user_pref("startup.homepage_welcome_url", "about:blank");' in prefs


def test_does_not_apply_default_preferences_to_an_existing_profile_directory(tmp_path):
    prefs = generated_prefs(FirefoxProfile(str(tmp_path)))

    assert prefs == []


def test_leaves_an_existing_profile_directory_preferences_alone(tmp_path):
    (tmp_path / "user.js").write_text('user_pref("browser.startup.homepage", "http://example.com");\n')

    prefs = generated_prefs(FirefoxProfile(str(tmp_path)))

    assert prefs == ['user_pref("browser.startup.homepage", "http://example.com");']


def test_user_preferences_override_defaults():
    profile = FirefoxProfile()
    profile.set_preference("security.csp.enable", True)

    assert 'user_pref("security.csp.enable", true);' in generated_prefs(profile)


def test_user_welcome_page_can_be_overridden():
    profile = FirefoxProfile()
    profile.set_preference("startup.homepage_welcome_url", "http://example.com")

    assert 'user_pref("startup.homepage_welcome_url", "http://example.com");' in generated_prefs(profile)
