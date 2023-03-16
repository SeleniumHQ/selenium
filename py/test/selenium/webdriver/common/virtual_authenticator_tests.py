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

from base64 import b64decode
from base64 import urlsafe_b64decode
from base64 import urlsafe_b64encode
from typing import List

import pytest

from selenium.common.exceptions import InvalidArgumentException
from selenium.webdriver.common.virtual_authenticator import Credential
from selenium.webdriver.common.virtual_authenticator import VirtualAuthenticatorOptions
from selenium.webdriver.remote.webdriver import WebDriver

# working Key
BASE64__ENCODED_PK = """
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr
MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuBGV
oPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi9AyQ
FR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1PvSqXlq
GjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsuizAgyPuQ0
+j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/XYY22ecYxM
8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtibRXz5FcNld9MgD
/Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swykoQKBgQD8hCsp6FIQ
5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMCS6S64/qzZEqijLCqe
pwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnKws1t5GapfE1rmC/h4ol
L2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63ojKjegxHIyYDKRZNVUR/d
xAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM/r8PSflNHQKBgDnWgBh6OQncChPUlOLv9FMZPR1ZOfqLCYrjYEqi
uzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8VASOmqM1ml667axeZDIR867ZG8
K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6BhZC7z8mx+pnJODU3cYukxv3WTct
lUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJwWkBwYADmkfTRmHDvqzQSSvoC2S7aa
9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KINpLwcR8fqaYOdAHWWz636osVEqosRrH
zJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fBnzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4H
BYGpI8g==
"""

REGISTER_CREDENTIAL = "registerCredential().then(arguments[arguments.length - 1]);"
GET_CREDENTIAL = """getCredential([{
                        "type": "public-key",
                        "id": Int8Array.from(arguments[0]),
                    }]).then(arguments[arguments.length - 1]);"""


def create_rk_enabled_u2f_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.U2F
    options.has_resident_key = True
    driver.add_virtual_authenticator(options)
    return driver


def create_rk_disabled_u2f_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.U2F
    options.has_resident_key = False
    driver.add_virtual_authenticator(options)
    return driver


def create_rk_enabled_ctap2_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.CTAP2
    options.has_resident_key = True
    options.has_user_verification = True
    options.is_user_verified = True
    driver.add_virtual_authenticator(options)
    return driver


def create_rk_disabled_ctap2_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.CTAP2
    options.transport = VirtualAuthenticatorOptions.Transport.USB
    options.has_resident_key = False
    options.has_user_verification = True
    options.is_user_verified = True
    driver.add_virtual_authenticator(options)
    return driver


def get_assertion_for(webdriver: WebDriver, credential_id: List[int]):
    return webdriver.execute_async_script(GET_CREDENTIAL, credential_id)


def extract_id(response):
    return response.get("credential", {}).get("id", "")


def extract_raw_id(response):
    return response.get("credential", {}).get("rawId", "")


def not_allowed_error_in(response) -> bool:
    return response.get("status", "").startswith("NotAllowedError")


