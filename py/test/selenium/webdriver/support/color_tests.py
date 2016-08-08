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

from selenium.webdriver.support.color import Color


class TestColor(object):

    def test_rgb_to_rgb(self):
        rgb = "rgb(1, 2, 3)"
        assert Color.from_string(rgb).rgb == rgb

    def test_rgb_to_rgba(self):
        rgb = "rgb(1, 2, 3)"
        assert Color.from_string(rgb).rgba == "rgba(1, 2, 3, 1)"

    def test_rgb_pct_to_rgba(self):
        rgb = "rgb(10%, 20%, 30%)"
        assert Color.from_string(rgb).rgba == "rgba(25, 51, 76, 1)"

    def test_rgb_allows_whitespace(self):
        rgb = "rgb(\t1,   2    , 3)"
        assert Color.from_string(rgb).rgb == "rgb(1, 2, 3)"

    def test_rgba_to_rgba(self):
        rgba = "rgba(1, 2, 3, 0.5)"
        assert Color.from_string(rgba).rgba == rgba

    def test_rgba_pct_to_rgba(self):
        rgba = "rgba(10%, 20%, 30%, 0.5)"
        assert Color.from_string(rgba).rgba == "rgba(25, 51, 76, 0.5)"

    def test_hex_to_hex(self):
        hex_ = "#ff00a0"
        assert Color.from_string(hex_).hex == hex_

    def test_hex_to_rgb(self):
        hex_ = "#01Ff03"
        rgb = "rgb(1, 255, 3)"
        assert Color.from_string(hex_).rgb == rgb

    def test_hex_to_rgba(self):
        hex_ = "#01Ff03"
        rgba = "rgba(1, 255, 3, 1)"
        assert Color.from_string(hex_).rgba == rgba

        hex_ = "#00ff33"
        rgba = "rgba(0, 255, 51, 1)"
        assert Color.from_string(hex_).rgba == rgba

    def test_rgb_to_hex(self):
        assert Color.from_string("rgb(1, 255, 3)").hex == "#01ff03"

    def test_hex3_to_rgba(self):
        assert Color.from_string("#0f3").rgba == "rgba(0, 255, 51, 1)"

    def test_hsl_to_rgba(self):
        hsl = "hsl(120, 100%, 25%)"
        rgba = "rgba(0, 128, 0, 1)"
        assert Color.from_string(hsl).rgba == rgba

        hsl = "hsl(100, 0%, 50%)"
        rgba = "rgba(128, 128, 128, 1)"
        assert Color.from_string(hsl).rgba == rgba

    def test_hsla_to_rgba(self):
        hsla = "hsla(120, 100%, 25%, 1)"
        rgba = "rgba(0, 128, 0, 1)"
        assert Color.from_string(hsla).rgba == rgba

        hsla = "hsla(100, 0%, 50%, 0.5)"
        rgba = "rgba(128, 128, 128, 0.5)"
        assert Color.from_string(hsla).rgba == rgba

    def test_named_color(self):
        assert Color.from_string("green").rgba == "rgba(0, 128, 0, 1)"
        assert Color.from_string("gray").rgba == "rgba(128, 128, 128, 1)"
        assert Color.from_string("aqua").hex == "#00ffff"
        assert Color.from_string("transparent").rgba == "rgba(0, 0, 0, 0)"

    def test_equals(self):
        assert Color.from_string("#f00") == Color.from_string("rgb(255, 0, 0)")
        assert Color.from_string("rgba(30, 30, 30, 0.2)") != Color.from_string("rgba(30, 30, 30, 1)")

    def test_hash(self):
        hash1 = hash(Color.from_string("#f00"))
        hash2 = hash(Color.from_string("rgb(255, 0, 0)"))
        assert hash1 == hash2

    def test_string_representations(self):
        hex_ = "#01Ff03"
        assert str(Color.from_string(hex_)) == "Color: rgba(1, 255, 3, 1)"
        assert repr(Color.from_string(hex_)) == "Color(red=1, green=255, blue=3, alpha=1)"
