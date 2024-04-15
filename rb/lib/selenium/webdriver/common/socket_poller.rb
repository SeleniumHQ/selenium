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

require 'selenium/webdriver/common/platform'
require 'socket'

module Selenium
  module WebDriver
    class SocketPoller
      def initialize(host, port, timeout = 0, interval = 0.25)
        @host     = host
        @port     = Integer(port)
        @timeout  = Float(timeout)
        @interval = interval
      end

      #
      # Returns true if the server is listening within the given timeout,
      # false otherwise.
      #
      # @return [Boolean]
      #

      def connected?
        with_timeout { listening? }
      end

      #
      # Returns true if the server has stopped listening within the given timeout,
      # false otherwise.
      #
      # @return [Boolean]
      #

      def closed?
        with_timeout { !listening? }
      end

      private

      CONNECT_TIMEOUT = 5

      NOT_CONNECTED_ERRORS = [Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError].tap { |arr|
        arr << Errno::EPERM if Platform.cygwin?
      }.freeze

      CONNECTED_ERRORS = [Errno::EISCONN].tap { |arr|
        arr << Errno::EINVAL if Platform.windows?
        arr << Errno::EALREADY if Platform.wsl?
      }.freeze

      if Platform.jruby?
        # we use a plain TCPSocket here since JRuby has issues closing socket
        # see https://github.com/jruby/jruby/issues/5709
        def listening?
          TCPSocket.new(@host, @port).close
          true
        rescue *NOT_CONNECTED_ERRORS
          false
        end
      else
        def listening?
          addr     = Socket.getaddrinfo(@host, @port, Socket::AF_INET, Socket::SOCK_STREAM)
          sock     = Socket.new(Socket::AF_INET, Socket::SOCK_STREAM, 0)
          sockaddr = Socket.pack_sockaddr_in(@port, addr[0][3].to_s)

          begin
            sock.connect_nonblock sockaddr
          rescue Errno::EINPROGRESS
            retry if socket_writable?(sock) && conn_completed?(sock)
            raise Errno::ECONNREFUSED
          rescue *CONNECTED_ERRORS
            # yay!
          end

          sock.close
          true
        rescue *NOT_CONNECTED_ERRORS
          sock&.close
          WebDriver.logger.debug("polling for socket on #{[@host, @port].inspect}", id: :driver_service)
          false
        end
      end

      def socket_writable?(sock)
        sock.wait_writable(CONNECT_TIMEOUT)
      end

      def conn_completed?(sock)
        sock.getsockopt(Socket::SOL_SOCKET, Socket::SO_ERROR).int.zero?
      end

      def with_timeout
        max_time = current_time + @timeout

        until current_time > max_time
          return true if yield

          sleep @interval
        end

        false
      end

      def current_time
        Process.clock_gettime(Process::CLOCK_MONOTONIC)
      end
    end # SocketPoller
  end # WebDriver
end # Selenium
