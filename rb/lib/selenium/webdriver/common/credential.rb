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

require "base64"

module Selenium
  module WebDriver
    class Credential
      def initialize(credentialId = nil, isResidentCredential = false, rpId = nil, userHandle = nil, privateKey = nil, signCount = nil)
        @id = credentialId
        @isResidentCredential = isResidentCredential
        @rpId = rpId
        @userHandle = userHandle
        @privateKey = privateKey
        @signCount = signCount
      end

      def id
        @id
      end

      def is_resident_credential
        @isResidentCredential
      end

      def rp_id
        @rpId
      end

      def user_handle
        if @userHandle != nil
          return @userHandle
        end
        nil
      end

      def private_key
        @privateKey
      end

      def sign_count
        @signCount
      end

      def create_resident_credential(id, rpId, userHandle, privateKey, signCount)
        Credential.new(id, true, rpId, userHandle, privateKey, signCount)
      end

      def create_non_resident_credential(id, rpId, privateKey, signCount)
        Credential.new(id, false, rpId, nil, privateKey, signCount)
      end

      def to_dict
        credential_data = {
          :credentialId => Base64.urlsafe_encode64(@id.to_s),
          :isResidentCredential => @isResidentCredential,
          :rpId => @rpId,
          :privateKey => Base64.urlsafe_encode64(@privateKey),
          :signCount => @signCount
        }

        if user_handle != nil
          credential_data[:userHandle] = Base64.urlsafe_encode64(@userHandle.to_s)
        end

        credential_data
      end

      def from_dict(data)
        id = eval(Base64.urlsafe_decode64(data["credentialId"]))
        isResidentCredential = data["isResidentCredential"]
        rpId = data['rpId']
        privateKey = Base64.urlsafe_decode64(data["privateKey"])
        signCount = data['signCount']

        if data.has_key?("userHandle")
          userHandle = eval(Base64.urlsafe_decode64(data["userHandle"]))
        else
          userHandle = nil
        end

        Credential.new(
          id,
          isResidentCredential,
          rpId,
          userHandle,
          privateKey,
          signCount
        )
      end
    end
  end
end
