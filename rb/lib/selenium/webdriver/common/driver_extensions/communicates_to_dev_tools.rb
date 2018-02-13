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
    module DriverExtensions
      module CommunicatesToDevTools

        #
        # Send commands to the Chrome DevTools Debugger.
        # Refer: https://chromedevtools.github.io/devtools-protocol/
        #
        # @example
        #   driver.send_devtools_command('Page.navigate', {url: 'http://www.google.com'})
        #
        # @param [String] command The command to send to DevTools.
        # @param [Hash] parameters The paramters of the respective command.
        #

        def send_devtools_command(command, parameters)
          @bridge.send_devtools_command(command, parameters)
        end

        #
        # Chrome's headless mode has Downloads disabled by default.
        # Use this method to enable it and set a download directory
        #
        # @example
        #   driver.download_path='/some/dir/which/exists/'
        #
        # @param [String] path The path to set as the download directory
        #

        def download_path=(path)
          @bridge.send_devtools_command('Page.setDownloadBehavior', behavior: 'allow', downloadPath: path)
        end

      end # CommunicatesToDevTools
    end # DriverExtensions
  end # WebDriver
end # Selenium
