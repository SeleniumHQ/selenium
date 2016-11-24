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
    module IE
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 5555
        @executable = 'IEDriverServer'.freeze
        @missing_text = <<-ERROR.gsub(/\n +| {2,}/, ' ').freeze
          Unable to find IEDriverServer. Please download the server from
          http://selenium-release.storage.googleapis.com/index.html and place it somewhere on your PATH.
          More info at https://github.com/SeleniumHQ/selenium/wiki/InternetExplorerDriver.
        ERROR

        private

        def start_process
          server_command = [@executable_path, "--port=#{@port}", *@extra_args]
          @process       = ChildProcess.new(*server_command)

          @process.io.inherit! if $DEBUG
          @process.start
        end

        def cannot_connect_error_text
          "unable to connect to IE server #{@host}:#{@port}"
        end
      end # Server
    end # IE
  end # WebDriver
end # Selenium
