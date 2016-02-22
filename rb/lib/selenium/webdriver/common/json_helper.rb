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
    module JsonHelper

      # ActiveSupport may define Object#load, so we can't use MultiJson.respond_to? here
      sm = MultiJson.singleton_methods.map { |e| e.to_sym }

      if sm.include? :load
        # @api private
        def json_load(obj)
          MultiJson.load(obj)
        end
      else
        # @api private
        def json_load(obj)
          MultiJson.decode(obj)
        end
      end

      if sm.include? :dump
        # @api private
        def json_dump(obj)
          MultiJson.dump(obj)
        end
      else
        # @api private
        def json_dump(obj)
          MultiJson.encode(obj)
        end
      end

    end # JsonHelper
  end # WebDriver
end # Selenium
