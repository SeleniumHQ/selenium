# frozen_string_literal: true

# frozen_string_literal = true

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

require_relative 'realm_type'
require_relative 'window_realm_info'

module Selenium
  module WebDriver
    class BiDi
      class RealmInfo
        attr_accessor :realm_id, :origin, :realm_type

        def initialize(realm_id, origin, realm_type)
          @realm_id = realm_id
          @origin = origin
          @realm_type = realm_type
        end

        def self.from_json(input)
          realm_type = RealmType.find_by_name(input['type']) if input.key? 'type'
          realm_id = input['realm'] if input.key? 'realm'
          origin = input['origin'] if input.key? 'origin'
          browsing_context = input['context'] if input.key? 'context'
          sandbox = input['sandbox'] if input.key? 'sandbox'

          if realm_type.eql? RealmType::WINDOW
            return WindowRealmInfo.new(realm_id, origin, realm_type, browsing_context,
                                       sandbox)
          end

          RealmInfo.new(realm_id, origin, realm_type)
        end
      end
    end
  end
end
