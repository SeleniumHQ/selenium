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

import uuid

from selenium.webdriver.remote.script_key import ScriptKey


def test_script_key_equality():
    u = uuid.uuid4()
    key1 = ScriptKey(u)
    key2 = ScriptKey(u)
    key3 = ScriptKey(uuid.uuid4())

    assert key1 == key2
    assert key1 == u
    assert key1 != key3
    assert key1 != "not-a-key"


def test_script_key_hash():
    u = uuid.uuid4()
    key1 = ScriptKey(u)
    key2 = ScriptKey(u)
    key3 = ScriptKey(uuid.uuid4())

    assert hash(key1) == hash(key2)
    assert hash(key1) == hash(u)
    assert hash(key1) != hash(key3)

    key_set = {key1, key3}
    assert key2 in key_set

    key_dict = {key1: "script_val"}
    assert key_dict[key2] == "script_val"


def test_script_key_repr():
    key = ScriptKey("custom_id")
    assert repr(key) == "ScriptKey(id=custom_id)"
