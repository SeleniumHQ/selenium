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
    class PortProber
      def self.above(port)
        port += 1 until free? port
        port
      end

      def self.random
        # TODO: Avoid this
        #
        # (a) should pick a port that's guaranteed to be free on all interfaces
        # (b) should pick a random port outside the ephemeral port range
        #
        server = TCPServer.new(Platform.localhost, 0)
        port   = server.addr[1]
        server.close

        port
      end

      IGNORED_ERRORS = [Errno::EADDRNOTAVAIL]
      IGNORED_ERRORS << Errno::EBADF if Platform.cygwin?
      IGNORED_ERRORS << Errno::EACCES if Platform.windows?
      IGNORED_ERRORS.freeze

      def self.free?(port)
        Platform.interfaces.each do |host|
          begin
            TCPServer.new(host, port).close
          rescue *IGNORED_ERRORS => ex
            WebDriver.logger.debug("port prober could not bind to #{host}:#{port} (#{ex.message})")
            # ignored - some machines appear unable to bind to some of their interfaces
          end
        end

        true
      rescue SocketError, Errno::EADDRINUSE
        false
      end
    end # PortProber
  end # WebDriver
end # Selenium
