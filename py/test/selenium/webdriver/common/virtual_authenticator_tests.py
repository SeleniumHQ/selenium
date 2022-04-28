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
from base64 import b64decode

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.virtual_authenticator import (
    Credential,
    VirtualAuthenticatorOptions,
)
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.common.by import By


# working Key
BASE64__ENCODED_PK = '''
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
'''


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


def create_rk_enabled_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.CTAP2
    options.has_resident_key = True
    options.has_user_verification = True
    options.is_user_verified = True
    driver.add_virtual_authenticator(options)
    return driver


def create_rk_disabled_authenticator(driver) -> WebDriver:
    options = VirtualAuthenticatorOptions()
    options.protocol = VirtualAuthenticatorOptions.Protocol.CTAP2
    options.transport = VirtualAuthenticatorOptions.Transport.USB
    options.has_resident_key = False
    options.has_user_verification = True
    options.is_user_verified = True
    driver.add_virtual_authenticator(options)
    return driver


# ---------------- TESTS ------------------------------------
# TODO: add JS verfication code for tests as in JAVA
@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_and_remove_virtual_authenticator(driver, pages):
    driver = create_rk_disabled_authenticator(driver)

    pages.load("virtual-authenticator.html")

    assert driver.virtual_authenticator_id is not None

    driver.remove_virtual_authenticator()
    assert driver.virtual_authenticator_id is None


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_and_remove_non_resident_credentials(driver, pages):
    driver = create_rk_disabled_authenticator(driver)

    pages.load("virtual-authenticator.html")

    assert driver.virtual_authenticator_id is not None

    credential = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        b64decode(BASE64__ENCODED_PK),
        0,
    )

    credential2 = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4, 5}),
        "localhost",
        b64decode(BASE64__ENCODED_PK),
        1,
    )

    driver.add_credential(credential)
    assert len(driver.get_credentials()) == 1

    driver.add_credential(credential2)
    assert len(driver.get_credentials()) == 2

    driver.remove_credential(credential.id)
    assert len(driver.get_credentials()) == 1

    driver.remove_virtual_authenticator()
    assert driver.virtual_authenticator_id is None


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_add_and_remove_resident_credentials(driver, pages):
    driver = create_rk_enabled_authenticator(driver)

    pages.load("virtual-authenticator.html")
    assert driver.virtual_authenticator_id is not None

    credential = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        b64decode(BASE64__ENCODED_PK),
        0,
    )

    credential2 = Credential.create_resident_credential(
        bytearray({1, 2, 3, 4, 5}),
        "localhost",
        bytearray({1}),
        b64decode(BASE64__ENCODED_PK),
        1,
    )

    driver.add_credential(credential)
    assert len(driver.get_credentials()) == 1

    driver.add_credential(credential2)
    assert len(driver.get_credentials()) == 2

    driver.remove_credential(credential.id)
    assert len(driver.get_credentials()) == 1

    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_remove_all_credentials(driver):
    options = VirtualAuthenticatorOptions()
    options.has_resident_key = True

    driver.add_virtual_authenticator(options)
    assert driver.virtual_authenticator_id is not None

    credential = Credential.create_non_resident_credential(
        bytearray({1, 2, 3, 4}),
        "localhost",
        b64decode(BASE64__ENCODED_PK),
        0,
    )

    credential2 = Credential.create_resident_credential(
        bytearray({1, 2, 3, 4, 5}),
        "localhost",
        bytearray({1}),
        b64decode(BASE64__ENCODED_PK),
        1,
    )

    driver.add_credential(credential)
    assert len(driver.get_credentials()) == 1

    driver.add_credential(credential2)
    assert len(driver.get_credentials()) == 2

    driver.remove_all_credentials()
    assert len(driver.get_credentials()) == 0

    driver.remove_virtual_authenticator()


@pytest.mark.xfail_firefox
@pytest.mark.xfail_safari
@pytest.mark.xfail_remote
def test_full_virtual_authenticator(driver):

    options = VirtualAuthenticatorOptions()
    options.is_user_consenting = True
    options.protocol = VirtualAuthenticatorOptions.Protocol.U2F
    options.transport = VirtualAuthenticatorOptions.Transport.USB

    driver.add_virtual_authenticator(options)

    driver.get("https://webauthn.io/")
    username = driver.find_element(By.ID, "input-email")
    username.send_keys("username")

    selectAttestation = Select(driver.find_element(By.ID, "select-attestation"))
    selectAttestation.select_by_visible_text("Direct")

    selectAuthenticator = Select(driver.find_element(By.ID, "select-authenticator"))
    selectAuthenticator.select_by_value("cross-platform")

    driver.find_element(By.ID, "register-button").click()

    login = driver.find_element(By.ID, "login-button")
    WebDriverWait(driver, 50).until(lambda x: x.find_element(By.ID, "login-button").is_displayed())
    login.click()

    WebDriverWait(driver, 40).until(lambda x: x.find_element(By.CLASS_NAME, "col-lg-12").is_displayed())

    source: str = driver.page_source

    if "You're logged in!" in source:
        assert True
    else:
        assert False
