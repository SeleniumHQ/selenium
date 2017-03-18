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
    module Interactions
      class Interaction
        PAUSE = :pause

        attr_reader :source

        def initialize(source)
          raise TypeError, "#{source.type} is not a valid input type" unless Interactions::SOURCE_TYPES.include? source.type
          @source = source
        end
      end

      class Pause < Interaction
        def initialize(source, duration = nil)
          super(source)
          @duration = duration
        end

        def type
          PAUSE
        end

        def encode
          output = {type: type}
          output[:duration] = (@duration * 1000).to_i if @duration
          output
        end
      end # Interaction
    end # Interactions
  end # WebDriver
end # Selenium
