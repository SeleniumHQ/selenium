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
    module Chrome
      #
      # @private
      #

      class Profile
        include ProfileHelper

        def initialize(model = nil)
          @model = verify_model(model)
          @extensions = []
          @encoded_extensions = []
          @directory = nil
        end

        def add_extension(path)
          raise Error::WebDriverError, "could not find extension at #{path.inspect}" unless File.file?(path)

          @extensions << path
        end

        def add_encoded_extension(encoded)
          @encoded_extensions << encoded
        end

        def directory
          @directory || layout_on_disk
        end

        #
        # Set a preference in the profile.
        #
        # See https://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/pref_names.cc
        #

        def []=(key, value)
          parts = key.split('.')
          parts[0..-2].inject(prefs) { |a, e| a[e] ||= {} }[parts.last] = value
        end

        def [](key)
          parts = key.split('.')
          parts.inject(prefs) { |a, e| a.fetch(e) }
        end

        def layout_on_disk
          @directory = @model ? create_tmp_copy(@model) : Dir.mktmpdir('webdriver-chrome-profile')
          FileReaper << @directory

          write_prefs_to @directory

          @directory
        end

        def as_json(*)
          extensions = @extensions.map do |crx_path|
            File.open(crx_path, 'rb') { |crx_file| Base64.strict_encode64 crx_file.read }
          end

          extensions.concat(@encoded_extensions)

          opts = {'directory' => directory || layout_on_disk}
          opts['extensions'] = extensions if extensions.any?
          opts
        end

        private

        def write_prefs_to(dir)
          prefs_file = prefs_file_for(dir)

          FileUtils.mkdir_p File.dirname(prefs_file)
          File.open(prefs_file, 'w') { |file| file << JSON.generate(prefs) }
        end

        def prefs
          @prefs ||= read_model_prefs
        end

        def read_model_prefs
          return {} unless @model

          JSON.parse File.read(prefs_file_for(@model))
        end

        def prefs_file_for(dir)
          File.join dir, 'Default', 'Preferences'
        end
      end # Profile
    end # Chrome
  end # WebDriver
end # Selenium
