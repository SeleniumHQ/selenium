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

from selenium.webdriver.common.bidi.cdp import MAX_WS_MESSAGE_SIZE, _resolve_max_message_size


def test_default_when_no_env_var_and_no_explicit(monkeypatch):
    monkeypatch.delenv("SE_CDP_MAX_WS_MESSAGE_SIZE", raising=False)
    assert _resolve_max_message_size() == MAX_WS_MESSAGE_SIZE


def test_env_var_overrides_default(monkeypatch):
    monkeypatch.setenv("SE_CDP_MAX_WS_MESSAGE_SIZE", str(2**26))
    assert _resolve_max_message_size() == 2**26


def test_explicit_param_overrides_env_var(monkeypatch):
    monkeypatch.setenv("SE_CDP_MAX_WS_MESSAGE_SIZE", str(2**26))
    assert _resolve_max_message_size(2**28) == 2**28


def test_explicit_param_used_when_no_env_var(monkeypatch):
    monkeypatch.delenv("SE_CDP_MAX_WS_MESSAGE_SIZE", raising=False)
    assert _resolve_max_message_size(2**30) == 2**30
