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
    # @api private
    #

    class SocketLock
      def initialize(port, timeout)
        @port    = port
        @server  = nil
        @timeout = timeout
      end

      #
      # Attempt to acquire a lock on the given port. Control is yielded to an
      # execution block if the lock could be successfully obtained.
      #

      def locked
        lock

        begin
          yield
        ensure
          release
        end
      end

      private

      def lock
        max_time = current_time + @timeout

        sleep 0.1 until can_lock? || current_time >= max_time

        return if did_lock?

        raise Error::WebDriverError, "unable to bind to locking port #{@port} within #{@timeout} seconds"
      end

      def current_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end

      def release
        @server&.close
      end

      def can_lock?
        @server = TCPServer.new(Platform.localhost, @port)
        @server.close_on_exec = true
        true
      rescue SocketError, Errno::EADDRINUSE, Errno::EBADF => e
        WebDriver.logger.debug("#{self}: #{e.message}", id: :driver_service)
        false
      end

      def did_lock?
        !@server.nil?
      end
    end # SocketLock
  end # WebDriver
end # Selenium
