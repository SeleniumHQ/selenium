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
    # Common methods for Chrome::Profile and Firefox::Profile
    # Includers must implement #layout_on_disk
    #

    module ProfileHelper
      def self.included(base)
        base.extend ClassMethods
      end

      def as_json(*)
        {"zip" => Zipper.zip(layout_on_disk)}
      end

      def to_json(*)
        JSON.generate as_json
      end

      private

      def create_tmp_copy(directory)
        tmp_directory = Dir.mktmpdir('webdriver-rb-profilecopy')

        # TODO: must be a better way..
        FileUtils.rm_rf tmp_directory
        FileUtils.mkdir_p File.dirname(tmp_directory), mode: 0o700
        FileUtils.cp_r directory, tmp_directory

        tmp_directory
      end

      def verify_model(model)
        return unless model

        raise Errno::ENOENT, model unless File.exist?(model)
        raise Errno::ENOTDIR, model unless File.directory?(model)

        model
      end

      module ClassMethods
        def from_json(json)
          data = JSON.parse(json).fetch('zip')

          # can't use Tempfile here since it doesn't support File::BINARY mode on 1.8
          # can't use Dir.mktmpdir(&blk) because of http://jira.codehaus.org/browse/JRUBY-4082
          tmp_dir = Dir.mktmpdir
          begin
            zip_path = File.join(tmp_dir, "webdriver-profile-duplicate-#{json.hash}.zip")
            File.open(zip_path, 'wb') { |zip_file| zip_file << Base64.decode64(data) }

            new Zipper.unzip(zip_path)
          ensure
            FileUtils.rm_rf tmp_dir
          end
        end
      end # ClassMethods
    end # ProfileHelper
  end # WebDriver
end # Selenium
