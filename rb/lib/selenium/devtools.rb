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
  module DevTools
    class << self
      attr_accessor :version

      def load_version
        require "selenium/devtools/v#{@version}"
      rescue LoadError
        WebDriver.logger.warn "Could not load selenium-devtools v#{@version}. Trying older versions.",
                              id: :devtools
        load_older_version
      end

      private

      # Try to load up to 2 versions back
      def load_older_version
        load_old_version(@version - 1)
      rescue LoadError
        begin
          load_old_version(@version - 2)
        rescue LoadError
          raise WebDriver::Error::WebDriverError,
                'Could not find a valid devtools version; use a more recent version of selenium-devtools gem'
        end
      end

      def load_old_version(version)
        require "selenium/devtools/v#{version}"
        self.version = version
        msg = "Using selenium-devtools version v#{version}, some features may not work as expected."
        WebDriver.logger.warn msg, id: :devtools
      end
    end
  end # DevTools
end # Selenium
