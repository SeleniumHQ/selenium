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
      #
      # Action to create a waiting period between actions
      # Also used for synchronizing actions across devices
      #
      # @api private
      #

      class Pause < Interaction
        def initialize(source, duration = nil)
          super(source)
          @duration = duration
          @type = :pause
        end

        def assert_source(source)
          raise TypeError, "#{source.type} is not a valid input type" unless source.is_a? InputDevice
        end

        def encode
          output = {type: type}
          output[:duration] = (@duration * 1000).to_i if @duration
          output
        end
      end # Pause
    end # Interactions
  end # WebDriver
end # Selenium
