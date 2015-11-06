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

      class Service
        START_TIMEOUT       = 20
        SOCKET_LOCK_TIMEOUT = 45
        STOP_TIMEOUT        = 5
        DEFAULT_PORT        = 8910
        MISSING_TEXT        = "Unable to find phantomjs executable."

        def self.executable_path
          @executable_path ||= (
            path = PhantomJS.path
            path or raise Error::WebDriverError, MISSING_TEXT
            Platform.assert_executable path

            path
          )
        end

        def self.default_service(port = nil)
          new executable_path, DEFAULT_PORT
        end

        def initialize(executable_path, port)
          @host       = Platform.localhost
          @executable = executable_path
          @port       = Integer(port)
        end

        def start(args = [])
          if @process && @process.alive?
            raise "already started: #{uri.inspect} #{@executable.inspect}"
          end

          Platform.exit_hook { stop } # make sure we don't leave the server running

          socket_lock.locked do
            find_free_port
            start_process(args)
            connect_until_stable
          end
        end

        def stop
          return if @process.nil? || @process.exited?

          Net::HTTP.start(@host, @port) do |http|
            http.open_timeout = STOP_TIMEOUT / 2
            http.read_timeout = STOP_TIMEOUT / 2

            http.get("/shutdown")
          end

          @process.poll_for_exit STOP_TIMEOUT
        rescue ChildProcess::TimeoutError
          # ok, force quit
          @process.stop STOP_TIMEOUT

          if Platform.jruby? && !$DEBUG
            @process.io.close rescue nil
          end
        end

        def find_free_port
          @port = PortProber.above @port
        end

        def uri
          URI.parse "http://#{@host}:#{@port}"
        end

        private

        def start_process(args)
          server_command = [@executable, "--webdriver=#{@port}", *args]
          @process = ChildProcess.build(*server_command.compact)

          if $DEBUG == true
            @process.io.inherit!
          elsif Platform.jruby?
            # apparently we need to read the output for phantomjs to work on jruby
            @process.io.stdout = @process.io.stderr = File.new(Platform.null_device, 'w')
          end

          @process.start
        end

        def connect_until_stable
          socket_poller = SocketPoller.new @host, @port, START_TIMEOUT

          unless socket_poller.connected?
            raise Error::WebDriverError, "unable to connect to phantomjs @ #{uri} after #{START_TIMEOUT} seconds"
          end
        end

        def socket_lock
          @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
        end

      end # Service
    end # PhantomJS
  end # WebDriver
end # Service
