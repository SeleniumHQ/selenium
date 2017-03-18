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
    # Base class implementing default behavior of service object,
    # responsible for starting and stopping driver implementations.
    #
    # Subclasses must implement the following private methods:
    #   * #start_process
    #   * #stop_server
    #   * #cannot_connect_error_text
    #
    # @api private
    #

    class Service
      START_TIMEOUT       = 20
      SOCKET_LOCK_TIMEOUT = 45
      STOP_TIMEOUT        = 20

      @executable = nil
      @missing_text = nil

      class << self
        attr_reader :executable, :missing_text
      end

      attr_accessor :host

      def initialize(executable_path, port, driver_opts)
        @executable_path = binary_path(executable_path)
        @host            = Platform.localhost
        @port            = Integer(port)
        @extra_args      = extract_service_args(driver_opts)

        raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1
      end

      def binary_path(path)
        path = Platform.find_binary(self.class.executable) if path.nil?
        raise Error::WebDriverError, self.class.missing_text unless path
        Platform.assert_executable path
        path
      end

      def start
        if process_running?
          raise "already started: #{uri.inspect} #{@executable_path.inspect}"
        end

        Platform.exit_hook { stop } # make sure we don't leave the server running

        socket_lock.locked do
          find_free_port
          start_process
          connect_until_stable
        end
      end

      def stop
        stop_server
        @process.poll_for_exit STOP_TIMEOUT
      rescue ChildProcess::TimeoutError
      ensure
        stop_process
      end

      def uri
        @uri ||= URI.parse("http://#{@host}:#{@port}")
      end

      private

      def connect_to_server
        Net::HTTP.start(@host, @port) do |http|
          http.open_timeout = STOP_TIMEOUT / 2
          http.read_timeout = STOP_TIMEOUT / 2

          yield http
        end
      end

      def find_free_port
        @port = PortProber.above(@port)
      end

      def start_process
        raise NotImplementedError, 'subclass responsibility'
      end

      def stop_process
        return if process_exited?
        @process.stop STOP_TIMEOUT
      end

      def stop_server
        return if process_exited?
        connect_to_server { |http| http.get('/shutdown') }
      end

      def process_running?
        @process && @process.alive?
      end

      def process_exited?
        @process.nil? || @process.exited?
      end

      def connect_until_stable
        socket_poller = SocketPoller.new @host, @port, START_TIMEOUT
        return if socket_poller.connected?
        raise Error::WebDriverError, cannot_connect_error_text
      end

      def cannot_connect_error_text
        raise NotImplementedError, 'subclass responsibility'
      end

      def socket_lock
        @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
      end

      protected

      def extract_service_args(driver_opts)
        driver_opts.key?(:args) ? driver_opts.delete(:args) :  []
      end

    end # Service
  end # WebDriver
end # Selenium
