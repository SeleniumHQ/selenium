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

import os
import re

import pytest

from selenium.webdriver.remote.server import Server


def test_server_with_defaults():
    server = Server()
    assert server.host is None
    assert server.port == 4444
    assert server.path is None
    assert server.version is None
    assert server.log_level == "INFO"
    assert server.env is None


def test_server_with_args():
    server = Server("foo", 9999)
    assert server.host == "foo"
    assert server.port == 9999


def test_server_with_kwargs():
    server = Server(host="foo", port=9999, version="1.1.1", log_level="WARNING", env={"FOO": "bar"})
    assert server.host == "foo"
    assert server.port == 9999
    assert server.path is None
    assert server.version == "1.1.1"
    assert server.log_level == "WARNING"
    assert server.env == {"FOO": "bar"}


def test_server_with_invalid_port():
    port = "invalid"
    msg = f"Server.__init__() got an invalid port: '{port}'"
    with pytest.raises(TypeError, match=re.escape(msg)):
        Server(port=port)


def test_server_with_port_out_of_range():
    with pytest.raises(ValueError, match="port must be 0-65535"):
        Server(port=99999)


def test_server_with_bad_path():
    path = "/path/to/nowhere"
    msg = f"Can't find server .jar located at {path}"
    with pytest.raises(OSError, match=re.escape(msg)):
        Server(path=path)


def test_server_with_invalid_version():
    versions = ("0.0", "invalid")
    for version in versions:
        msg = f"Server.__init__() got an invalid version: '{version}'"
        with pytest.raises(TypeError, match=re.escape(msg)):
            Server(version=version)


def test_server_with_invalid_log_level():
    msg = ", ".join(("SEVERE", "WARNING", "INFO", "CONFIG", "FINE", "FINER", "FINEST"))
    with pytest.raises(TypeError, match=f"log_level must be one of: {msg}"):
        Server(log_level="BAD")


def test_server_with_env_os_environ():
    server = Server(env=os.environ)
    assert isinstance(server.env, os._Environ)


def test_server_with_env_dict():
    env = {}
    server = Server(env=env)
    assert isinstance(server.env, dict)
    assert server.env == {}


def test_server_with_invalid_env():
    with pytest.raises(TypeError, match="env must be a mapping of environment variables"):
        Server(env=[])


def test_stopping_server_thats_not_running():
    server = Server()
    with pytest.raises(RuntimeError, match="Selenium server isn't running"):
        server.stop()
    assert server.process is None
