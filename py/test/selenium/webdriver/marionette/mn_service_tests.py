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

from selenium.webdriver.firefox.service import Service


def test_command_line_args():
    service = Service(service_args=["--log", "trace"])
    found = False

    args = service.command_line_args()

    for idx in range(len(args) - 1):
        if args[idx] == "--log" and args[idx + 1] == "trace":
            found = True
            break

    assert found, "Provided arguments do not exist in array"
