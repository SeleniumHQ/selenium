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
    module Remote

      #
      # Driver implementation for remote server.
      # @api private
      #

      class Driver < WebDriver::Driver
        include DriverExtensions::UploadsFiles
        include DriverExtensions::TakesScreenshot
        include DriverExtensions::HasSessionId
        include DriverExtensions::Rotatable
        include DriverExtensions::HasRemoteStatus
        include DriverExtensions::HasWebStorage

        def initialize(opts = {})
          listener = opts.delete(:listener)
          @bridge = Bridge.handshake(opts)
          if @bridge.dialect == :oss
            extend DriverExtensions::HasTouchScreen
            extend DriverExtensions::HasLocation
            extend DriverExtensions::HasNetworkConnection
          end
          super(@bridge, listener: listener)
        end

      end # Driver
    end # Remote
  end # WebDriver
end # Selenium
