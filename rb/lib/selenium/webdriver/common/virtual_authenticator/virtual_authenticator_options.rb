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
# Options for the creation of virtual authenticators.
# @see http://w3c.github.io/webauthn/#sctn-automation
#

module Selenium
  module WebDriver
    class VirtualAuthenticatorOptions

      PROTOCOL = {ctap2: "ctap2", u2f: "ctap1/u2f"}.freeze
      TRANSPORT = {ble: "ble", usb: "usb", nfc: "nfc", internal: "internal"}.freeze

      attr_accessor :protocol, :transport, :has_resident_key, :has_user_verification, :is_user_consenting,
                    :is_user_verified

      def initialize(protocol: PROTOCOL[:ctap2], transport: TRANSPORT[:usb], has_resident_key: false,
                     has_user_verification: false, is_user_consenting: true, is_user_verified: false)
        @protocol = protocol
        @transport = transport
        @has_resident_key = has_resident_key
        @has_user_verification = has_user_verification
        @is_user_consenting = is_user_consenting
        @is_user_verified = is_user_verified
      end

      #
      # @api private
      #

      def as_json(*)
        {
          protocol: @protocol,
          transport: @transport,
          hasResidentKey: @has_resident_key,
          hasUserVerification: @has_user_verification,
          isUserConsenting: @is_user_consenting,
          isUserVerified: @is_user_verified
        }
      end
    end # VirtualAuthenticatorOptions
  end # WebDriver
end # Selenium
