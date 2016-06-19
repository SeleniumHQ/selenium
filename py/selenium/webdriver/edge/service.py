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

from subprocess import PIPE
from selenium.webdriver.common import service


class Service(service.Service):
    def __init__(self, executable_path, port=0, log_file=PIPE):
        service.Service.__init__(self, executable_path, port=port, log_file=log_file,
                                 start_error_message="Please download from http://go.microsoft.com/fwlink/?LinkId=619687 ")

    def command_line_args(self):
        return ["--port=%d" % self.port]
