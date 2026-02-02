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

import pytest

from selenium.common.exceptions import InvalidArgumentException
from selenium.webdriver.common.utils import is_valid_url


class TestUrlValidation:
    """Test URL validation function."""

    def test_valid_http_url(self):
        """Test that valid HTTP URLs are accepted."""
        assert is_valid_url("http://example.com") is True

    def test_valid_https_url(self):
        """Test that valid HTTPS URLs are accepted."""
        assert is_valid_url("https://example.com") is True

    def test_valid_url_with_path(self):
        """Test that URLs with paths are accepted."""
        assert is_valid_url("https://example.com/path/to/page") is True

    def test_valid_url_with_query_string(self):
        """Test that URLs with query strings are accepted."""
        assert is_valid_url("https://example.com/page?foo=bar&baz=qux") is True

    def test_valid_url_with_fragment(self):
        """Test that URLs with fragments are accepted."""
        assert is_valid_url("https://example.com/page#section") is True

    def test_valid_url_with_port(self):
        """Test that URLs with ports are accepted."""
        assert is_valid_url("http://example.com:8080") is True

    def test_valid_file_url(self):
        """Test that file:// URLs are accepted."""
        assert is_valid_url("file:///path/to/file.html") is True

    def test_valid_data_url(self):
        """Test that data: URLs are accepted."""
        assert is_valid_url("data:text/html,<h1>Hello</h1>") is True

    def test_valid_about_url(self):
        """Test that about: URLs are accepted."""
        assert is_valid_url("about:blank") is True

    def test_valid_ftp_url(self):
        """Test that FTP URLs are accepted."""
        assert is_valid_url("ftp://ftp.example.com/file.txt") is True

    def test_valid_custom_scheme_url(self):
        """Test that custom scheme URLs are accepted."""
        assert is_valid_url("custom://example.com") is True

    def test_invalid_url_without_scheme(self):
        """Test that URLs without scheme are rejected."""
        assert is_valid_url("example.com") is False

    def test_invalid_url_with_malformed_scheme(self):
        """Test that URLs with malformed scheme (missing :) are rejected."""
        assert is_valid_url("http//example.com") is False

    def test_invalid_url_with_space(self):
        """Test that URLs with spaces in the scheme are rejected."""
        assert is_valid_url("http ://example.com") is False

    def test_invalid_empty_string(self):
        """Test that empty strings are rejected."""
        assert is_valid_url("") is False

    def test_invalid_relative_url(self):
        """Test that relative URLs are rejected."""
        assert is_valid_url("/path/to/page") is False

    def test_invalid_protocol_relative_url(self):
        """Test that protocol-relative URLs are rejected."""
        assert is_valid_url("//example.com") is False
