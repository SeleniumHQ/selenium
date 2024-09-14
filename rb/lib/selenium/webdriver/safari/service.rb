# frozen_string_literal: true

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

module Selenium
  module WebDriver
    module Safari
      class Service < WebDriver::Service
        DEFAULT_PORT = 7050
        EXECUTABLE = 'safaridriver'
        SHUTDOWN_SUPPORTED = false
        DRIVER_PATH_ENV_KEY = 'SE_SAFARIDRIVER'
        def initialize(path: nil, port: nil, log: nil, args: nil)
          raise Error::WebDriverError, 'Safari Service does not support setting log output' if log

          super
        end

        def log=(*)
          raise Error::WebDriverError, 'Safari Service does not support setting log output'
        end
      end # Service
    end # Safari
  end # WebDriver
end # Selenium
