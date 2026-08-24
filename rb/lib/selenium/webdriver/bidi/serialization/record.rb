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
          Field = ::Data.define(:name, :wire_key, :nullable, :ref, :list, :fixed, :enum, :required, :primitive,
                                :scalar, :const)

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
                      scalar: meta[:scalar], const: meta.fetch(:const, UNSET))
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

            # Inbound: builds from the wire. A missing required field raises (in +wire_value+); enum
            # tokens are mapped back to symbols and an unrecognized one raises (in +read+); an
            # undeclared property is captured silently (extensible) or warned and dropped (closed)
            # — strict on shape, lenient on extras.
            def from_json(json_payload)
              unless json_payload.is_a?(::Hash)
                raise Error::SerializationError, "#{name} expected an object on the wire, got #{json_payload.inspect}"
              end

              attributes = fields.to_h do |f|
                [f.name, wire_value(f, json_payload)]
              end
              undeclared = extra(json_payload)
              if extensible?
                attributes[:extensions] = undeclared # the spec sanctions these extras; preserve them silently
              else
                warn_undeclared(undeclared) unless undeclared.empty?
              end
              construct(**attributes)
            end

            private

            # Checks each field's value: a required field cannot be omitted (UNSET), a non-nullable
            # field cannot be nil (nil is neither a value nor the UNSET omit-sentinel, so it would be
            # silently dropped on the wire), a nullable-const field must carry its literal (not some
            # other value), a primitive field must be the matching Ruby type, and an enum field must be
            # in its allowed set. The enum constant is resolved lazily so a cross-domain enum need not be
            # loaded first. Outbound only (from +new+); inbound presence/primitive/enum are checked
            # separately in +wire_value+/+read+.
            def validate_values(attributes)
              fields.each do |f|
                value = attributes[f.name]
                raise ::ArgumentError, "#{name}##{f.name} is required" if UNSET.equal?(value) && f.required
                raise ::ArgumentError, "#{name}##{f.name} cannot be nil" if value.nil? && !f.nullable
                next if value.nil? || UNSET.equal?(value)

                validate_present(f, value)
              end
            end

            # Checks a field that carries an actual value (neither omitted nor nil): a nullable-const
            # field against its literal, list/scalar shape, primitive type (lists excepted, as inbound
            # does), ref type, and enum membership (resolved lazily so a cross-domain enum need not load first).
            def validate_present(field, value)
              validate_const(field, value)
              check_outbound_shape(field, value)
              check_outbound_primitive(field, value) unless field.list
              validate_ref(field, value) if field.ref
              Serialization.validate!("#{name}##{field.name}", value, Protocol.const_get(field.enum)) if field.enum
            end

            # Outbound mirror of read_ref: a ref-typed value must be the type it declares, so a wrong
            # record or a value no union variant accepts is a caller error caught here, not a browser
            # round-trip. Shape is already checked, so a list is an Array.
            def validate_ref(field, value)
              klass = (@refs ||= {})[field.name] ||= Protocol.const_get(field.ref)
              field.list ? validate_ref_list(field, klass, value) : validate_ref_value(field, klass, value)
            end

            # Mirrors read_list: a scalar field is a [key, value] map, a nested list recurses, otherwise
            # each element is checked against the ref.
            def validate_ref_list(field, klass, list)
              list.each do |element|
                if field.scalar
                  validate_ref_entry(field, klass, element)
                elsif element.is_a?(::Array)
                  validate_ref_list(field, klass, element)
                else
                  validate_ref_value(field, klass, element)
                end
              end
            end

            # A [key, value] map entry: the key may be a variant or a bare scalar, the value is a variant.
            def validate_ref_entry(field, klass, element)
              unless element.is_a?(::Array) && element.size == 2
                raise ::ArgumentError, "#{name}##{field.name} expected a [key, value] pair, got #{element.inspect}"
              end

              key, value = element
              key.is_a?(Serializable) ? validate_ref_value(field, klass, key) : check_outbound_scalar(field, key)
              validate_ref_value(field, klass, value)
            end

            # A record ref must be an instance of that record; a union ref must be one the union accepts.
            def validate_ref_value(field, klass, value)
              return if klass < Union ? klass.valid_outbound?(value) : value.is_a?(klass)

              raise ::ArgumentError, "#{name}##{field.name} expected #{field.ref}, got #{value.inspect}"
            end

            # Outbound mirror of scalar_value: a bare map key must match one of the arm's primitives.
            def check_outbound_scalar(field, value)
              checks = Array(field.scalar).filter_map { |primitive| PRIMITIVE_CHECKS[primitive] }
              return if checks.empty? || checks.any? { |check| check.call(value) }

              raise ::ArgumentError,
                    "#{name}##{field.name} expected #{Array(field.scalar).join(' or ')}, got #{value.inspect}"
            end

            # A nullable constant (`literal / null`) is caller-settable but its only non-null value is
            # the literal, so a value that is neither the literal nor nil (nil is handled above) is a
            # local error rather than a wire round-trip. A non-const field carries UNSET here and passes.
            def validate_const(field, value)
              return if UNSET.equal?(field.const) || value == field.const

              raise ::ArgumentError, "#{name}##{field.name} must be #{field.const.inspect}, got #{value.inspect}"
            end

            # Outbound mirror of check_shape: a list-typed arg must be an array, a scalar-shaped one
            # (enum or ref, not a list) must not — a local ArgumentError, not a wire round-trip.
            def check_outbound_shape(field, value)
              return if field.list == value.is_a?(::Array)
              return unless field.list || field.enum || field.ref

              kind = field.list ? 'a list' : 'a single value'
              raise ::ArgumentError, "#{name}##{field.name} expected #{kind}, got #{value.inspect}"
            end

            # Outbound mirror of check_primitive: a primitive-typed arg (`string`/`integer`/…) must be
            # the matching Ruby type, so a caller mistake (a string width, a float count) is a local
            # ArgumentError here rather than a rejection the browser reports a round-trip later. A field
            # with no primitive descriptor (enum, ref, opaque) passes; lists are skipped, as inbound does.
            def check_outbound_primitive(field, value)
              check = PRIMITIVE_CHECKS[field.primitive]
              return if check.nil? || check.call(value)

              raise ::ArgumentError, "#{name}##{field.name} expected #{field.primitive}, got #{value.inspect}"
            end

            def fixed?(field)
              !UNSET.equal?(field.fixed)
            end

            # A required field absent from the response cannot yield a valid typed object, so it raises
            # rather than substitute a placeholder or represent the field as omitted; a remote end that
            # lags the schema is handled by a project schema override, not by runtime tolerance.
            def wire_value(field, json_payload)
              return field.fixed if fixed?(field)
              return read(field, json_payload[field.wire_key]) if json_payload.key?(field.wire_key)
              return UNSET unless field.required

              raise Error::SerializationError, "#{name}##{field.name} is required but was missing from the response"
            end

            def read(field, raw)
              if raw.nil?
                return raw if field.nullable

                raise Error::SerializationError, "#{name}##{field.name} received null but is not nullable"
              end
              check_shape(field, raw)
              return Serialization.to_symbol("#{name}##{field.name}", raw, enum_hash(field)) if field.enum

              if field.ref.nil?
                return raw if field.list

                check_primitive(field, raw)
                # A whole number is exact in both types, so the declared type is held with nothing lost.
                return field.primitive == 'integer' && raw.is_a?(::Float) ? raw.to_i : raw
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

              raise Error::SerializationError,
                    "#{name}##{field.name} expected #{field.list ? 'a list' : 'a single value'}, got #{raw.inspect}"
            end

            # The check a schema primitive admits, by JSON kind rather than Ruby class: `number` is
            # any Numeric (JSON has one number type), and `integer` is any whole one — a browser is
            # free to send `5` or `5.0` (JS has no int/float split), while a fractional value like
            # 1.5 is a real mismatch. A field with no primitive descriptor is left unchecked.
            WHOLE_FLOAT = ->(value) { value.is_a?(::Float) && value.finite? && (value % 1).zero? }
            PRIMITIVE_CHECKS = {
              'string' => ->(value) { value.is_a?(::String) },
              'boolean' => ->(value) { value.is_a?(::TrueClass) || value.is_a?(::FalseClass) },
              'number' => ->(value) { value.is_a?(::Numeric) },
              'integer' => ->(value) { value.is_a?(::Integer) || WHOLE_FLOAT.call(value) }
            }.freeze

            def check_primitive(field, raw)
              check = PRIMITIVE_CHECKS[field.primitive]
              return if check.nil? || check.call(raw)

              raise Error::SerializationError, "#{name}##{field.name} expected #{field.primitive}, got #{raw.inspect}"
            end

            def enum_hash(field)
              (@enums ||= {})[field.name] ||= Protocol.const_get(field.enum)
            end

            # Parses each element. A `scalar` field is a map encoded as `[key, value]` pairs, so
            # every element must be a 2-item pair — each is read as one, and a malformed entry is
            # rejected. Non-scalar lists recurse into nested lists; other elements deserialize.
            def read_list(field, raw, klass)
              raw.map do |element|
                if field.scalar
                  read_map_entry(field, element, klass)
                elsif element.is_a?(::Array)
                  read_list(field, element, klass)
                else
                  klass.from_json(element)
                end
              end
            end

            # A map entry is a `[key, value]` pair. The key is `Ref / text` — an object key
            # deserializes, a bare-string key passes through once validated against the arm's
            # primitive. The value is the object-only Ref and always deserializes, so a bare scalar
            # there is rejected (object_only holds at the value position). A non-pair element is a
            # malformed entry and is rejected outright.
            def read_map_entry(field, element, klass)
              unless element.is_a?(::Array) && element.size == 2
                raise Error::SerializationError,
                      "#{name}##{field.name} expected a [key, value] pair, got #{element.inspect}"
              end

              key, value = element
              key = key.is_a?(::Hash) ? klass.from_json(key) : scalar_value(field, key)
              [key, klass.from_json(value)]
            end

            # A bare scalar at a scalar-tolerant union position must match one of the union's
            # scalar-arm primitives (+scalar+ is a primitive name or an array of them); a
            # wrong-typed scalar (a number where a string is expected) is a wire error, not
            # something to pass through. An unrecognized primitive (none in PRIMITIVE_CHECKS) is
            # left unchecked, matching the lenient default elsewhere.
            def scalar_value(field, value)
              checks = Array(field.scalar).filter_map { |primitive| PRIMITIVE_CHECKS[primitive] }
              return value if checks.empty? || checks.any? { |check| check.call(value) }

              raise Error::SerializationError,
                    "#{name}##{field.name} expected #{Array(field.scalar).join(' or ')}, got #{value.inspect}"
            end

            def extra(json_payload)
              known = (@wire_keys ||= fields.map(&:wire_key))
              json_payload.except(*known)
            end

            # Forward-compat signal: a property a closed type does not model is dropped and warned so
            # schema drift is visible (an extensible type keeps its extras silently — the spec sanctions
            # them). Tagged +:bidi_undeclared_property+ so a caller can silence it via +logger.ignore+.
            def warn_undeclared(undeclared)
              undeclared.each_key do |key|
                WebDriver.logger.warn("#{name} received an undeclared property: #{key.inspect}",
                                      id: :bidi_undeclared_property)
              end
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
              merge_extensions!(payload) if self.class.extensible? && !extensions.empty?
              payload
            end

            private

            # Merge the passthrough extras onto the wire, erroring rather than letting an extra whose key
            # is a declared field's wire key silently clobber that typed value; an extra is by definition
            # a field the spec does not declare. Keys are stringified first so a symbol key (e.g. `name:`)
            # cannot slip past the guard and then reappear as a duplicate wire key once serialized. The
            # single gate every outbound path funnels through: +new+, +with+, and in-place mutation.
            def merge_extensions!(payload)
              extras = extensions.transform_keys(&:to_s)
              collisions = extras.keys & self.class.fields.map(&:wire_key)
              unless collisions.empty?
                raise ::ArgumentError, "#{self.class.name} extensions shadow declared fields: #{collisions.join(', ')}"
              end

              payload.merge!(extras)
            end
          end
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
