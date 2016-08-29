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
    module PhantomJS
      #
      # @api private
      #

      class Service < WebDriver::Service
        DEFAULT_PORT = 8910

        private

        def start_process
          server_command = [@executable_path, "--webdriver=#{@port}", *@extra_args]
          @process = ChildProcess.build(*server_command.compact)

          if $DEBUG
            @process.io.inherit!
          elsif Platform.jruby?
            # apparently we need to read the output for phantomjs to work on jruby
            @process.io.stdout = @process.io.stderr = File.new(Platform.null_device, 'w')
          end

          @process.start
        end

        def stop_process
          super
          return unless Platform.jruby? && !$DEBUG
          begin
            @process.io.close
          rescue
            nil
          end
        end

        def stop_server
          connect_to_server { |http| http.get('/shutdown') }
        end

        def cannot_connect_error_text
          "unable to connect to phantomjs @ #{uri} after #{START_TIMEOUT} seconds"
        end
      end # Service
    end # PhantomJS
  end # WebDriver
end # Selenium
