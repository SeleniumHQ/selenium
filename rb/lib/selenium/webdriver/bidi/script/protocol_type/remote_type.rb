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
      module RemoteType
        SYMBOL = 'symbol'
        FUNCTION = 'function'
        WEAK_MAP = 'weakmap'
        WEAK_SET = 'weakset'
        ITERATOR = 'iterator'
        GENERATOR = 'generator'
        ERROR = 'error'
        PROXY = 'proxy'
        PROMISE = 'promise'
        TYPED_ARRAY = 'typedarray'
        ARRAY_BUFFER = 'arraybuffer'
        NODE_LIST = 'nodelist'
        HTML_COLLECTION = 'htmlcollection'
        NODE = 'node'
        WINDOW = 'window'

        def self.find_by_name(name)
          RemoteType.constants.each do |type|
            return RemoteType.const_get(type) if name.casecmp?(RemoteType.const_get(type))
          end
          nil
        end
      end
    end
  end
end
