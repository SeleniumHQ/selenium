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
    # Base class implementing default behavior of service_manager object,
    # responsible for starting and stopping driver implementations.
    #
    # @api private
    #
    class ServiceManager
      START_TIMEOUT = 20
      SOCKET_LOCK_TIMEOUT = 45
      STOP_TIMEOUT = 20

      @running = []
      @running_mutex = Mutex.new
      @exit_hook_pid = nil

      class << self
        #
        # Stops every service still running in this process.
        #

        def stop_running
          @running_mutex.synchronize { @running.dup }.each(&:stop)
        end

        #
        # Tracks a started service so it can be stopped at exit. One exit hook covers
        # all of them, so a service that has been stopped is not held onto.
        #

        def track(manager)
          @running_mutex.synchronize do
            unless @exit_hook_pid == Process.pid
              @exit_hook_pid = Process.pid
              @running.clear # anything inherited through a fork belongs to the parent
              Platform.exit_hook { stop_running }
            end

            @running << manager
          end
        end

        def untrack(manager)
          @running_mutex.synchronize { @running.delete(manager) }
        end
      end

      #
      # End users should use a class method for the desired driver, rather than using this directly.
      #
      # @api private
      #

      def initialize(config)
        @executable_path = config.executable_path
        @host = Platform.localhost
        @port = config.port
        @io = config.log
        @extra_args = config.args
        @shutdown_supported = config.shutdown_supported

        raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1
      end

      def start
        raise "already started: #{uri.inspect} #{@executable_path.inspect}" if process_running?

        self.class.track(self) # make sure we don't leave the server running

        socket_lock.locked do
          find_free_port
          start_process
          connect_until_stable
        end
      end

      def stop
        return unless @shutdown_supported
        return if process_exited?

        stop_server
        @process.poll_for_exit STOP_TIMEOUT
      rescue ChildProcess::TimeoutError, Errno::ECONNREFUSED
        nil # noop
      ensure
        stop_process
        self.class.untrack(self)
      end

      def uri
        @uri ||= URI.parse("http://#{@host}:#{@port}")
      end

      private

      def build_process(*command)
        WebDriver.logger.debug("Executing Process #{command}", id: :driver_service)
        @process = ChildProcess.build(*command)
        if ENV.key?('SE_DEBUG')
          if @io && @io != WebDriver.logger.io
            WebDriver.logger.warn('SE_DEBUG is set; overriding user-specified driver log output to use stderr',
                                  id: :se_debug)
          end
          @io = WebDriver.logger.io
        end
        @process.io = @io if @io

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
        @process.start
      end

      def stop_process
        return if process_exited?

        @process.stop STOP_TIMEOUT
      end

      def stop_server
        connect_to_server do |http|
          headers = WebDriver::Remote::Http::Common::DEFAULT_HEADERS.dup
          WebDriver.logger.debug('Sending shutdown request to server', id: :driver_service)
          http.get('/shutdown', headers)
        end
      end

      def process_running?
        defined?(@process) && @process&.alive?
      end

      def process_exited?
        @process.nil? || @process.exited?
      end

      def connect_until_stable
        deadline = current_time + START_TIMEOUT

        loop do
          error = check_connection_error
          return unless error

          raise Error::WebDriverError, "#{cannot_connect_error_text}: #{error}" if current_time > deadline

          sleep 0.1
        end
      end

      def check_connection_error
        response = Net::HTTP.start(@host, @port, open_timeout: 0.5, read_timeout: 1) do |http|
          http.get('/status', {'Connection' => 'close'})
        end

        return "status returned #{response.code}\n#{response.body}" unless response.is_a?(Net::HTTPSuccess)

        status = JSON.parse(response.body)
        ready = status['ready'] || status.dig('value', 'ready')
        "driver not ready: #{response.body}" unless ready
      rescue Errno::ECONNREFUSED, Errno::ECONNRESET, Errno::EPIPE, Errno::ETIMEDOUT,
             Errno::EADDRNOTAVAIL, Errno::EHOSTUNREACH, Net::OpenTimeout, Net::ReadTimeout,
             EOFError, SocketError, Net::HTTPBadResponse, JSON::ParserError => e
        "#{e.class}: #{e.message}"
      end

      def current_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end

      def cannot_connect_error_text
        "unable to connect to #{@executable_path} #{@host}:#{@port}"
      end

      def socket_lock
        @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
      end
    end # Service
  end # WebDriver
end # Selenium
