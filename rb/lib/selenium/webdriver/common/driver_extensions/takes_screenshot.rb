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
    #
    # @api private
    #

    module DriverExtensions
      module TakesScreenshot
        #
        # Save a PNG screenshot to the given path
        #
        # @api public
        #

        def save_screenshot(png_path)
          extension = File.extname(png_path).downcase
          if extension != '.png'
            WebDriver.logger.warn "name used for saved screenshot does not match file type. "\
                                  "It should end with .png extension"
          end
          File.open(png_path, 'wb') { |f| f << screenshot_as(:png) }
        end

        #
        # Return a PNG screenshot in the given format as a string
        #
        # @param [:base64, :png] format
        # @return String screenshot
        #
        # @api public

        def screenshot_as(format)
          case format
          when :base64
            bridge.screenshot
          when :png
            bridge.screenshot.unpack1('m')
          else
            raise Error::UnsupportedOperationError, "unsupported format: #{format.inspect}"
          end
        end
      end # TakesScreenshot
    end # DriverExtensions
  end # WebDriver
end # Selenium
