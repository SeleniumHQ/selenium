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

import functools

from base64 import urlsafe_b64encode, urlsafe_b64decode
from enum import Enum
import typing
import sys

if typing.TYPE_CHECKING:
    if sys.version_info >= (3, 8):
        from typing import Literal
    else:
        from typing_extensions import Literal


class Protocol(Enum):
    """
    Protocol to communicate with the authenticator.
    """
    CTAP2 = "ctap2"
    U2F = "ctap1/u2f"


class Transport(Enum):
    """
    Transport method to communicate with the authenticator.
    """
    BLE = "ble"
    USB = "usb"
    NFC = "nfc"
    INTERNAL = "internal"


class VirtualAuthenticatorOptions:

    Protocol = Protocol
    Transport = Transport

    def __init__(self) -> None:
        """Constructor. Initialize VirtualAuthenticatorOptions object.

          :default:
            - protocol: Protocol.CTAP2
            - transport: Transport.USB
            - hasResidentKey: False
            - hasUserVerification: False
            - isUserConsenting: True
            - isUserVerified: False
        """

        self._protocol: Literal = Protocol.CTAP2
        self._transport: Literal = Transport.USB
        self._has_resident_key: bool = False
        self._has_user_verification: bool = False
        self._is_user_consenting: bool = True
        self._is_user_verified: bool = False

    @property
    def protocol(self) -> str:
        return self._protocol.value

    @protocol.setter
    def protocol(self, protocol: Protocol) -> None:
        self._protocol = protocol

    @property
    def transport(self) -> str:
        return self._transport.value

    @transport.setter
    def transport(self, transport: Transport) -> None:
        self._transport = transport

    @property
    def has_resident_key(self) -> None:
        return self._has_resident_key

    @has_resident_key.setter
    def has_resident_key(self, value: bool) -> None:
        self._has_resident_key = value

    @property
    def has_user_verification(self) -> None:
        return self._has_user_verification

    @has_user_verification.setter
    def has_user_verification(self, value: bool) -> None:
        self._has_user_verification = value

    @property
    def is_user_consenting(self) -> None:
        return self._is_user_consenting

    @is_user_consenting.setter
    def is_user_consenting(self, value: bool) -> None:
        self._is_user_consenting = value

    @property
    def is_user_verified(self) -> None:
        return self._is_user_verified

    @is_user_verified.setter
    def is_user_verified(self, value: bool) -> None:
        self._is_user_verified = value

    def to_dict(self) -> dict:
        return {
            "protocol": self.protocol,
            "transport": self.transport,
            "hasResidentKey": self.has_resident_key,
            "hasUserVerification": self.has_user_verification,
            "isUserConsenting": self.is_user_consenting,
            "isUserVerified": self.is_user_verified
        }


class Credential:
    def __init__(self, credential_id: bytes, is_resident_credential: bool, rp_id: str, user_handle: bytes, private_key: bytes, sign_count: int):
        """Constructor. A credential stored in a virtual authenticator.
        https://w3c.github.io/webauthn/#credential-parameters

        :Args:
            - credential_id (bytes): Unique base64 encoded string.
            is_resident_credential (bool): Whether the credential is client-side discoverable.
            rp_id (str): Relying party identifier.
            user_handle (bytes): userHandle associated to the credential. Must be Base64 encoded string. Can be None.
            private_key (bytes): Base64 encoded PKCS#8 private key.
            sign_count (int): intital value for a signature counter.
        """
        self._id = credential_id
        self._is_resident_credential = is_resident_credential
        self._rp_id = rp_id
        self._user_handle = user_handle
        self._private_key = private_key
        self._sign_count = sign_count

    @property
    def id(self):
        return urlsafe_b64encode(self._id).decode()

    @property
    def is_resident_credential(self) -> bool:
        return self._is_resident_credential

    @property
    def rp_id(self):
        return self._rp_id

    @property
    def user_handle(self):
        if self._user_handle:
            return urlsafe_b64encode(self._user_handle).decode()
        return None

    @property
    def private_key(self):
        return urlsafe_b64encode(self._private_key).decode()

    @property
    def sign_count(self):
        return self._sign_count

    @classmethod
    def create_non_resident_credential(cls, id: bytes, rp_id: str, private_key: bytes, sign_count: int) -> 'Credential':
        """Creates a non-resident (i.e. stateless) credential.

              :Args:
                - id (bytes): Unique base64 encoded string.
                - rp_id (str): Relying party identifier.
                - private_key (bytes): Base64 encoded PKCS
                - sign_count (int): intital value for a signature counter.

              :Returns:
                - Credential: A non-resident credential.
        """
        return cls(id, False, rp_id, None, private_key, sign_count)

    @classmethod
    def create_resident_credential(cls, id: bytes, rp_id: str, user_handle: bytes, private_key: bytes, sign_count: int) -> 'Credential':
        """Creates a resident (i.e. stateful) credential.

              :Args:
                - id (bytes): Unique base64 encoded string.
                - rp_id (str): Relying party identifier.
                - user_handle (bytes): userHandle associated to the credential. Must be Base64 encoded string.
                - private_key (bytes): Base64 encoded PKCS
                - sign_count (int): intital value for a signature counter.

              :returns:
                - Credential: A resident credential.
        """
        return cls(id, True, rp_id, user_handle, private_key, sign_count)

    def to_dict(self):
        credential_data = {
            'credentialId': self.id,
            'isResidentCredential': self._is_resident_credential,
            'rpId': self.rp_id,
            'privateKey': self.private_key,
            'signCount': self.sign_count,
        }

        if self.user_handle:
            credential_data['userHandle'] = self.user_handle

        return credential_data

    @classmethod
    def from_dict(cls, data):
        _id = urlsafe_b64decode(data['credentialId'])
        is_resident_credential = bool(data['isResidentCredential'])
        rp_id = str(data['rpId'])
        private_key = urlsafe_b64decode(data['privateKey'])
        sign_count = int(data['signCount'])
        user_handle = urlsafe_b64decode(data['userHandle']) \
            if data.get('userHandle', None) else None

        return cls(_id, is_resident_credential, rp_id, user_handle, private_key, sign_count)

    def __str__(self) -> str:
        return f"Credential(id={self.id}, is_resident_credential={self.is_resident_credential}, rp_id={self.rp_id},\
            user_handle={self.user_handle}, private_key={self.private_key}, sign_count={self.sign_count})"


def required_chromium_based_browser(func):
    """
    A decorator to ensure that the client used is a chromium based browser.
    """
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs):
        assert self.caps["browserName"].lower() not in ["firefox", "safari"], "This only currently works in Chromium based browsers"
        return func(self, *args, **kwargs)
    return wrapper


def required_virtual_authenticator(func):
    """
    A decorator to ensure that the function is called with a virtual authenticator.
    """
    @functools.wraps(func)
    @required_chromium_based_browser
    def wrapper(self, *args, **kwargs):
        if not self.virtual_authenticator_id:
            raise ValueError(
                "This function requires a virtual authenticator to be set."
            )
        return func(self, *args, **kwargs)
    return wrapper
