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
    module Safari
      class Options
        DEFAULT_PORT = 56485

        attr_accessor :port, :data_dir, :skip_extension_installation

        def initialize(opts = {})
          extract_options(opts)
        end

        def clean_session?
          !!@clean_session
        end

        def to_capabilities
          caps = Remote::Capabilities.safari
          caps.merge!('safari.options' => as_json)

          caps
        end

        def as_json
          {
            'port'         => port,
            'dataDir'      => data_dir,
            'cleanSession' => clean_session?,
          }
        end

        private

        def extract_options(opts)
          @port          = Integer(opts[:port] || DEFAULT_PORT)
          @data_dir      = opts[:custom_data_dir] || opts[:data_dir]
          @clean_session = opts[:clean_session]
        end

      end # Options
    end # Safari
  end # WebDriver
end # Selenium
