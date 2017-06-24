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
    module DriverExtensions
      module HasAddons

        #
        # Installs addon.
        #
        # @param [String] path Full path to addon file
        # @param [Boolean] temporary
        # @return [String] identifier of installed addon
        #

        def install_addon(path, temporary = nil)
          @bridge.install_addon(path, temporary)
        end

        #
        # Uninstalls addon.
        #
        # @param [String] id Identifier of installed addon
        #

        def uninstall_addon(id)
          @bridge.uninstall_addon(id)
        end

      end # HasAddons
    end # DriverExtensions
  end # WebDriver
end # Selenium
