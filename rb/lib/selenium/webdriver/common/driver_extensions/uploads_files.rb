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
    #
    # @api private
    #

    module DriverExtensions
      module UploadsFiles
        #
        # Set the file detector to pass local files to a remote WebDriver.
        #
        # The detector is an object that responds to #call, and when called
        # will determine if the given string represents a file. If it does,
        # the path to the file on the local file system should be returned,
        # otherwise nil or false.
        #
        # Example:
        #
        #     driver = Selenium::WebDriver.for :remote
        #     driver.file_detector = lambda do |args|
        #        # args => ["/path/to/file"]
        #        str = args.first.to_s
        #        str if File.exist?(str)
        #     end
        #
        #     driver.find_element(:id => "upload").send_keys "/path/to/file"
        #
        # By default, no file detection is performed.
        #
        # @api public
        #

        def file_detector=(detector)
          unless detector.nil? || detector.respond_to?(:call)
            raise ArgumentError, 'detector must respond to #call'
          end

          bridge.file_detector = detector
        end
      end # UploadsFiles
    end # DriverExtensions
  end # WebDriver
end # Selenium
