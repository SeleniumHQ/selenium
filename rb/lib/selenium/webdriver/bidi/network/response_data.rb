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
      class ResponseData
        attr_accessor :url, :protocol, :status, :status_text, :from_cache, :headers,
                      :mime_type, :bytes_received, :headers_size, :body_size, :content,
                      :auth_challenges

        def initialize(response)
          @url = response[:url]
          @protocol = response[:protocol]
          @status = response[:status]
          @status_text = response[:statusText]
          @from_cache = response[:cacheState]
          @headers = response[:headers]
          @mime_type = response[:mimeType]
          @bytes_received = response[:bytesReceived]
          @headers_size = response[:headersSize]
          @body_size = response[:bodySize]
          @content = response[:content]
          @auth_challenges = response[:authChallenges]
        end
      end
    end
  end
end


