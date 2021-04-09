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

require 'erb'
require 'json'

module Selenium
  module WebDriver
    module Support
      class CDPClientGenerator
        # Input JSON files are generated from PDL tasks.
        BROWSER_PROTOCOL_PATH = File.expand_path('cdp/browser_protocol.json', __dir__)
        JS_PROTOCOL_PATH = File.expand_path('cdp/js_protocol.json', __dir__)
        TEMPLATE_PATH = File.expand_path('cdp/domain.rb.erb', __dir__)

        RESERVED_KEYWORDS = %w[end].freeze

        def call(output_dir:, version:, **)
          @template = ERB.new(File.read(TEMPLATE_PATH))
          @output_dir = output_dir
          @version = version

          browser_protocol = JSON.parse(File.read(BROWSER_PROTOCOL_PATH), symbolize_names: true)
          js_protocol = JSON.parse(File.read(JS_PROTOCOL_PATH), symbolize_names: true)
          browser_protocol[:domains].each(&method(:process_domain))
          js_protocol[:domains].each(&method(:process_domain))
          require_file
        end

        def process_domain(domain)
          result = @template.result_with_hash(domain: domain, version: @version.upcase, h: self)
          filename = File.join("#{@output_dir}/#{@version}", "#{snake_case(domain[:domain])}.rb")
          File.write(filename, remove_empty_lines(result))
        end

        def snake_case(string)
          name = string.gsub('JavaScript', 'Javascript')
                       .gsub(/([A-Z]+)([A-Z][a-z]{2,})/, '\1_\2')
                       .gsub(/([a-z\d])([A-Z])/, '\1_\2')
                       .downcase
          # Certain CDP parameters conflict with Ruby keywords
          # so we prefix the name with underscore.
          name = "_#{name}" if RESERVED_KEYWORDS.include?(name)

          name
        end

        def kwargs(parameters)
          parameters = parameters.map do |parameter|
            if parameter[:optional]
              "#{snake_case(parameter[:name])}: nil"
            else
              "#{snake_case(parameter[:name])}:"
            end
          end
          parameters.join(', ')
        end

        def remove_empty_lines(string)
          string.split("\n").reject { |l| l =~ /^\s+$/ }.join("\n")
        end

        def require_file
          # rubocop:disable Lint/InterpolationCheck
          dynamic_location = '#{File.dirname(File.absolute_path(__FILE__))}'
          # rubocop:enable Lint/InterpolationCheck

          require_all = "Dir.glob(\"#{dynamic_location}/#{@version}/*\", &method(:require))"
          File.open("#{@output_dir}/#{@version}.rb", 'w') { |file| file.write(require_all) }
        end
      end
    end
  end
end
