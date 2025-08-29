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


from selenium.webdriver import Remote


class TestService:
    service_url = "foo"

    def __init__(self, deleted_flag):
        self.deleted_flag = deleted_flag

    def __del__(self):
        self.deleted_flag["deleted"] = True


class TestRemote(Remote):
    def __init__(self, command_executor, arg, kwarg):
        assert command_executor == "foo"
        assert arg == "arg_value"
        assert kwarg == "kwarg_value"


def test_from_service(mocker):
    deleted_flag = {"deleted": False}
    service = TestService(deleted_flag)
    remote = TestRemote.from_service(service, "arg_value", kwarg="kwarg_value")
    del service
    # Even after deleting the local reference, the Service is not GC'ed
    assert not deleted_flag["deleted"]
    del remote
    # After deleting the Remote, the Service is GC'ed
    assert deleted_flag["deleted"]
