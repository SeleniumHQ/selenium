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

"""Tests for the machine-readable files published with the API documentation."""

import llm_assets
import pytest

BASE = "https://www.selenium.dev/selenium/docs/api/py/"


@pytest.mark.parametrize(
    ("page", "expected"),
    [
        ("index.html", BASE),
        ("api.html", BASE + "api.html"),
        ("selenium_common/selenium.common.exceptions.html", BASE + "selenium_common/selenium.common.exceptions.html"),
        ("genindex/index.html", BASE + "genindex/"),
    ],
)
def test_maps_a_page_to_its_served_url(page, expected):
    assert llm_assets._page_url(BASE, page) == expected


def test_sitemap_lists_every_page(tmp_path):
    (tmp_path / "index.html").write_text("")
    (tmp_path / "api.html").write_text("")
    nested = tmp_path / "selenium_common"
    nested.mkdir()
    (nested / "selenium.common.exceptions.html").write_text("")
    # Sphinx internals; not pages a reader should be sent to.
    static = tmp_path / "_static"
    static.mkdir()
    (static / "theme.html").write_text("")

    assert llm_assets.write_sitemap(str(tmp_path), BASE) == 3

    sitemap = (tmp_path / "sitemap.xml").read_text()
    assert f"<loc>{BASE}</loc>" in sitemap
    assert f"<loc>{BASE}api.html</loc>" in sitemap
    assert "_static" not in sitemap


def test_llms_txt_advertises_only_the_indexes_that_were_built():
    with_data = llm_assets.render_llms_txt(BASE, "4.48.0", {"objects.inv", "deprecations.json"})
    assert BASE + "objects.inv" in with_data
    assert BASE + "deprecations.json" in with_data

    without_data = llm_assets.render_llms_txt(BASE, "4.48.0", set())
    assert "objects.inv" not in without_data
    assert "Machine-readable indexes" not in without_data


def test_llms_txt_names_the_version_and_the_key_modules():
    rendered = llm_assets.render_llms_txt(BASE, "4.48.0", set())

    assert "4.48.0" in rendered
    assert BASE + "selenium_webdriver_common/selenium.webdriver.common.by.html" in rendered
    assert BASE + "api.html" in rendered


def test_llms_txt_carries_the_guidance_that_ships_with_the_package():
    rendered = llm_assets.render_llms_txt(BASE, "4.48.0", set())

    # Sourced from py/selenium/llms.txt so the two cannot drift apart.
    assert "Selenium Manager downloads and configures both the browser and its driver" in rendered
    assert "driver.quit()" in rendered


def test_reports_a_missing_section_rather_than_publishing_without_it():
    with pytest.raises(ValueError, match="Not A Section"):
        llm_assets.package_section("Not A Section")
