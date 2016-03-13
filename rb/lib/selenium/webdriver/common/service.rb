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

    #
    # @api private
    #

    class Service
      START_TIMEOUT       = 20
      SOCKET_LOCK_TIMEOUT = 45
      STOP_TIMEOUT        = 5

      def self.executable_path=(path)
        Platform.assert_executable path
        @executable_path = path
      end

      def initialize(executable_path, port, *extra_args)
        @executable_path = executable_path
        @host            = Platform.localhost
        @port            = Integer(port)
        @extra_args      = extra_args

        raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1
      end

      def start
        Platform.exit_hook { stop } # make sure we don't leave the server running

        socket_lock.locked do
          find_free_port
          start_process
          connect_until_stable
        end
      end

      def stop
        return if @process.nil? || @process.exited?

        stop_server
      ensure
        stop_process
      end

      def uri
        @uri ||= URI.parse("http://#{@host}:#{@port}")
      end

      private

      def find_free_port
        @port = PortProber.above(@port)
      end

      def start_process
        raise NotImplementedError, "subclass responsibility"
      end

      def stop_server
        Net::HTTP.start(@host, @port) do |http|
          http.open_timeout = STOP_TIMEOUT / 2
          http.read_timeout = STOP_TIMEOUT / 2

          http.get("/shutdown")
        end
      end

      def stop_process
        @process.poll_for_exit STOP_TIMEOUT
      rescue ChildProcess::TimeoutError
        @process.stop STOP_TIMEOUT
      end

      def connect_until_stable
        raise NotImplementedError, "subclass responsibility"
      end

      def socket_lock
        @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
      end

    end # Chrome
  end # WebDriver
end # Service
