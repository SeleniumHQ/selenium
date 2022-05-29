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


from selenium.webdriver.common.virtual_authenticator import (
    VirtualAuthenticatorOptions,
)


@pytest.fixture
def options():
    return VirtualAuthenticatorOptions()


def test_set_transport(options):
    options.transport = VirtualAuthenticatorOptions.Transport.USB
    assert options.transport == VirtualAuthenticatorOptions.Transport.USB.value


def test_get_transport(options):
    options._transport = VirtualAuthenticatorOptions.Transport.NFC
    assert options.transport == VirtualAuthenticatorOptions.Transport.NFC.value


def test_set_protocol(options):
    options.protocol = VirtualAuthenticatorOptions.Protocol.U2F
    assert options.protocol == VirtualAuthenticatorOptions.Protocol.U2F.value


def test_get_protocol(options):
    options._protocol = VirtualAuthenticatorOptions.Protocol.CTAP2
    assert options.protocol == VirtualAuthenticatorOptions.Protocol.CTAP2.value


def test_set_has_resident_key(options):
    options.has_resident_key = True
    assert options.has_resident_key is True


def test_get_has_resident_key(options):
    options._has_resident_key = False
    assert options.has_resident_key is False


def test_set_has_user_verification(options):
    options.has_user_verification = True
    assert options.has_user_verification is True


def test_get_has_user_verification(options):
    options._has_user_verification = False
    assert options.has_user_verification is False


def test_set_is_user_consenting(options):
    options.is_user_consenting = True
    assert options.is_user_consenting is True


def test_get_is_user_consenting(options):
    options._is_user_consenting = False
    assert options.is_user_consenting is False


def test_set_is_user_verified(options):
    options.is_user_verified = True
    assert options.is_user_verified is True


def test_get_is_user_verified(options):
    options._is_user_verified = False
    assert options.is_user_verified is False


def test_to_dict_with_defaults(options):
    default_options = options.to_dict()
    assert default_options['transport'] == VirtualAuthenticatorOptions.Transport.USB.value
    assert default_options['protocol'] == VirtualAuthenticatorOptions.Protocol.CTAP2.value
    assert default_options['hasResidentKey'] is False
    assert default_options['hasUserVerification'] is False
    assert default_options['isUserConsenting'] is True
    assert default_options['isUserVerified'] is False
