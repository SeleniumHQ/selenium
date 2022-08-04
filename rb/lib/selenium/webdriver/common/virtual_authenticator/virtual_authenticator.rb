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
    class VirtualAuthenticator

      attr_reader :options

      #
      # api private
      # Use `Driver#add_virtual_authenticator`
      #

      def initialize(bridge, authenticator_id, options)
        @id = authenticator_id
        @bridge = bridge
        @options = options
        @valid = true
      end

      def add_credential(credential)
        credential = credential.as_json
        @bridge.add_credential credential, @id
      end

      def credentials
        credential_data = @bridge.credentials @id
        credential_data.map do |cred|
          Credential.from_json(cred)
        end
      end

      def remove_credential(credential_id)
        credential_id = Credential.encode(credential_id) if credential_id.instance_of?(Array)
        @bridge.remove_credential credential_id, @id
      end

      def remove_all_credentials
        @bridge.remove_all_credentials @id
      end

      def user_verified=(verified)
        @bridge.user_verified verified, @id
      end

      def remove!
        @bridge.remove_virtual_authenticator(@id)
        @valid = false
      end

      def valid?
        @valid
      end
    end # VirtualAuthenticator
  end # WebDriver
end # Selenium
