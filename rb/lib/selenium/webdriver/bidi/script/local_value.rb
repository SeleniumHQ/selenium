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

require_relative './primitive_type'
require_relative './non_primitive_type'

module Selenium
  module WebDriver
    class BiDi
      class LocalValue
        TYPE_CONSTANT = 'type'
        VALUE_CONSTANT = 'value'

        def initialize(type, value: nil)
          @type = type
          @value = value unless type.eql?(PrimitiveType::UNDEFINED) && type.eql?(PrimitiveType::NULL)
        end

        def self.create_string_value(value)
          LocalValue.new(PrimitiveType::STRING, value: value).as_json
        end

        def self.create_number_value(value)
          LocalValue.new(PrimitiveType::NUMBER, value: value).as_json
        end

        def self.create_special_number_value(value)
          LocalValue.new(PrimitiveType::SPECIAL_NUMBER, value: value).as_json
        end

        def self.create_undefined_value
          LocalValue.new(PrimitiveType::UNDEFINED).as_json
        end

        def self.create_null_value
          LocalValue.new(PrimitiveType::NULL).as_json
        end

        def self.create_boolean_value(value)
          LocalValue.new(PrimitiveType::BOOLEAN, value: value).as_json
        end

        def self.create_big_int_value(value)
          LocalValue.new(PrimitiveType::BIGINT, value: value).as_json
        end

        def self.create_array_value(value)
          LocalValue.new(NonPrimitiveType::ARRAY, value: value).as_json
        end

        def self.create_date_value(value)
          LocalValue.new(NonPrimitiveType::DATE, value: value).as_json
        end

        def self.create_map_value(map)
          value = []
          map.each { |k, v| value.push([k, v]) }
          LocalValue.new(NonPrimitiveType::MAP, value: value).as_json
        end

        def self.create_object_value(map)
          value = []
          map.each { |k, v| value.push([k, v]) }
          LocalValue.new(NonPrimitiveType::OBJECT, value: value).as_json
        end

        def self.create_regular_expression_value(value)
          LocalValue.new(NonPrimitiveType::REGULAR_EXPRESSION, value: value).as_json
        end

        def self.create_set_value(value)
          LocalValue.new(NonPrimitiveType::SET, value: value).as_json
        end

        def as_json
          to_return = {'type' => @type}
          to_return['value'] = @value unless @type.eql?(PrimitiveType::NULL) && @type.eql?(PrimitiveType::UNDEFINED)
          to_return
        end
      end # LocalValue
    end # BiDi
  end # WebDriver
end # Selenium
