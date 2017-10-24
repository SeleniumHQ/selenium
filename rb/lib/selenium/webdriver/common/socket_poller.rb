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

      NOT_CONNECTED_ERRORS = [Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError]
      NOT_CONNECTED_ERRORS << Errno::EPERM if Platform.cygwin?

      CONNECTED_ERRORS = [Errno::EISCONN]
      CONNECTED_ERRORS << Errno::EINVAL if Platform.windows?

      if Platform.jruby?
        # we use a plain TCPSocket here since JRuby has issues select()ing on a connecting socket
        # see http://jira.codehaus.org/browse/JRUBY-5165
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
          sockaddr = Socket.pack_sockaddr_in(@port, addr[0][3])

          begin
            sock.connect_nonblock sockaddr
          rescue Errno::EINPROGRESS
            retry if IO.select(nil, [sock], nil, CONNECT_TIMEOUT)
            raise Errno::ECONNREFUSED
          rescue *CONNECTED_ERRORS
            # yay!
          end

          sock.close
          true
        rescue *NOT_CONNECTED_ERRORS
          sock.close if sock
          WebDriver.logger.debug("polling for socket on #{[@host, @port].inspect}")
          false
        end
      end

      def with_timeout
        max_time = time_now + @timeout

        (
          return true if yield
          wait
        ) until time_now > max_time

        false
      end

      def wait
        sleep @interval
      end

      # for testability
      def time_now
        Time.now
      end
    end # SocketPoller
  end # WebDriver
end # Selenium
