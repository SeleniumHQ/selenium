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
    #
    # Immutable Configuration for HTTP clients.
    #

    ClientConfig = Data.define(
      :open_timeout,
      :read_timeout,
      :proxy,
      :extra_headers,
      :user_agent,
      :server_url
    ) do
      def initialize(
        open_timeout: nil,
        read_timeout: nil,
        proxy: nil,
        extra_headers: nil,
        user_agent: nil,
        server_url: nil
      )
        super
      end
    end
  end
end
