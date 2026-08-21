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
    class BiDi
      # Wire round-trip runtime for the generated protocol layer: the value-type bases
      # (Record, Union), the omit sentinel (UNSET), and outbound enum validation.
      #
      # @api private
      module Serialization
        # Sentinel for an omitted optional: dropped from the payload entirely, vs nil which
        # a nullable field serializes as wire null.
        #
        # @api private
        UNSET = ::Object.new
        def UNSET.inspect = 'UNSET'
        UNSET.freeze

        # Validates an outbound enum argument: +value+ is a symbol (or list of symbols) that
        # must be a key of the enum hash (+{symbol => wire_token}+), so a bad value fails
        # locally with a clear error instead of a round-trip. Outbound only; inbound wire
        # tokens are mapped and checked separately in +to_symbol+.
        #
        # @api private
        def self.validate!(name, value, enum)
          return if UNSET.equal?(value) || value.nil?

          elements = value.is_a?(::Array) ? value : [value]
          invalid = elements.reject { |element| enum.key?(element) }
          return if invalid.empty?

          raise ::ArgumentError, "#{name} must be one of #{enum.keys.inspect}, got #{invalid.inspect}"
        end

        # Outbound: map a validated enum symbol (or list) to the wire token(s) to serialize.
        #
        # @api private
        def self.to_wire(value, enum)
          return value if UNSET.equal?(value) || value.nil?

          value.is_a?(::Array) ? value.map { |element| enum.fetch(element) } : enum.fetch(value)
        end

        # Inbound: map a wire token (or list) back to its enum symbol, raising on a token
        # outside our schema so a non-compliant (or newer-than-schema) browser value fails
        # loud instead of silently passing through untyped.
        #
        # @api private
        def self.to_symbol(name, value, enum)
          return value if value.nil?
          return value.map { |element| to_symbol(name, element, enum) } if value.is_a?(::Array)

          enum.key(value) || raise(Error::SerializationError, "#{name} received an unknown value: #{value.inspect}")
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium

require 'selenium/webdriver/bidi/serialization/record'
require 'selenium/webdriver/bidi/serialization/union'
