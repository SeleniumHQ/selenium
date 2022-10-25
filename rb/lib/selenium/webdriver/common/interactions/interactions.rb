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
    module Interactions
      KEY = :key
      POINTER = :pointer
      NONE = :none
      WHEEL = :wheel

      #
      # Class methods for initializing known Input devices
      #

      class << self
        def key(name = nil)
          KeyInput.new(name)
        end

        def pointer(kind = :mouse, name: nil)
          PointerInput.new(kind, name: name)
        end

        def mouse(name: nil)
          pointer(name: name)
        end

        def pen(name: nil)
          pointer(:pen, name: name)
        end

        def touch(name: nil)
          pointer(:touch, name: name)
        end

        def none(name = nil)
          NoneInput.new(name)
        end

        def wheel(name = nil)
          WheelInput.new(name)
        end
      end
    end # Interactions
  end # WebDriver
end # Selenium
