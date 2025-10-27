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
    class Types
      autoload :Data, 'selenium/webdriver/common/types/data'
      autoload :Struct, 'selenium/webdriver/common/types/struct'

      def self.camel_to_snake(camel)
        camel = camel.to_s
        camel.gsub(/([A-Z\d]+)([A-Z][a-z])/, '\1_\2')
             .gsub(/([a-z\d])([A-Z])/, '\1_\2')
             .tr('-', '_')
             .downcase.delete_prefix('_')
      end

      def self.normalize_args(args, opts)
        unless args.empty? || (args.length == 1 && args.first.is_a?(Hash))
          raise ArgumentError, 'positional args not allowed; use keywords or a single hash'
        end

        raw = opts.any? ? opts : (args.first || {})
        raw.transform_keys { |k| camel_to_snake(k.to_s).to_sym }
      end
    end
  end # WebDriver
end # Selenium
