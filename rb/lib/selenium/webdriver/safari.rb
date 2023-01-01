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
    module Safari
      autoload :Features, 'selenium/webdriver/safari/features'
      autoload :Driver, 'selenium/webdriver/safari/driver'
      autoload :Options, 'selenium/webdriver/safari/options'
      autoload :Service, 'selenium/webdriver/safari/service'

      class << self
        attr_accessor :use_technology_preview

        def technology_preview
          '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver'
        end

        def technology_preview!
          Service.driver_path = technology_preview
          @use_technology_preview = true
        end

        def technology_preview?
          use_technology_preview
        end

        def path=(path)
          Platform.assert_executable(path)
          @path = path
        end

        def path
          @path ||= '/Applications/Safari.app/Contents/MacOS/Safari'
          return @path if File.file?(@path) && File.executable?(@path)
          raise Error::WebDriverError, 'Safari is only supported on Mac' unless Platform.os.mac?

          raise Error::WebDriverError, 'Unable to find Safari'
        end
      end
    end # Safari
  end # WebDriver
end # Selenium
