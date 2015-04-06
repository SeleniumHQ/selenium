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

      class Service
        START_TIMEOUT = 20
        STOP_TIMEOUT  = 5
        DEFAULT_PORT  = 9515
        MISSING_TEXT  = "Unable to find the chromedriver executable. Please download the server from http://chromedriver.storage.googleapis.com/index.html and place it somewhere on your PATH. More info at https://github.com/SeleniumHQ/selenium/wiki/ChromeDriver."

        attr_reader :uri

        def self.executable_path
          @executable_path ||= (
            path = Platform.find_binary "chromedriver"
            path or raise Error::WebDriverError, MISSING_TEXT
            Platform.assert_executable path

            path
          )
        end

        def self.executable_path=(path)
          Platform.assert_executable path
          @executable_path = path
        end

        def self.default_service(*extra_args)
          new executable_path, PortProber.above(DEFAULT_PORT), *extra_args
        end

        def initialize(executable_path, port, *extra_args)
          @uri           = URI.parse "http://#{Platform.localhost}:#{port}"
          server_command = [executable_path, "--port=#{port}", *extra_args]

          @process       = ChildProcess.build(*server_command)
          @socket_poller = SocketPoller.new Platform.localhost, port, START_TIMEOUT

          @process.io.inherit! if $DEBUG == true
        end

        def start
          @process.start

          unless @socket_poller.connected?
            raise Error::WebDriverError, "unable to connect to chromedriver #{@uri}"
          end

          Platform.exit_hook { stop } # make sure we don't leave the server running
        end

        def stop
          return if @process.nil? || @process.exited?

          Net::HTTP.start(uri.host, uri.port) do |http|
            http.open_timeout = STOP_TIMEOUT / 2
            http.read_timeout = STOP_TIMEOUT / 2

            http.head("/shutdown")
          end

          @process.poll_for_exit STOP_TIMEOUT
        rescue ChildProcess::TimeoutError
          # ok, force quit
          @process.stop STOP_TIMEOUT
        end
      end # Service

    end # Chrome
  end # WebDriver
end # Service