# ---------------- TESTS ------------------------------------
@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_and_remove_virtual_authenticator(driver, pages):
    driver = create_rk_disabled_ctap2_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    result = driver.execute_async_script(REGISTER_CREDENTIAL)
    assert result.get("status", "") == "OK"

    assert get_assertion_for(driver, result["credential"]["rawId"]).get("status", "") == "OK"

    assert driver.virtual_authenticator_id is not None

    driver.remove_virtual_authenticator()
    assert driver.virtual_authenticator_id is None


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_and_remove_non_resident_credentials(driver, pages):
    driver = create_rk_disabled_ctap2_authenticator(driver)

    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    assert driver.virtual_authenticator_id is not None

    credential = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        b64decode(BASE64__ENCODED_PK),
        0,
    )

    driver.add_credential(credential)
    assert get_assertion_for(driver, [1, 2, 3, 4]).get("status", "") == "OK"

    driver.remove_virtual_authenticator()
    assert driver.virtual_authenticator_id is None


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_non_resident_credential_when_authenticator_uses_u2f_protocol(driver, pages):
    driver = create_rk_disabled_u2f_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    base64_pk = """
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q
    hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU
    RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB
    """

    credential = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        urlsafe_b64decode(base64_pk),
        0,
    )
    driver.add_credential(credential)
    assert get_assertion_for(driver, [1, 2, 3, 4]).get("status", "") == "OK"

    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_resident_credential_not_supported_when_authenticator_uses_u2f_protocol(driver, pages):
    driver = create_rk_enabled_u2f_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    base64_pk = """
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q
    hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU
    RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB
    """

    credential = Credential.create_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        bytearray({1}),
        urlsafe_b64decode(base64_pk),
        0,
    )
    with pytest.raises(InvalidArgumentException):
        driver.add_credential(credential)

    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_get_credentials(driver, pages):
    driver = create_rk_enabled_ctap2_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    # Register a Resident Credential
    response1 = driver.execute_async_script(
        """
    registerCredential({authenticatorSelection: {requireResidentKey: true}})
    .then(arguments[arguments.length - 1]);
    """
    )
    assert response1.get("status", "") == "OK"

    # Register a Non-Resident Credential
    response2 = driver.execute_async_script(REGISTER_CREDENTIAL)
    assert response2.get("status", "") == "OK"

    assert extract_id(response1) != extract_id(response2)

    # Retrieve the two credentials
    credentials = driver.get_credentials()
    assert len(credentials) == 2

    credential1, credential2 = None, None

    for credential in credentials:
        # Using startswith because there can be padding difference '==' or '=' in the end
        if credential.id.startswith(extract_id(response1)):
            credential1: Credential = credential
        elif credential.id.startswith(extract_id(response2)):
            credential2: Credential = credential
        else:
            assert False, "Unknown credential"

    assert credential1.is_resident_credential, "Credential1 should be resident credential"
    assert credential1.private_key is not None, "Credential1 should have private key"
    assert credential1.rp_id == "localhost"
    assert credential1.user_handle == urlsafe_b64encode(bytearray({1})).decode()
    assert credential1.sign_count == 1

    assert credential2.is_resident_credential is False, "Credential2 should not be resident credential"
    assert credential2.private_key is not None, "Credential2 should have private key"
    # Non-resident credentials don't save RP ID
    assert credential2.rp_id is None, "Credential2 should not have RP ID. Since it's not resident credential"
    assert (
        credential2.user_handle is None
    ), "Credential2 should not have user handle. Since it's not resident credential"
    assert credential2.sign_count == 1

    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_remove_credential_by_raw_Id(driver, pages):
    driver = create_rk_disabled_u2f_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    # register a credential
    response = driver.execute_async_script(REGISTER_CREDENTIAL)
    assert response.get("status", "") == "OK"

    # remove the credential using array of bytes: rawId
    raw_id = extract_raw_id(response)
    driver.remove_credential(bytearray(raw_id))

    # Trying to get the assertion should fail
    response = get_assertion_for(driver, raw_id)
    assert not_allowed_error_in(response), "Should have thrown a NotAllowedError"
    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_remove_credential_by_b64_urlId(driver, pages):
    driver = create_rk_disabled_u2f_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    # register a credential
    response = driver.execute_async_script(REGISTER_CREDENTIAL)
    assert response.get("status", "") == "OK"

    # remove the credential using array of bytes: rawId
    raw_id = extract_raw_id(response)
    credential_id = extract_id(response)
    driver.remove_credential(credential_id)

    # Trying to get the assertion should fail
    response = get_assertion_for(driver, raw_id)
    assert not_allowed_error_in(response), "Should have thrown a NotAllowedError"
    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_remove_all_credentials(driver, pages):
    driver = create_rk_disabled_u2f_authenticator(driver)

    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    # Register 2 credentials
    response1 = driver.execute_async_script(REGISTER_CREDENTIAL)
    raw_id1 = response1["credential"]["rawId"]

    response2 = driver.execute_async_script(REGISTER_CREDENTIAL)
    raw_id2 = response2["credential"]["rawId"]

    driver.remove_all_credentials()

    response = driver.execute_async_script(
        """
        getCredential([{
            "type": "public-key",
            "id": Int8Array.from(arguments[0]),
        }, {
            "type": "public-key",
            "id": Int8Array.from(arguments[1]),
        }]).then(arguments[arguments.length - 1]);
        """,
        raw_id1,
        raw_id2,
    )
    assert not_allowed_error_in(response), "Should have thrown a NotAllowedError"
    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_set_user_verified(driver, pages):
    driver = create_rk_enabled_ctap2_authenticator(driver)
    driver.get(pages.url("virtual-authenticator.html", localhost=True))

    # Register a credential requiring UV.

    response = driver.execute_async_script(
        "registerCredential({authenticatorSelection: {userVerification: 'required'}}).then(arguments[arguments.length - 1]);"
    )
    assert response.get("status", "") == "OK"
    raw_id = response["credential"]["rawId"]

    # Getting an assertion requiring user verification should succeed.
    response = driver.execute_async_script(GET_CREDENTIAL, raw_id)
    assert response.get("status", "") == "OK"

    # Disable user verified.
    driver.set_user_verified(False)

    # Getting an assertion requiring user verification should fail.
    response = driver.execute_async_script(GET_CREDENTIAL, raw_id)

    assert not_allowed_error_in(response), "Should have thrown a NotAllowedError"
    driver.remove_virtual_authenticator()
