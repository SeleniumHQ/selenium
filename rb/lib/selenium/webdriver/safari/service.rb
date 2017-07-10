# encoding: utf-8
#
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
        @executable = '/usr/bin/safaridriver'.freeze
        @missing_text = <<-ERROR.gsub(/\n +| {2,}/, ' ').freeze
          Unable to find Apple's safaridriver which comes with Safari 10.
          More info at https://webkit.org/blog/6900/webdriver-support-in-safari-10/
        ERROR

        def stop
          stop_process
        end

        private

        def binary_path(path)
          path = self.class.executable if path.nil?
          raise Error::WebDriverError, self.class.missing_text unless path
          Platform.assert_executable path
          path
        end

        def start_process
          @process = build_process(@executable_path, "--port=#{@port}", *@extra_args)
          @process.start
        end

        def cannot_connect_error_text
          "unable to connect to safaridriver #{@host}:#{@port}"
        end
      end # Service
    end # Safari
  end # WebDriver
end # Selenium
