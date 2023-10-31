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
      module HasFileDownloads
        def downloadable_files
          verify_enabled

          @bridge.downloadable_files['names']
        end

        def download_file(file_name, target_directory)
          verify_enabled

          response = @bridge.download_file(file_name)
          contents = response['contents']

          File.open("#{file_name}.zip", 'wb') { |f| f << Base64.decode64(contents) }
          target_directory += '/' unless target_directory.end_with?('/')
          FileUtils.mkdir_p(target_directory)

          begin
            Zip::File.open("#{file_name}.zip") do |zip|
              zip.each { |entry| zip.extract(entry, "#{target_directory}#{file_name}") }
            end
          ensure
            FileUtils.rm_f("#{file_name}.zip")
          end
        end

        def delete_downloadable_files
          verify_enabled

          @bridge.delete_downloadable_files
        end

        private

        def verify_enabled
          return if capabilities['se:downloadsEnabled']

          raise Error::WebDriverError, 'You must enable downloads in order to work with downloadable files.'
        end
      end # HasFileDownloads
    end # DriverExtensions
  end # WebDriver
end # Selenium
