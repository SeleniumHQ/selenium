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
    module Chrome

      #
      # @private
      #

      class Profile
        include ProfileHelper

        def initialize(model = nil)
          @model      = verify_model(model)
          @extensions = []
          @encoded_extensions = []
        end

        def add_extension(path)
          unless File.file?(path)
            raise Error::WebDriverError, "could not find extension at #{path.inspect}"
          end

          @extensions << path
        end

        def add_encoded_extension(encoded)
          @encoded_extensions << encoded
        end

        #
        # Set a preference in the profile.
        #
        # See https://src.chromium.org/svn/trunk/src/chrome/common/pref_names.cc
        #

        def []=(key, value)
          parts = key.split(".")
          parts[0..-2].inject(prefs) { |pr, k| pr[k] ||= {} }[parts.last] = value
        end

        def [](key)
          parts = key.split(".")
          parts.inject(prefs) { |pr, k| pr.fetch(k) }
        end

        def layout_on_disk
          dir = @model ? create_tmp_copy(@model) : Dir.mktmpdir("webdriver-chrome-profile")
          FileReaper << dir

          write_prefs_to dir

          dir
        end

        def as_json(opts = nil)
          extensions = @extensions.map do |crx_path|
            File.open(crx_path, "rb") { |crx_file| Base64.strict_encode64 crx_file.read }
          end

          extensions.concat(@encoded_extensions)

          super.merge('extensions' => extensions)
        end

        private

        def write_prefs_to(dir)
          prefs_file = prefs_file_for(dir)

          FileUtils.mkdir_p File.dirname(prefs_file)
          File.open(prefs_file, "w") { |file| file << WebDriver.json_dump(prefs)  }
        end

        def prefs
          @prefs ||= read_model_prefs
        end

        def read_model_prefs
          return {} unless @model
          WebDriver.json_load File.read(prefs_file_for(@model))
        end

        def prefs_file_for(dir)
          File.join dir, 'Default', 'Preferences'
        end
      end # Profile

    end # Chrome
  end # WebDriver
end # Selenium
