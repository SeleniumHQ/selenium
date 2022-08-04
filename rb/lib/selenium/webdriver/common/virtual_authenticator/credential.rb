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

#
# A credential stored in a virtual authenticator.
# @see https://w3c.github.io/webauthn/#credential-parameters
#

module Selenium
  module WebDriver
    class Credential
      def initialize(id:, is_resident_credential:, rp_id:, user_handle:, private_key:, sign_count:)
        @id = id
        @is_resident_credential = is_resident_credential
        @rp_id = rp_id
        @user_handle = user_handle
        @private_key = private_key
        @sign_count = sign_count
      end

      attr_reader :id, :is_resident_credential, :rp_id, :user_handle, :private_key, :sign_count

      def self.create_resident_credential(id, rp_id, user_handle, private_key, sign_count)
        Credential.new(id: id, is_resident_credential: true, rp_id: rp_id, user_handle: user_handle,
                       private_key: private_key, sign_count: sign_count)
      end

      def self.create_non_resident_credential(id, rp_id, private_key, sign_count)
        Credential.new(id: id, is_resident_credential: false, rp_id: rp_id, user_handle: nil,
                       private_key: private_key, sign_count: sign_count)
      end

      #
      # @api private
      #

      def as_json(*)
        credential_data = {
          credentialId: Base64.urlsafe_encode64(@id&.pack('C*')),
          isResidentCredential: @is_resident_credential,
          rpId: @rp_id,
          privateKey: Base64.urlsafe_encode64(@private_key),
          signCount: @sign_count
        }

        credential_data[:userHandle] = Base64.urlsafe_encode64(@user_handle&.pack('C*')) unless user_handle.nil?
        credential_data
      end

      #
      # @api private
      #

      def self.from_json(data)
        id = Base64.urlsafe_decode64(data["credentialId"]).unpack('C*')
        is_resident_credential = data["isResidentCredential"]
        rp_id = data['rpId']
        private_key = Base64.urlsafe_decode64(data["privateKey"])
        sign_count = data['signCount']
        user_handle = (Base64.urlsafe_decode64(data["userHandle"]).unpack('C*') if data.key?("userHandle"))

        Credential.new(
          id: id,
          is_resident_credential: is_resident_credential,
          rp_id: rp_id,
          user_handle: user_handle,
          private_key: private_key,
          sign_count: sign_count
        )
      end
    end # Credential
  end # WebDriver
end # Selenium
