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
    module HTML5
      class SessionStorage
        include Enumerable
        include SharedWebStorage

        def [](key)
          @bridge.session_storage_item key
        end

        def []=(key, value)
          @bridge.session_storage_item key, value
        end

        def delete(key)
          @bridge.remove_session_storage_item key
        end

        def clear
          @bridge.clear_session_storage
        end

        def size
          @bridge.session_storage_size
        end

        def keys
          @bridge.session_storage_keys.reverse
        end

        #
        # @api private
        #

        def initialize(bridge)
          @bridge = bridge
        end
      end # SessionStorage
    end # HTML5
  end # WebDriver
end # Selenium
