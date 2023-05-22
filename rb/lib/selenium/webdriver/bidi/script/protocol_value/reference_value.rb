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
      class ReferenceValue
        REMOTE_REFERENCE_TYPE = {
          HANDLE: 'handle',
          SHARED_ID: 'shareId'
        }.freeze

        def initialize(handle, share_id)
          if handle.eql? REMOTE_REFERENCE_TYPE[:HANDLE]
            @handle = share_id
          else
            @handle = handle
            @share_id = share_id
          end
        end

        def as_map
          to_return = {}
          to_return[REMOTE_REFERENCE_TYPE[:HANDLE]] = @handle unless @handle.nil?
          to_return[REMOTE_REFERENCE_TYPE[:SHARED_ID]] = @share_id unless @share_id.nil?
          to_return
        end
      end
    end
  end
end
