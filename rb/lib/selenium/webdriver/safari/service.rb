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
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 7050
        EXECUTABLE = 'safaridriver'
        MISSING_TEXT = <<~ERROR
          Unable to find Apple's safaridriver which comes with Safari 10.
          More info at https://webkit.org/blog/6900/webdriver-support-in-safari-10/
        ERROR
        SHUTDOWN_SUPPORTED = false
      end # Service
    end # Safari
  end # WebDriver
end # Selenium
