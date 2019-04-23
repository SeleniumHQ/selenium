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
    #
    # Base class implementing default behavior of service object,
    # responsible for starting and stopping driver implementations.
    #

    class Service
      START_TIMEOUT = 20
      SOCKET_LOCK_TIMEOUT = 45
      STOP_TIMEOUT = 20

      @default_port = nil
      @driver_path = nil
      @executable = nil
      @missing_text = nil

      class << self
        attr_reader :default_port, :driver_path, :executable, :missing_text, :shutdown_supported

        def chrome(*args)
          Chrome::Service.new(*args)
        end

        def firefox(*args)
          Firefox::Service.new(*args)
        end

        def ie(*args)
          IE::Service.new(*args)
        end
        alias_method :internet_explorer, :ie

        def edge(*args)
          Edge::Service.new(*args)
        end

        def safari(*args)
          Safari::Service.new(*args)
        end

        def driver_path=(path)
          Platform.assert_executable path if path.is_a?(String)
          @driver_path = path
        end
      end

      attr_accessor :host
      attr_reader :executable_path

      #
      # End users should use a class method for the desired driver, rather than using this directly.
      #
      # @api private
      #

      def initialize(path: nil, port: nil, args: nil)
        path ||= self.class.driver_path
        port ||= self.class.default_port
        args ||= []

        @executable_path = binary_path(path)
        @host = Platform.localhost
        @port = Integer(port)

        @extra_args = args.is_a?(Hash) ? extract_service_args(args) : args

        raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1
      end

      def start
        raise "already started: #{uri.inspect} #{@executable_path.inspect}" if process_running?

        Platform.exit_hook(&method(:stop)) # make sure we don't leave the server running

        socket_lock.locked do
          find_free_port
          start_process
          connect_until_stable
        end
      end

      def stop
        return unless self.class.shutdown_supported

        stop_server
        @process.poll_for_exit STOP_TIMEOUT
      rescue ChildProcess::TimeoutError
        nil # noop
      ensure
        stop_process
      end

      def uri
        @uri ||= URI.parse("http://#{@host}:#{@port}")
      end

      private

      def binary_path(path = nil)
        path = path.call if path.is_a?(Proc)
        path ||= Platform.find_binary(self.class.executable)

        raise Error::WebDriverError, self.class.missing_text unless path

        Platform.assert_executable path
        path
      end

      def build_process(*command)
        WebDriver.logger.debug("Executing Process #{command}")
        @process = ChildProcess.build(*command)
        if WebDriver.logger.debug?
          @process.io.stdout = @process.io.stderr = WebDriver.logger.io
        elsif Platform.jruby?
          # Apparently we need to read the output of drivers on JRuby.
          @process.io.stdout = @process.io.stderr = File.new(Platform.null_device, 'w')
        end

        @process
      end

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
        @process = build_process(@executable_path, "--port=#{@port}", *@extra_args)
        # Note: this is a bug only in Windows 7
        @process.leader = true unless Platform.windows?
        @process.start
      end

      def stop_process
        return if process_exited?

        @process.stop STOP_TIMEOUT
        @process.io.stdout.close if Platform.jruby? && !WebDriver.logger.debug?
      end

      def stop_server
        return if process_exited?

        connect_to_server { |http| http.get('/shutdown') }
      end

      def process_running?
        defined?(@process) && @process&.alive?
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
        "unable to connect to #{self.class.executable} #{@host}:#{@port}"
      end

      def socket_lock
        @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
      end

      protected

      def extract_service_args(driver_opts)
        driver_opts.key?(:args) ? driver_opts.delete(:args) : []
      end

    end # Service
  end # WebDriver
end # Selenium
