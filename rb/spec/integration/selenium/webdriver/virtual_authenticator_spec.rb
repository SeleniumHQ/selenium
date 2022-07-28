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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe VirtualAuthenticator, exclusive: {browser: %i[chrome]} do
      def create_rk_disabled_u2f_authenticator
        options = VirtualAuthenticatorOptions.new
        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:u2f]
        options.has_resident_key = false
        driver.add_virtual_authenticator(options)
      end

      def create_rk_enabled_u2f_authenticator
        options = VirtualAuthenticatorOptions.new
        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:u2f]
        options.has_resident_key = true
        driver.add_virtual_authenticator(options)
      end

      def create_rk_disabled_ctap2_authenticator
        options = VirtualAuthenticatorOptions.new
        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:ctap2]
        options.has_resident_key = false
        options.has_user_verification = true
        options.is_user_verified = true
        driver.add_virtual_authenticator(options)
      end

      def create_rk_enabled_ctap2_authenticator
        options = VirtualAuthenticatorOptions.new
        options.protocol = VirtualAuthenticatorOptions::PROTOCOL[:ctap2]
        options.has_resident_key = true
        options.has_user_verification = true
        options.is_user_verified = true
        driver.add_virtual_authenticator(options)
      end

      def get_assertion_for(credential_id)
        driver.execute_async_script(get_credential, credential_id)
      end

      def extract_raw_id_from(response)
        response['credential']['rawId']
      end

      def extract_id_from(response)
        response['credential']['id']
      end

      #
      # A private key as a base64url string.
      #

      let(:base64_encoded_pk) do
        "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr" \
          "MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuBGV" \
          "oPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi9AyQ" \
          "FR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1PvSqXlq" \
          "GjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsuizAgyPuQ0" \
          "+j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/XYY22ecYxM" \
          "8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtibRXz5FcNld9MgD" \
          "/Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swykoQKBgQD8hCsp6FIQ" \
          "5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMCS6S64/qzZEqijLCqe" \
          "pwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnKws1t5GapfE1rmC/h4ol" \
          "L2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63ojKjegxHIyYDKRZNVUR/d" \
          "xAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM/r8PSflNHQKBgDnWgBh6OQncChPUlOLv9FMZPR1ZOfqLCYrjYEqi" \
          "uzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8VASOmqM1ml667axeZDIR867ZG8" \
          "K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6BhZC7z8mx+pnJODU3cYukxv3WTct" \
          "lUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJwWkBwYADmkfTRmHDvqzQSSvoC2S7aa" \
          "9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KINpLwcR8fqaYOdAHWWz636osVEqosRrH" \
          "zJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fBnzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4H" \
          "BYGpI8g=="
      end

      let(:register_credential) do
        "registerCredential().then(arguments[arguments.length - 1]);"
      end

      let(:get_credential) do
        "getCredential([{\n" \
          "\"type\": \"public-key\",\n" \
          "\"id\": Int8Array.from(arguments[0]),\n" \
          "}]).then(arguments[arguments.length - 1]);\n"
      end

      before do
        driver.navigate.to url_for('virtual-authenticator.html')
      end

      after do
        driver.remove_virtual_authenticator(@authenticator) unless @authenticator.nil?
      end

      it 'should test create authenticator' do
        #
        # Register a credential on the Virtual Authenticator.
        #

        @authenticator = create_rk_disabled_u2f_authenticator
        expect(@authenticator).not_to eq(nil)

        response = driver.execute_async_script(register_credential)
        expect(response['status']).to eq('OK')

        #
        # Attempt to use the credential to get an assertion.
        #
        response = get_assertion_for(extract_raw_id_from(response))
        expect(response['status']).to eq('OK')
      end

      it 'should test remove authenticator' do
        options = VirtualAuthenticatorOptions.new
        @authenticator = driver.add_virtual_authenticator(options)
        expect(@authenticator).not_to eq(nil)

        driver.remove_virtual_authenticator(@authenticator)
        @authenticator = nil
      end

      it 'should test add non-resident credential' do
        #
        # Add a non-resident credential using the testing API.
        #
        @authenticator = create_rk_disabled_ctap2_authenticator
        credential = Credential.create_non_resident_credential(
          [1, 2, 3, 4],
          'localhost',
          Base64.urlsafe_decode64(base64_encoded_pk),
          0
        )

        @authenticator.add_credential(credential)
        #
        # Attempt to use the credential to generate an assertion.
        #
        response = get_assertion_for([1, 2, 3, 4])
        expect(response['status']).to eq('OK')
      end

      it 'should test add non-resident credential when authenticator uses U2F protocol' do
        @authenticator = create_rk_disabled_u2f_authenticator
        base64_enc_pk =
          "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"\
          "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"\
          "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB"

        credential = Credential.create_non_resident_credential(
          [1, 2, 3, 4],
          'localhost',
          Base64.urlsafe_decode64(base64_enc_pk),
          0
        )
        @authenticator.add_credential(credential)
        response = get_assertion_for([1, 2, 3, 4])
        expect(response['status']).to eq('OK')
      end

      it 'should test add resident credential' do
        @authenticator = create_rk_enabled_ctap2_authenticator
        credential = Credential.create_resident_credential(
          [1, 2, 3, 4],
          'localhost',
          [1],
          Base64.urlsafe_decode64(base64_encoded_pk),
          0
        )
        @authenticator.add_credential(credential)
        #
        # Attempt to use the credential to generate an assertion. Notice we use an
        # empty allowCredentials array.
        #

        response = driver.execute_async_script("getCredential([]).then(arguments[arguments.length - 1]);")
        expect(response['status']).to eq("OK")
        expect(response['attestation']['userHandle'].include?(1)).to eq(true)
      end

      it 'should test add resident credential not supported when authenticator uses U2F protocol' do
        @authenticator = create_rk_enabled_u2f_authenticator
        base64_enc_pk =
          "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"\
          "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"\
          "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB"

        credential = Credential.create_resident_credential(
          [1, 2, 3, 4],
          'localhost',
          [1],
          Base64.urlsafe_decode64(base64_enc_pk),
          0
        )

        #
        # Throws InvalidArgumentError
        #

        begin
          @authenticator.add_credential(credential)
        rescue StandardError => e
          expect(e.class).to eq(WebDriver::Error::InvalidArgumentError)
        end
      end

      it 'should test get credentials' do
        @authenticator = create_rk_enabled_ctap2_authenticator
        #
        # Register a resident credential.
        #

        response1 = driver.execute_async_script(
          "registerCredential({authenticatorSelection: {requireResidentKey: true}})" \
          " .then(arguments[arguments.length - 1]);"
        )
        expect(response1['status']).to eq('OK')

        #
        # Register a non resident credential.
        #

        response2 = driver.execute_async_script(register_credential)
        expect(response2['status']).to eq('OK')

        credential_1_id = extract_raw_id_from(response1)
        credential_2_id = extract_raw_id_from(response2)

        expect(credential_1_id.sort).not_to eq(credential_2_id.sort)

        #
        # Retrieve the two credentials.
        #

        credentials = @authenticator.credentials

        expect(credentials.length).to eq(2)

        credential1 = nil
        credential2 = nil

        credentials.each do |credential|
          if credential.id == credential_1_id
            credential1 = credential
          elsif credential.id == credential_2_id
            credential2 = credential
          else
            raise "Unrecognized credential id"
          end
        end

        expect(credential1.is_resident_credential).to eq(true)
        expect(credential1.private_key).not_to eq(nil)
        expect(credential1.rp_id).to eq('localhost')
        expect(credential1.user_handle).to eq([1])
        expect(credential1.sign_count).to eq(1)

        expect(credential2.is_resident_credential).to eq(false)
        expect(credential2.private_key).not_to eq(nil)
        #
        # Non resident keys do not store raw RP IDs or user handles.
        #
        expect(credential2.rp_id).to eq(nil)
        expect(credential2.user_handle).to eq(nil)
        expect(credential2.sign_count).to eq(1)
      end

      it 'should test remove credential by rawID' do
        @authenticator = create_rk_disabled_u2f_authenticator

        response = driver.execute_async_script(register_credential)
        expect(response['status']).to eq('OK')

        #
        # Remove a credential by its ID as an array of bytes.
        #

        raw_id = extract_raw_id_from(response)
        @authenticator.remove_credential(raw_id)

        #
        # Trying to get an assertion should fail.
        #

        response = get_assertion_for(raw_id)
        expect(response['status']).to start_with("NotAllowedError")
      end

      it 'should test remove credential by base64url Id' do
        @authenticator = create_rk_disabled_u2f_authenticator
        response = driver.execute_async_script(register_credential)
        raw_id = extract_raw_id_from(response)
        credential_id = extract_id_from(response)

        #
        # Remove a credential by its base64url ID.
        #

        @authenticator.remove_credential(credential_id)

        response = get_assertion_for(raw_id)
        expect(response['status']).to start_with("NotAllowedError")
      end

      it 'should test remove all credentials' do
        @authenticator = create_rk_disabled_u2f_authenticator

        response1 = driver.execute_async_script(register_credential)
        expect(response1['status']).to eq('OK')
        raw_id1 = extract_raw_id_from(response1)

        response2 = driver.execute_async_script(register_credential)
        expect(response2['status']).to eq('OK')
        raw_id2 = extract_raw_id_from(response2)

        #
        # Remove all credentials.
        #

        @authenticator.remove_all_credentials

        #
        # Trying to get an assertion allowing for any of both should fail.
        #

        response = driver.execute_async_script(
          "getCredential([{"\
          "  \"type\": \"public-key\"," \
          "  \"id\": Int8Array.from(arguments[0])," \
          "}, {" \
          "  \"type\": \"public-key\"," \
          "  \"id\": Int8Array.from(arguments[1])," \
          "}]).then(arguments[arguments.length - 1]);",
          raw_id1,
          raw_id2
        )
        expect(response['status']).to start_with("NotAllowedError")
      end

      it 'should test set user verified' do
        @authenticator = create_rk_enabled_ctap2_authenticator

        #
        # Register a credential requiring User Verification
        #

        response = driver.execute_async_script(
          "registerCredential({authenticatorSelection: {userVerification: 'required'}})"\
          "  .then(arguments[arguments.length - 1]);"
        )
        expect(response['status']).to eq('OK')

        raw_id = extract_raw_id_from(response)

        #
        # Getting an assertion requiring user verification should succeed.
        #

        response = driver.execute_async_script(get_credential, raw_id)
        expect(response['status']).to eq('OK')

        #
        # Disable user verification.
        #
        @authenticator.user_verified = false

        #
        # Getting an assertion requiring user verification should fail.
        #
        response = driver.execute_async_script(get_credential, raw_id)
        expect(response['status']).to start_with("NotAllowedError")
      end
    end # VirtualAuthenticator
  end # WebDriver
end # Selenium
