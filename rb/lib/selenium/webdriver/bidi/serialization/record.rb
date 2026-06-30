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
        #   Cookie = Record.define(name: 'name', value: {json_key: 'value', ref: 'Network::BytesValue'})
        #
        # @api private
        class Record < ::Data
          # Named Field, not Member, to avoid colliding with +::Data#members+.
          Field = ::Data.define(:name, :json_key, :nullable, :ref, :list, :fixed, :enum)

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
            meta = {json_key: meta} if meta.is_a?(::String)
            Field.new(name: name.to_sym, json_key: meta.fetch(:json_key, name.to_s),
                      nullable: meta[:nullable] || false, ref: meta[:ref],
                      list: meta[:list] || false, fixed: meta.fetch(:fixed, UNSET), enum: meta[:enum])
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

            # Inbound payloads are trusted — no enum validation — so a value newer than our
            # schema (e.g. an unrecognized enum) still parses.
            def from_json(json_payload)
              attributes = fields.to_h do |f|
                [f.name, wire_value(f, json_payload)]
              end
              attributes[:extensions] = extra(json_payload) if extensible?
              construct(**attributes)
            end

            private

            # Checks each field's value: a non-nullable field cannot be nil (nil is neither a
            # value nor the UNSET omit-sentinel, so it would be silently dropped on the wire), and
            # an enum field must be in its allowed set. The enum constant is resolved lazily so a
            # cross-domain enum need not be loaded first. Outbound only — from_json stays lenient.
            def validate_values(attributes)
              fields.each do |f|
                value = attributes[f.name]
                raise ::ArgumentError, "#{name}##{f.name} cannot be nil" if value.nil? && !f.nullable
                next unless f.enum

                Serialization.validate!("#{name}##{f.name}", value, Protocol.const_get(f.enum))
              end
            end

            def fixed?(field)
              !UNSET.equal?(field.fixed)
            end

            def wire_value(field, json_payload)
              return field.fixed if fixed?(field)
              return UNSET unless json_payload.key?(field.json_key)

              read(field, json_payload[field.json_key])
            end

            def read(field, raw)
              return raw if raw.nil? || field.ref.nil?

              klass = (@refs ||= {})[field.name] ||= Protocol.const_get(field.ref)
              field.list ? read_list(raw, klass) : klass.from_json(raw)
            end

            # Parses each element, recursing into nested lists (e.g. a map's [key, value] pairs)
            # so their entries become typed too.
            def read_list(raw, klass)
              raw.map { |element| element.is_a?(::Array) ? read_list(element, klass) : klass.from_json(element) }
            end

            def extra(json_payload)
              known = (@json_keys ||= fields.map(&:json_key))
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

                payload[f.json_key] = Serializable.as_json(value)
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
