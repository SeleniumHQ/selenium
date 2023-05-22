# frozen_string_literal: true

# frozen_string_literal = true

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
      class ExceptionDetails
        attr_accessor :column_number, :exception, :line_number, :stack_trace, :text

        def initialize(exception_details)
          @column_number = exception_details.key?('columnNumber') ? exception_details['columnNumber'] : nil
          @exception = exception_details.key?('exception') ? exception_details['exception'] : nil
          @line_number = exception_details.key?('lineNumber') ? exception_details['lineNumber'] : nil
          @stack_trace = exception_details.key?('stackTrace') ? exception_details['stackTrace'] : nil
          @text = exception_details.key?('text') ? exception_details['text'] : nil
        end
      end
    end
  end
end
