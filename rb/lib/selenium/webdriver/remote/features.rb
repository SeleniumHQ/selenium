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
    module Remote
      module Features
        REMOTE_COMMANDS = {
          upload_file: [:post, 'session/:session_id/se/file'],
          get_downloadable_files: [:get, 'session/:session_id/se/files'],
          download_file: [:post, 'session/:session_id/se/files'],
          delete_downloadable_files: [:delete, 'session/:session_id/se/files']
        }.freeze

        def add_commands(commands)
          @command_list = command_list.merge(commands)
        end

        def command_list
          @command_list ||= REMOTE_COMMANDS
        end

        def commands(command)
          command_list[command]
        end

        def upload(local_file)
          unless File.file?(local_file)
            WebDriver.logger.error("File detector only works with files. #{local_file.inspect} isn`t a file!",
                                   id: :file_detector)
            raise Error::WebDriverError, "You are trying to upload something that isn't a file."
          end

          execute :upload_file, {}, {file: Zipper.zip_file(local_file)}
        end

        def upload_if_necessary(keys)
          local_files = keys.first&.split("\n")&.map { |key| @file_detector.call(Array(key)) }&.compact
          return keys unless local_files&.any?

          keys = local_files.map { |local_file| upload(local_file) }
          Array(keys.join("\n"))
        end

        def downloadable_files
          execute :get_downloadable_files
        end

        def download_file(name)
          execute :download_file, {}, {name: name}
        end

        def delete_downloadable_files
          execute :delete_downloadable_files
        end
      end
    end # Remote
  end # WebDriver
end # Selenium
