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
      class Struct < ::Struct
        class << self
          def new(*args, &block)
            super(*args) do
              define_method(:initialize) do |**kwargs|
                converted_kwargs = kwargs.transform_keys { |key| self.class.camel_to_snake(key.to_s).to_sym }
                super(*converted_kwargs.values_at(*self.class.members))
              end
              class_eval(&block) if block
            end
          end

          def camel_to_snake(camel_str)
            camel_str.gsub(/([A-Z])/, '_\1').downcase
          end
        end
      end
    end

    # BiDi
  end # WebDriver
end # Selenium
