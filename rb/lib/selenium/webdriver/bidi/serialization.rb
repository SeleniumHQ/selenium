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

        # Validates an outbound enum argument so a bad value fails locally with a clear
        # error instead of a round-trip; inbound payloads are trusted and not checked.
        # +allowed+ is an enum hash (values are the wire strings) or a plain list of wire
        # values — the latter for a union discriminator whose allowed set spans variants.
        #
        # @api private
        def self.validate!(name, value, allowed)
          return if UNSET.equal?(value) || value.nil?

          values = allowed.is_a?(::Hash) ? allowed.values : allowed
          invalid = Array(value).reject { |element| values.include?(element) }
          return if invalid.empty?

          raise ::ArgumentError, "#{name} must be one of #{values.inspect}, got #{invalid.inspect}"
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium

require 'selenium/webdriver/bidi/serialization/record'
require 'selenium/webdriver/bidi/serialization/union'
