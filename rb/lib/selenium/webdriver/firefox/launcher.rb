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
    module Firefox
      # @api private
      class Launcher
        SOCKET_LOCK_TIMEOUT       = 45
        STABLE_CONNECTION_TIMEOUT = 60

        def initialize(binary, port, profile = nil)
          @binary = binary
          @port   = Integer(port)

          raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1

          if profile.is_a? Profile
            @profile = profile
          else
            @profile_name = profile
            @profile = nil
          end

          @host = '127.0.0.1'
        end

        def url
          "http://#{@host}:#{@port}/hub"
        end

        def launch
          socket_lock.locked do
            find_free_port
            create_profile
            start
            connect_until_stable
          end

          self
        end

        def quit
          @binary.quit
          FileReaper.reap(@profile_dir) if @profile_dir
        end

        def find_free_port
          @port = PortProber.above @port
        end

        def create_profile
          fetch_profile unless @profile

          @profile.add_webdriver_extension
          @profile.port = @port

          @profile_dir = @profile.layout_on_disk
          FileReaper << @profile_dir
        end

        def start
          assert_profile
          @binary.start_with @profile, @profile_dir, '-foreground'
        end

        def connect_until_stable
          poller = SocketPoller.new(@host, @port, STABLE_CONNECTION_TIMEOUT)

          return if poller.connected?

          @binary.quit
          error = "unable to obtain stable firefox connection in #{STABLE_CONNECTION_TIMEOUT} seconds (#{@host}:#{@port})"
          raise Error::WebDriverError, error
        end

        def fetch_profile
          @profile = if @profile_name
                       Profile.from_name @profile_name
                     else
                       Profile.new
                     end
        end

        def assert_profile
          raise Error::WebDriverError, 'must create_profile first' unless @profile && @profile_dir
        end

        def socket_lock
          @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
        end
      end # Launcher
    end # Firefox
  end # WebDriver
end # Selenium
