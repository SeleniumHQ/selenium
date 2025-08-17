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
    module DriverExtensions
      module HasDevTools
        #
        # Retrieves connection to DevTools.
        #
        # @return [DevTools]
        #

        def devtools(target_type: 'page')
          @devtools ||= {}
          @devtools[target_type] ||= begin
            require 'selenium/devtools'
            Selenium::DevTools.version ||= devtools_version
            Selenium::DevTools.load_version
            Selenium::WebDriver::DevTools.new(url: devtools_url, target_type: target_type)
          end
        end
      end # HasDevTools
    end # DriverExtensions
  end # WebDriver
end # Selenium
