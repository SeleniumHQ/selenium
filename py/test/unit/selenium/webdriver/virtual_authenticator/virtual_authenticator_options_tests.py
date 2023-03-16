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

from selenium.webdriver.common.virtual_authenticator import VirtualAuthenticatorOptions


@pytest.fixture
def options():
    return VirtualAuthenticatorOptions()


def test_bespoke_options_for_virtual_authenticator():
    assert VirtualAuthenticatorOptions(
        protocol="ctap1/u2f",
        transport="ble",
        has_resident_key=True,
        has_user_verification=True,
        is_user_consenting=False,
        is_user_verified=True,
    ).to_dict() == {
        "protocol": "ctap1/u2f",
        "transport": "ble",
        "hasResidentKey": True,
        "hasUserVerification": True,
        "isUserConsenting": False,
        "isUserVerified": True,
    }


def test_to_dict_with_defaults(options):
    default_options = options.to_dict()
    assert default_options["transport"] == VirtualAuthenticatorOptions.Transport.USB.value
    assert default_options["protocol"] == VirtualAuthenticatorOptions.Protocol.CTAP2.value
    assert default_options["hasResidentKey"] is False
    assert default_options["hasUserVerification"] is False
    assert default_options["isUserConsenting"] is True
    assert default_options["isUserVerified"] is False
