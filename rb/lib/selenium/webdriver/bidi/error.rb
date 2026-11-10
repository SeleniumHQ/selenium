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

require 'selenium/webdriver/common/error'
require 'selenium/webdriver/bidi/protocol/error_code'

module Selenium
  module WebDriver
    module Error
      # Raised locally when a BiDi wire payload does not match this Selenium's generated
      # schema. It is not a protocol error code; the (de)serialization layer raises it directly.
      class SerializationError < WebDriverError; end

      # Register each BiDi-only code as a WebDriverError subclass; shared codes keep their classic class.
      BiDi::Protocol::ErrorCode::CLASS_NAMES.each_value do |name|
        const_set(name, Class.new(WebDriverError)) unless const_defined?(name, false)
      end
    end

    class BiDi
      module Protocol
        module ErrorCode
          # The exception class for a wire error code, or WebDriverError for an unknown one.
          def self.for(code)
            name = code && CLASS_NAMES[code]
            name ? Error.const_get(name) : Error::WebDriverError
          end
        end
      end
    end
  end
end
