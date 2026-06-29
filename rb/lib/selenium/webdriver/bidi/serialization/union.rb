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
      module Serialization
        # Resolves a wire payload to the right Data variant: a shared discriminator gives
        # table dispatch; presence rules and a no-tag fallback cover unions without one.
        # Subclassed (never instantiated) — each union holds its own dispatch table.
        #
        #   class Locator < Serialization::Union
        #     discriminator 'type'
        #     variants('css' => 'BrowsingContext::CssLocator')
        #   end
        #
        # @api private
        class Union
          class << self
            def discriminator(json_key) = @discriminator = json_key
            def variants(table) = @variants = table
            def presence(rules) = @presence = rules
            def fallback(path) = @fallback = path

            # A non-Hash payload is a bare scalar arm (e.g. input.Origin's "viewport") with
            # no object to dispatch on, so it is returned unchanged.
            def from_json(json_payload)
              return json_payload unless json_payload.is_a?(::Hash)

              Protocol.const_get(select(json_payload)).from_json(json_payload)
            end

            # Outbound mirror of from_json: build the variant the command's kwargs describe
            # so its typed as_json drives null-vs-absent per field (a flat hash through
            # Transport cannot). Dispatch keys are wire names equal to their ruby kwarg
            # (asserted at generation), so they match the kwargs by symbol.
            def build(**kwargs)
              Protocol.const_get(outbound_variant(kwargs)).new(**kwargs)
            end

            private

            # The discriminator value may legitimately be null (e.g. script.NullValue's
            # "null" tag), so it is matched by key presence.
            def select(json_payload)
              variant_for(payload_tag(json_payload), payload: json_payload) { |k| json_payload.key?(k) }
            end

            # An explicit nil kwarg still counts as supplied, so a nullable field can dispatch.
            def outbound_variant(kwargs)
              tag = @discriminator ? kwargs.fetch(@discriminator.to_sym, UNSET) : UNSET
              variant_for(tag, payload: kwargs) { |k| kwargs.key?(k.to_sym) && !UNSET.equal?(kwargs[k.to_sym]) }
            end

            def variant_for(tag, payload:, &supplied)
              return @variants[tag] if !UNSET.equal?(tag) && @variants&.key?(tag)

              @presence&.each { |path, keys| return path if keys.all?(&supplied) }
              @fallback || raise(::ArgumentError, "no #{name} variant matches #{payload.inspect}")
            end

            def payload_tag(json_payload)
              @discriminator && json_payload.key?(@discriminator) ? json_payload[@discriminator] : UNSET
            end
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
