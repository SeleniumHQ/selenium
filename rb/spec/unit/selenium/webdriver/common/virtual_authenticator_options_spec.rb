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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    describe VirtualAuthenticatorOptions do
      let(:options) do
        VirtualAuthenticatorOptions.new
      end

      it 'can test_transport' do
        options.transport = VirtualAuthenticatorOptions::TRANSPORT[:usb]
        expect(options.transport).to eq(VirtualAuthenticatorOptions::TRANSPORT[:usb])

        options.transport = VirtualAuthenticatorOptions::TRANSPORT[:nfc]
        expect(options.transport).to eq(VirtualAuthenticatorOptions::TRANSPORT[:nfc])
      end

      it 'can test_protocol' do
        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:u2f]
        expect(options.protocol).to eq(VirtualAuthenticatorOptions::PROTOCOL[:u2f])

        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:ctap2]
        expect(options.protocol).to eq(VirtualAuthenticatorOptions::PROTOCOL[:ctap2])
      end

      it 'can test_has_resident_key' do
        options.has_resident_key = true
        expect(options.has_resident_key).to eq(true)

        options.has_resident_key = false
        expect(options.has_resident_key).to eq(false)
      end

      it 'can test_has_user_verification' do
        options.has_user_verification = true
        expect(options.has_user_verification).to eq(true)

        options.has_user_verification = false
        expect(options.has_user_verification).to eq(false)
      end

      it 'can test_is_user_consenting' do
        options.is_user_consenting = true
        expect(options.is_user_consenting).to eq(true)

        options.is_user_consenting = false
        expect(options.is_user_consenting).to eq(false)
      end

      it 'can test_is_user_verified' do
        options.is_user_verified = true
        expect(options.is_user_verified).to eq(true)

        options.is_user_verified = false
        expect(options.is_user_verified).to eq(false)
      end

      it 'can test_to_dict_with_defaults' do
        default_options = options.as_json
        expect(default_options[:transport]).to eq(VirtualAuthenticatorOptions::TRANSPORT[:usb])
        expect(default_options[:protocol]).to eq(VirtualAuthenticatorOptions::PROTOCOL[:ctap2])
        expect(default_options[:hasResidentKey]).to eq(false)
        expect(default_options[:hasUserVerification]).to eq(false)
        expect(default_options[:isUserConsenting]).to eq(true)
        expect(default_options[:isUserVerified]).to eq(false)
      end
    end # VirtualAuthenticatorOptions
  end # WebDriver
end # Selenium
