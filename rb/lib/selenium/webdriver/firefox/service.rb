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
    module Firefox
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 4444

        private

        def start_process
          server_command = [@executable_path, "--binary=#{Firefox::Binary.path}", "--port=#{@port}", *@extra_args]
          @process       = ChildProcess.build(*server_command)

          if $DEBUG
            @process.io.inherit!
          elsif Platform.windows?
            # workaround stdio inheritance issue
            # https://github.com/mozilla/geckodriver/issues/48
            @process.io.stdout = @process.io.stderr = File.new(Platform.null_device, 'w')
          end

          @process.start
        end

        def stop_process
          super
          return unless Platform.windows? && !$DEBUG
          begin
            @process.io.close
          rescue
            nil
          end
        end

        def stop_server
          connect_to_server { |http| http.head('/shutdown') }
        end

        def cannot_connect_error_text
          "unable to connect to Mozilla geckodriver #{@host}:#{@port}"
        end
      end # Service
    end # Firefox
  end # WebDriver
end # Selenium
