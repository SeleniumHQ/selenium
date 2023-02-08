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

from base64 import urlsafe_b64decode
from base64 import urlsafe_b64encode
from typing import Tuple

import pytest

from selenium.webdriver.common.virtual_authenticator import Credential

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


@pytest.fixture()
def data() -> Tuple:
    _id = bytearray({1, 2, 3, 4})
    rp_id = "localhost"
    user_handle = bytearray({1})
    privatekey = urlsafe_b64decode(BASE64__ENCODED_PK)
    sign_count = 0
    return (_id, rp_id, user_handle, privatekey, sign_count)


def test_rk_enabled_credential(data):
    _id, rp_id, user_handle, privatekey, sign_count = data

    credential = Credential.create_resident_credential(_id, rp_id, user_handle, privatekey, sign_count)
    assert credential.id == urlsafe_b64encode(bytearray({1, 2, 3, 4})).decode()
    if credential.is_resident_credential is True:
        assert True
    assert credential.rp_id == "localhost"
    assert credential.user_handle == urlsafe_b64encode(bytearray({1})).decode()
    assert credential.private_key == urlsafe_b64encode(privatekey).decode()
    assert credential.sign_count == 0


def test_rk_disabled_credentials(data):
    _id, rp_id, user_handle, privatekey, sign_count = data
    credential = Credential.create_non_resident_credential(_id, rp_id, privatekey, sign_count)

    assert credential.id == urlsafe_b64encode(bytearray({1, 2, 3, 4})).decode()
    assert credential.private_key == urlsafe_b64encode(privatekey).decode()
    assert credential.sign_count == 0
    assert credential.rp_id == "localhost"
    if credential.is_resident_credential is False:
        assert True
    else:
        assert False
    if credential.user_handle is None:
        assert True
    else:
        assert False


def test_to_dict(data):
    _id, rp_id, user_handle, privatekey, sign_count = data
    credential = Credential.create_resident_credential(_id, rp_id, user_handle, privatekey, sign_count)

    credential_dict = credential.to_dict()
    assert credential_dict["credentialId"] == urlsafe_b64encode(bytearray({1, 2, 3, 4})).decode()
    if credential_dict["isResidentCredential"] is True:
        assert True
    else:
        assert False
    assert credential_dict["rpId"] == "localhost"
    assert credential_dict["userHandle"] == urlsafe_b64encode(bytearray({1})).decode()
    assert credential_dict["privateKey"] == urlsafe_b64encode(privatekey).decode()
    assert credential_dict["signCount"] == 0


def test_from_dict():
    data = {
        "credentialId": urlsafe_b64encode(bytearray({1, 2, 3, 4})).decode(),
        "isResidentCredential": True,
        "rpId": "localhost",
        "userHandle": urlsafe_b64encode(bytearray({1})).decode(),
        "privateKey": BASE64__ENCODED_PK,
        "signCount": 0,
    }

    credential = Credential.from_dict(data)

    key = urlsafe_b64decode(BASE64__ENCODED_PK)

    assert credential.id == urlsafe_b64encode(bytearray({1, 2, 3, 4})).decode()
    if credential.is_resident_credential is True:
        assert True
    else:
        assert False
    assert credential.rp_id == "localhost"
    assert credential.user_handle == urlsafe_b64encode(bytearray({1})).decode()
    assert credential.private_key == urlsafe_b64encode(key).decode()
    assert credential.sign_count == 0
