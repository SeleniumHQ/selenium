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
    module Chrome
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 9515

        private

        def start_process
          server_command = [@executable_path, "--port=#{@port}", *@extra_args]
          @process       = ChildProcess.build(*server_command)

          @process.io.inherit! if $DEBUG
          @process.start
        end

        def stop_server
          connect_to_server { |http| http.get('/shutdown') }
        end

        def cannot_connect_error_text
          "unable to connect to chromedriver #{@host}:#{@port}"
        end
      end # Service
    end # Chrome
  end # WebDriver
end # Selenium
