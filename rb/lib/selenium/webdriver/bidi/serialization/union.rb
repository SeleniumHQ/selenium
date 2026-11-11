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
            # values maps each variant's discriminator symbol to its wire token, so an
            # inbound payload tag (a wire string) can be matched to the symbol-keyed table.
            def discriminator(wire_key, values = {})
              @discriminator = wire_key
              @discriminator_values = values
            end

            def variants(table) = @variants = table
            def presence(rules) = @presence = rules
            def fallback(path) = @fallback = path

            # Declared (via the schema's `objectOnly` signal) on a union whose every arm is an
            # object, so a non-Hash payload is a schema violation rather than a scalar arm.
            def object_only = @object_only = true

            # Declared (via the schema's `scalarValues` signal) on a non-object_only union whose
            # bare-scalar arms are a fixed set of literals (input.Origin's "viewport" / "pointer").
            # An outbound scalar outside that set matches no arm, so it is a caller error.
            def scalar_values(*values) = @scalar_values = values

            # A non-Hash payload is a bare scalar arm (e.g. input.Origin's "viewport"), valid only
            # as a literal the schema pins; under object_only it cannot match any variant at all.
            def from_json(json_payload)
              unless json_payload.is_a?(::Hash)
                if @object_only
                  raise Error::SerializationError,
                        "#{name} expected an object on the wire, got #{json_payload.inspect}"
                end
                return json_payload if scalar_arm?(json_payload)

                raise Error::SerializationError,
                      "#{name} received a scalar not in this Selenium's BiDi schema: #{json_payload.inspect}"
              end

              variant = select(json_payload)
              unless variant
                raise Error::SerializationError,
                      "#{name} received a variant not in this Selenium's BiDi schema: #{json_payload.inspect}"
              end
              Protocol.const_get(variant).from_json(json_payload)
            end

            # Outbound mirror of from_json: build the variant the command's kwargs describe
            # so its typed as_json drives null-vs-absent per field (a flat hash through
            # Transport cannot). Dispatch keys are wire names equal to their ruby kwarg
            # (asserted at generation), so they match the kwargs by symbol. A mismatch here
            # is a caller error (unlike an unknown inbound value), so it fails loudly.
            def build(**kwargs)
              variant = outbound_variant(kwargs) ||
                        raise(::ArgumentError, "no #{name} variant matches #{kwargs.inspect}")
              klass = Protocol.const_get(variant)
              # An omitted optional arrives as UNSET; forward only what was provided. A provided
              # key that isn't a field of the chosen variant is an invalid combination for this union.
              provided = kwargs.reject { |_, value| UNSET.equal?(value) }
              invalid = provided.keys - klass.fields.map(&:name)
              return klass.new(**provided) if invalid.empty?

              raise ::ArgumentError, "invalid combination for #{name}: #{invalid.join(', ')}"
            end

            # Outbound mirror of from_json: is +value+ one this union accepts? Any variant is accepted,
            # and a variant that is itself a union recurses (e.g. LocalValue's RemoteReference fallback).
            # A non-object_only union (e.g. input.Origin) also admits one of its pinned bare-scalar
            # literals; an object (a Hash or another union's record) that matched no variant does not.
            def valid_outbound?(value)
              return true if variant_refs.any? { |ref| variant_accepts?(ref, value) }

              !@object_only && scalar_arm?(value)
            end

            private

            # A bare-scalar arm must be one of the literals the schema pinned for this union
            # (scalar_values, e.g. input.Origin's "viewport" / "pointer"). The generator guarantees a
            # non-object_only union declares them, so no runtime guard is needed here.
            def scalar_arm?(value)
              @scalar_values.include?(value)
            end

            # Every variant's class name: the discriminated table, the presence paths, and the fallback.
            def variant_refs
              @variant_refs ||= [*@variants&.values, *@presence&.keys, @fallback].compact
            end

            # A variant that is itself a union recurses; a record variant is matched by instance.
            def variant_accepts?(ref, value)
              klass = (@variant_classes ||= {})[ref] ||= Protocol.const_get(ref)
              klass < Union ? klass.valid_outbound?(value) : value.is_a?(klass)
            end

            # The discriminator value may legitimately be null (e.g. script.NullValue's
            # "null" tag), so it is matched by key presence.
            def select(json_payload)
              variant_for(payload_tag(json_payload)) { |k| json_payload.key?(k) }
            end

            # An explicit nil kwarg still counts as supplied; a non-nullable field set to nil is
            # rejected at construction (Data.new), not here.
            def outbound_variant(kwargs)
              tag = @discriminator ? kwargs.fetch(@discriminator.to_sym, UNSET) : UNSET
              variant_for(tag) { |k| kwargs.key?(k.to_sym) && !UNSET.equal?(kwargs[k.to_sym]) }
            end

            # The matching variant's ref, or nil when none matches (the fallback if declared).
            def variant_for(tag, &supplied)
              return @variants[tag] if !UNSET.equal?(tag) && @variants&.key?(tag)

              @presence&.each { |path, keys| return path if keys.all?(&supplied) }
              @fallback
            end

            # The wire tag mapped back to its variant symbol (the table's key); an
            # unrecognized tag falls through as-is so select misses and from_json raises.
            def payload_tag(json_payload)
              return UNSET unless @discriminator && json_payload.key?(@discriminator)

              wire = json_payload[@discriminator]
              @discriminator_values.key(wire) || wire
            end
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
