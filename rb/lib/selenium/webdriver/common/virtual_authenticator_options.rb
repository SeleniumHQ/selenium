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
    class VirtualAuthenticatorOptions
      @@protocols = { "CTAP2" => "ctap2", "U2F" => "ctap1/u2f" }
      @@transports = { "BLE" => "ble", "USB" => "usb", "NFC" => "nfc", "INTERNAL" => "internal" }

      attr_accessor :protocol, :transport, :has_resident_key, :has_user_verification, :is_user_consenting, :is_user_verified

      def initialize
        @protocol = @@protocols["CTAP2"]
        @transport = @@transports["USB"]
        @has_resident_key = false
        @has_user_verification = false
        @is_user_consenting = true
        @is_user_verified = false
      end

      def self.protocols
        @@protocols
      end

      def self.transports
        @@transports
      end

      def get_protocol
        @protocol
      end

      def set_protocol(protocol)
        @protocol = protocol
      end

      def get_transport
        @transport
      end

      def set_transport(transport)
        @transport = transport
      end

      def get_has_resident_key
        @has_resident_key
      end

      def set_has_resident_key(value)
        @has_resident_key = value
      end

      def get_has_user_verification
        @has_user_verification
      end

      def set_has_user_verification(value)
        @has_user_verification = value
      end

      def get_is_user_consenting
        @is_user_consenting
      end

      def set_is_user_consenting(value)
        @is_user_consenting = value
      end

      def get_is_user_verified
        @is_user_verified
      end

      def set_is_user_verified(value)
        @is_user_verified = value
      end

      def to_dict
         {
           :protocol => get_protocol,
           :transport => get_transport,
           :hasResidentKey => get_has_resident_key,
           :hasUserVerification => get_has_user_verification,
           :isUserConsenting => get_is_user_consenting,
           :isUserVerified => get_is_user_verified
        }
      end
    end
  end
end

