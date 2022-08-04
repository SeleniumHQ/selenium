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
      class << self
        def resident(**opts)
          Credential.new(resident_credential: true, **opts)
        end

        def non_resident(**opts)
          Credential.new(resident_credential: false, **opts)
        end

        def encode(byte_array)
          Base64.urlsafe_encode64(byte_array&.pack('C*'))
        end

        def decode(base64)
          Base64.urlsafe_decode64(base64).unpack('C*')
        end

        def from_json(opts)
          user_handle = opts['userHandle'] ? decode(opts['userHandle']) : nil
          new(id: decode(opts["credentialId"]),
              resident_credential: opts["isResidentCredential"],
              rp_id: opts['rpId'],
              private_key: opts['privateKey'],
              sign_count: opts['signCount'],
              user_handle: user_handle)
        end
      end

      attr_reader :id, :resident_credential, :rp_id, :user_handle, :private_key, :sign_count
      alias_method :resident_credential?, :resident_credential

      def initialize(id:, resident_credential:, rp_id:, private_key:, user_handle: nil, sign_count: 0)
        @id = id
        @resident_credential = resident_credential
        @rp_id = rp_id
        @user_handle = user_handle
        @private_key = private_key
        @sign_count = sign_count
      end

      #
      # @api private
      #

      def as_json(*)
        credential_data = {'credentialId' => Credential.encode(id),
                           'isResidentCredential' => resident_credential?,
                           'rpId' => rp_id,
                           'privateKey' => Credential.encode(private_key),
                           'signCount' => sign_count}
        credential_data['userHandle'] = Credential.encode(user_handle) if user_handle
        credential_data
      end
    end # Credential
  end # WebDriver
end # Selenium
