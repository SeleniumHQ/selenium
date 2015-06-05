# encoding: utf-8
#
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

      module SharedWebStorage
        include Enumerable

        def key?(key)
          keys.include? key
        end
        alias_method :member?, :key?
        alias_method :has_key?, :key?

        def fetch(key, &blk)
          if self.key? key
            return self[key]
          end

          if block_given?
            yield key
          else
            # should be KeyError, but it's 1.9-specific
            raise IndexError, "missing key #{key.inspect}"
          end
        end

        def empty?
          size == 0
        end

        def each(&blk)
          return enum_for(:each) unless block_given?

          keys.each do |k|
            yield k, self[k]
          end
        end

      end # SharedWebStorage
    end # HTML5
  end # WebDriver
end # Selenium
