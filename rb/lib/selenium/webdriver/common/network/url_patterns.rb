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
    class Network
      #
      # Turns the url_patterns a handler is registered with into BiDi URL patterns: strings and URIs as pattern
      # strings, hashes as pattern components. The remote end matches them; what it would refuse raises here.
      #
      # @api private
      #

      module UrlPatterns
        # Reserved by the URLPattern syntax unless escaped with a backslash
        RESERVED = /[*(){}]/
        SCHEME = /\A[a-z][a-z\d+\-.]*:/i
        # What the remote end refuses in each component
        INVALID = {protocol: /[^a-z\d+\-.]/i, hostname: %r{[/?#]}, port: /\D/, pathname: /[?#]/, search: /#/}.freeze

        class << self
          def build(patterns)
            return if patterns.nil?

            (patterns.is_a?(Array) ? patterns : [patterns]).map do |pattern|
              pattern.is_a?(Hash) ? components(pattern) : string(pattern.to_s)
            end
          end

          private

          def string(pattern)
            checked = unescaped(pattern)
            raise ArgumentError, "URL pattern #{pattern.inspect} is not an absolute URL" unless pattern.match?(SCHEME)

            without_host = checked.sub(%r{//\[[^\]]*\]}, '//')
            query = without_host.split('?', 2)[1]
            note_glob(pattern) if without_host.include?('[') || (query && !query.include?('='))
            BiDi::Protocol::Network::UrlPatternString.new(pattern: pattern)
          end

          def components(pattern)
            components = pattern.to_h do |key, value|
              value = value.to_s if value.is_a?(Integer)
              validate_component(key.to_sym, value) if value.is_a?(String) && INVALID.key?(key.to_sym)
              [key.to_sym, value]
            end
            BiDi::Protocol::Network::UrlPatternPattern.new(**components)
          end

          def validate_component(key, value)
            checked = unescaped(value)
            if %i[protocol hostname port].include?(key) && checked.empty?
              raise ArgumentError, "URL pattern #{key} cannot be empty; leave it out to match any #{key}"
            end

            invalid = checked[INVALID.fetch(key)]
            invalid ||= checked.gsub(/\[[^\]]*\]/, '')[':'] if key == :hostname
            raise ArgumentError, "URL pattern #{key} #{value.inspect} cannot contain #{invalid.inspect}" if invalid

            note_glob(value) if key == :pathname && checked.include?('[')
          end

          # Glob syntax such as ? or [abc] is valid in a URL, so it reaches the remote end, which reads it literally
          def note_glob(value)
            WebDriver.logger.info("URL pattern #{value.inspect} looks like a glob, but URL patterns have no " \
                                  'wildcards; it is matched as the URL it spells out', id: :network_url_pattern_glob)
          end

          # @return [String] the value with escaped characters masked, since they match literally
          def unescaped(value)
            value.gsub(/\\./m, '_').tap do |checked|
              reserved = checked[RESERVED]
              next unless reserved

              raise ArgumentError, "URL pattern #{value.inspect} has #{reserved.inspect}, which WebDriver BiDi " \
                                   'reserves; patterns have no wildcards, so leave out the component to match any ' \
                                   "value, match in the handler, or escape it as \\#{reserved} to match it literally"
            end
          end
        end
      end # UrlPatterns
    end # Network
  end # WebDriver
end # Selenium
