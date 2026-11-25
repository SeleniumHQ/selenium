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

from selenium.webdriver.safari.service import Service


def test_se_debug_adds_diagnose(monkeypatch):
    monkeypatch.setenv("SE_DEBUG", "true")

    service = Service(service_args=["--foo"])

    assert service.service_args == ["--foo", "--diagnose"]


def test_se_debug_does_not_duplicate_diagnose(monkeypatch):
    monkeypatch.setenv("SE_DEBUG", "true")

    service = Service(service_args=["--diagnose"], enable_logging=True)

    assert service.service_args == ["--diagnose"]


def test_diagnose_is_off_by_default(monkeypatch):
    monkeypatch.delenv("SE_DEBUG", raising=False)

    service = Service()

    assert "--diagnose" not in service.service_args
