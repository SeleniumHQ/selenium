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
      class RemoteValue
        attr_accessor :type, :handle, :internal_id, :value, :shared_id

        def initialize(remote_value)
          if remote_value.key?('type')
            type_string = remote_value['type']
            @type = if !PrimitiveType.find_by_name(type_string).nil?
                      PrimitiveType.find_by_name(type_string)
                    elsif !NonPrimitiveType.find_by_name(type_string).nil?
                      NonPrimitiveType.find_by_name(type_string)
                    else
                      RemoteType.find_by_name(type_string)
                    end
          end

          @handle = remote_value['handle'] if remote_value.key?('handle')

          @internal_id = remote_value['internalId'] if remote_value.key?('internalId')

          @value = remote_value['value'] if remote_value.key?('value')

          @shared_id = remote_value['sharedId'] if remote_value.key?('sharedId')

          @value = deserialize_value(@value, @type) unless @value.nil?
        end

        private

        def deserialize_value(value, type)
          if [NonPrimitiveType::MAP, NonPrimitiveType::OBJECT].include? type
            return value.to_h { |k, v| [k, v] }
          elsif @type.eql? NonPrimitiveType::REGULAR_EXPRESSION
            return RegExpValue.create(pattern: value['pattern'], flags: value['flags'])
          end

          value
        end
      end
    end
  end
end
