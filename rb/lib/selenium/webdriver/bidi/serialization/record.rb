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
        # Immutable value type for the generated protocol classes. +Record.define(spec)+
        # bakes each field's wire facts and returns a +::Data+ subclass with serialization.
        #
        #   Cookie = Record.define(name: 'name', value: {wire_key: 'value', ref: 'Network::BytesValue'})
        #
        # @api private
        class Record < ::Data
          # Named Field, not Member, to avoid colliding with +::Data#members+.
          Field = ::Data.define(:name, :wire_key, :nullable, :ref, :list, :fixed, :enum, :required, :primitive, :scalar)

          def self.define(**spec)
            extensible = spec.delete(:extensible) || false
            fields = spec.map { |name, meta| field(name, meta) }
            names = fields.map(&:name)
            names << :extensions if extensible

            klass = super(*names)
            fields.freeze
            # Singleton methods are inherited by `X = Record.define(…)`; ivars would not.
            klass.define_singleton_method(:fields) { fields }
            klass.define_singleton_method(:extensible?) { extensible }
            klass.include(Serializable)
            # Capture ::Data's generated +new+, then prepend (not include) Deserializer so
            # its +new+ overrides it — outbound +new+ adds validation, while inbound
            # +from_json+ builds directly via the captured constructor. Bound to +self+ so a
            # subclass builds itself, not the base.
            data_new = klass.singleton_class.instance_method(:new)
            klass.singleton_class.prepend(Deserializer)
            klass.define_singleton_method(:construct) { |**attributes| data_new.bind_call(self, **attributes) }
            klass.singleton_class.send(:private, :construct)
            klass
          end

          def self.field(name, meta)
            meta = {wire_key: meta} if meta.is_a?(::String)
            Field.new(name: name.to_sym, wire_key: meta.fetch(:wire_key, name.to_s),
                      nullable: meta[:nullable] || false, ref: meta[:ref],
                      list: meta[:list] || false, fixed: meta.fetch(:fixed, UNSET), enum: meta[:enum],
                      required: meta.fetch(:required, true), primitive: meta[:primitive],
                      scalar: meta[:scalar])
          end
          private_class_method :field

          # Inbound construction: the keyword +new+ (validated) and the wire +from_json+.
          #
          # @api private
          module Deserializer
            def new(**kwargs)
              # Start from what was passed so ::Data's constructor rejects an unknown key, then fill
              # each field with its value or UNSET (omitted), forcing fixed discriminators.
              attributes = kwargs.dup
              fields.each { |f| attributes[f.name] = fixed?(f) ? f.fixed : attributes.fetch(f.name, UNSET) }
              attributes[:extensions] = kwargs.fetch(:extensions, {}) if extensible?
              validate_values(attributes)
              construct(**attributes)
            end

            # Inbound: builds from the wire. A missing required field raises (in +wire_value+),
            # enum tokens are mapped back to symbols and an unrecognized one raises (in +read+), and
            # extra keys are captured (extensible) or ignored (closed) — strict on shape, lenient on extras.
            def from_json(json_payload)
              unless json_payload.is_a?(::Hash)
                raise Error::WebDriverError, "#{name} expected an object on the wire, got #{json_payload.inspect}"
              end

              attributes = fields.to_h do |f|
                [f.name, wire_value(f, json_payload)]
              end
              attributes[:extensions] = extra(json_payload) if extensible?
              construct(**attributes)
            end

            private

            # Checks each field's value: a required field cannot be omitted (UNSET), a non-nullable
            # field cannot be nil (nil is neither a value nor the UNSET omit-sentinel, so it would be
            # silently dropped on the wire), and an enum field must be in its allowed set. The enum
            # constant is resolved lazily so a cross-domain enum need not be loaded first. Outbound
            # only (from +new+); inbound presence/enum are checked separately in +wire_value+/+read+.
            def validate_values(attributes)
              fields.each do |f|
                value = attributes[f.name]
                raise ::ArgumentError, "#{name}##{f.name} is required" if UNSET.equal?(value) && f.required
                raise ::ArgumentError, "#{name}##{f.name} cannot be nil" if value.nil? && !f.nullable
                next if value.nil? || UNSET.equal?(value)

                check_outbound_shape(f, value)
                Serialization.validate!("#{name}##{f.name}", value, Protocol.const_get(f.enum)) if f.enum
              end
            end

            # Outbound mirror of check_shape: a list-typed arg must be an array, a scalar-shaped one
            # (enum or ref, not a list) must not — a local ArgumentError, not a wire round-trip.
            def check_outbound_shape(field, value)
              return if field.list == value.is_a?(::Array)
              return unless field.list || field.enum || field.ref

              kind = field.list ? 'a list' : 'a single value'
              raise ::ArgumentError, "#{name}##{field.name} expected #{kind}, got #{value.inspect}"
            end

            def fixed?(field)
              !UNSET.equal?(field.fixed)
            end

            def wire_value(field, json_payload)
              return field.fixed if fixed?(field)
              return read(field, json_payload[field.wire_key]) if json_payload.key?(field.wire_key)
              return UNSET unless field.required

              raise Error::WebDriverError, "#{name}##{field.name} is required but was missing from the response"
            end

            def read(field, raw)
              if raw.nil?
                return raw if field.nullable

                raise Error::WebDriverError, "#{name}##{field.name} received null but is not nullable"
              end
              check_shape(field, raw)
              return Serialization.to_symbol("#{name}##{field.name}", raw, enum_hash(field)) if field.enum

              if field.ref.nil?
                check_primitive(field, raw) unless field.list
                return raw
              end

              read_ref(field, raw)
            end

            # Reads a ref-typed value into its class. A `scalar` position is an inline union with
            # a scalar arm collapsed onto its union ref (a map's string keys): a non-object leaf
            # passes through instead of being handed to the object_only union, but only when it
            # matches the arm's primitive (+scalar+ carries it). A list recurses per element.
            def read_ref(field, raw)
              klass = (@refs ||= {})[field.name] ||= Protocol.const_get(field.ref)
              return read_list(field, raw, klass) if field.list

              field.scalar && !raw.is_a?(::Hash) ? scalar_value(field, raw) : klass.from_json(raw)
            end

            # A declared list must arrive as an array; a scalar-shaped field (enum or ref, not a
            # list) must not. An opaque field carries no shape descriptor, so it passes through.
            def check_shape(field, raw)
              return if field.list == raw.is_a?(::Array)
              return unless field.list || field.enum || field.ref

              raise Error::WebDriverError,
                    "#{name}##{field.name} expected #{field.list ? 'a list' : 'a single value'}, got #{raw.inspect}"
            end

            # Ruby classes a checkable primitive admits. `number` is any Numeric (JSON has one
            # number type); `integer` requires an Integer — a browser emits `5`, not `5.0`, for an
            # integer (JS has no int/float split), so this rarely false-positives yet still rejects
            # a genuine non-integer like 1.5. A field with no primitive descriptor is left unchecked.
            PRIMITIVE_TYPES = {
              'string' => [::String], 'boolean' => [::TrueClass, ::FalseClass],
              'number' => [::Numeric], 'integer' => [::Integer]
            }.freeze

            def check_primitive(field, raw)
              expected = PRIMITIVE_TYPES[field.primitive]
              return if expected.nil? || expected.any? { |type| raw.is_a?(type) }

              raise Error::WebDriverError, "#{name}##{field.name} expected #{field.primitive}, got #{raw.inspect}"
            end

            def enum_hash(field)
              (@enums ||= {})[field.name] ||= Protocol.const_get(field.enum)
            end

            # Parses each element, recursing into nested lists. A `scalar` field is a map encoded
            # as `[key, value]` pairs: only the key is `Ref / text`, so scalar tolerance applies
            # to the key alone (a bare-string key passes through, validated against the arm's
            # primitive; an object key deserializes). The value is the object-only Ref and always
            # deserializes, so a bare scalar there is still rejected — object_only holds at the
            # value position, not just the key.
            def read_list(field, raw, klass)
              raw.map do |element|
                if field.scalar && element.is_a?(::Array) && element.size == 2
                  key, value = element
                  [read_map_key(field, key, klass), klass.from_json(value)]
                elsif element.is_a?(::Array)
                  read_list(field, element, klass)
                elsif field.scalar && !element.is_a?(::Hash)
                  scalar_value(field, element)
                else
                  klass.from_json(element)
                end
              end
            end

            # A map key is `Ref / text`: an object key deserializes into the Ref, a bare-scalar
            # key passes through once validated against the arm's primitive.
            def read_map_key(field, key, klass)
              key.is_a?(::Hash) ? klass.from_json(key) : scalar_value(field, key)
            end

            # A bare scalar at a scalar-tolerant union position must match one of the union's
            # scalar-arm primitives (+scalar+ is a primitive name or an array of them); a
            # wrong-typed scalar (a number where a string is expected) is a wire error, not
            # something to pass through. An unrecognized primitive (none in PRIMITIVE_TYPES) is
            # left unchecked, matching the lenient default elsewhere.
            def scalar_value(field, value)
              expected = Array(field.scalar).flat_map { |primitive| PRIMITIVE_TYPES[primitive] || [] }
              return value if expected.empty? || expected.any? { |type| value.is_a?(type) }

              raise Error::WebDriverError,
                    "#{name}##{field.name} expected #{Array(field.scalar).join(' or ')}, got #{value.inspect}"
            end

            def extra(json_payload)
              known = (@wire_keys ||= fields.map(&:wire_key))
              json_payload.except(*known)
            end
          end

          # @api private
          module Serializable
            def self.as_json(value)
              case value
              when Serializable then value.as_json
              when ::Array then value.map { |element| as_json(element) }
              when ::Hash then value.transform_values { |element| as_json(element) }
              else value
              end
            end

            # Omit UNSET fields; emit null only for nullable ones.
            def as_json(*)
              payload = {}
              self.class.fields.each do |f|
                value = public_send(f.name)
                next if UNSET.equal?(value)
                next if value.nil? && !f.nullable

                value = Serialization.to_wire(value, Protocol.const_get(f.enum)) if f.enum
                payload[f.wire_key] = Serializable.as_json(value)
              end
              payload.merge!(extensions) if self.class.extensible? && !extensions.empty?
              payload
            end
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
