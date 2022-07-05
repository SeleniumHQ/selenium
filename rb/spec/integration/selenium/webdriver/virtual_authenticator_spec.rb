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
    describe "VirtualAuthenticator" do
      BASE64_ENCODED_PK =
        "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr"\
        "MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuBGV"\
        "oPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi9AyQ"\
        "FR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1PvSqXlq"\
        "GjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsuizAgyPuQ0"\
        "+j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/XYY22ecYxM"\
        "8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtibRXz5FcNld9MgD"\
        "/Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swykoQKBgQD8hCsp6FIQ"\
        "5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMCS6S64/qzZEqijLCqe"\
        "pwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnKws1t5GapfE1rmC/h4ol"\
        "L2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63ojKjegxHIyYDKRZNVUR/d"\
        "xAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM/r8PSflNHQKBgDnWgBh6OQncChPUlOLv9FMZPR1ZOfqLCYrjYEqi"\
        "uzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8VASOmqM1ml667axeZDIR867ZG8"\
        "K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6BhZC7z8mx+pnJODU3cYukxv3WTct"\
        "lUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJwWkBwYADmkfTRmHDvqzQSSvoC2S7aa"\
        "9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KINpLwcR8fqaYOdAHWWz636osVEqosRrH"\
        "zJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fBnzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4H"\
        "BYGpI8g=="

      REGISTER_CREDENTIAL = "registerCredential().then(arguments[arguments.length - 1]);"
      # GET_CREDENTIAL = "getCredential([{\n" \
      #                  "\"type\": \"public-key\",\n" \
      #                  "\"id\": Int8Array.from(arguments[0]),\n" \
      #                  "}]).then(arguments[arguments.length - 1]);\n" \

      GET_CREDENTIAL = "getCredential([{\"type\": \"public-key\", \"id\": Int8Array.from(arguments[0]),}]).then(arguments[arguments.length - 1]);"

      def create_rk_disabled_u2f_authenticator
        options = VirtualAuthenticatorOptions.new
        options.set_protocol(VirtualAuthenticatorOptions.protocols['U2F'])
        options.set_has_resident_key(false)
        driver.add_virtual_authenticator(options)
      end

      def create_rk_enabled_u2f_authenticator
        options = VirtualAuthenticatorOptions.new
        options.set_protocol(VirtualAuthenticatorOptions.protocols['U2F'])
        options.set_has_resident_key(true)
        driver.add_virtual_authenticator(options)
      end

      def create_rk_disabled_ctap2_authenticator
        options = VirtualAuthenticatorOptions.new
        options.set_protocol(VirtualAuthenticatorOptions.protocols['CTAP2'])
        options.set_has_resident_key(false)
        options.set_has_user_verification(true)
        options.set_is_user_verified(true)
        driver.add_virtual_authenticator(options)
      end

      def create_rk_enabled_ctap2_authenticator
        options = VirtualAuthenticatorOptions.new
        options.set_protocol(VirtualAuthenticatorOptions.protocols['CTAP2'])
        options.set_has_resident_key(true)
        options.set_has_user_verification(true)
        options.set_is_user_verified(true)
        driver.add_virtual_authenticator(options)
      end

      def get_assertion_for(credential_id)
        driver.execute_async_script(GET_CREDENTIAL, credential_id)
      end

      def extract_raw_id_from(response)
        response['credential']['rawId']
      end

      def extract_id_from(response)
        response['credential']['id']
      end

      before(:each) do
        driver.navigate.to url_for('virtual-authenticator.html')
      end

      it 'should test create authenticator' do
        create_rk_disabled_u2f_authenticator
        expect(driver.virtual_authenticator_id).not_to eq(nil)

        response = driver.execute_async_script(REGISTER_CREDENTIAL)
        expect(response['status']).to eq('OK')

        puts response
        response = get_assertion_for(extract_raw_id_from(response))
        expect(response['status']).to eq('OK')
      end

      it 'should test remove authenticator' do
        options = VirtualAuthenticatorOptions.new
        driver.add_virtual_authenticator(options)
        expect(driver.virtual_authenticator_id).not_to eq(nil)

        driver.remove_virtual_authenticator
        expect(driver.virtual_authenticator_id).to eq(nil)
      end

      it 'should test add non-resident credential' do
        # expected: "OK"
        # got: "NotAllowedError: The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client."

        create_rk_disabled_ctap2_authenticator
        credential = Credential.new.create_non_resident_credential(
          [1,2,3,4],
          'localhost',
          Base64.urlsafe_decode64(BASE64_ENCODED_PK),
          0
        )

        driver.add_credential(credential)
        response = get_assertion_for([1,2,3,4])
        expect(response['status']).to eq('OK')
      end

      it 'should test add non-resident credential when authenticator uses U2F protocol' do
        # expected: "OK"
        # got: "NotAllowedError: The operation either timed out or was not allowed. See: https://www.w3.org/TR/webauthn-2/#sctn-privacy-considerations-client."

        create_rk_disabled_u2f_authenticator
        base64EncodedPK =
          "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"\
          "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"\
          "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB"

        credential = Credential.new.create_non_resident_credential(
          [1,2,3,4],
          'localhost',
          Base64.urlsafe_decode64(base64EncodedPK),
          0
        )
        driver.add_credential(credential)
        response = get_assertion_for([1,2,3,4])
        expect(response['status']).to eq('OK')
      end

      it 'should test add resident credential' do
        create_rk_enabled_ctap2_authenticator
        credential = Credential.new.create_resident_credential(
          [1,2,3,4],
          'localhost',
          [1],
          Base64.urlsafe_decode64(BASE64_ENCODED_PK),
          0
        )
        driver.add_credential(credential)
        response = driver.execute_async_script("getCredential([]).then(arguments[arguments.length - 1]);")
        puts "RESPONSE = ", response
        expect(response['status']).to eq("OK")
        expect(response['attestation']['userHandle'].include? 1).to eq(true)
      end

      it 'should test add resident credential not supported when authenticator uses U2F protocol' do
        create_rk_enabled_u2f_authenticator
        base64EncodedPK =
          "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"\
          "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"\
          "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB"

        credential = Credential.new.create_resident_credential(
          [1,2,3,4],
          'localhost',
          [1],
          Base64.urlsafe_decode64(base64EncodedPK),
          0
        )

        begin
          driver.add_credential(credential)
        rescue => e
          expect(e.class).to eq(WebDriver::Error::InvalidArgumentError)
        end
      end

      it 'should test get credentials' do
        create_rk_enabled_ctap2_authenticator
        response1 = driver.execute_async_script(
          "registerCredential({authenticatorSelection: {requireResidentKey: true}})" \
            " .then(arguments[arguments.length - 1]);"
        )
        expect(response1['status']).to eq('OK')

        response2 = driver.execute_async_script(REGISTER_CREDENTIAL)
        expect(response2['status']).to eq('OK')

        credential_1_id = extract_raw_id_from(response1)
        credential_2_id = extract_raw_id_from(response2)

        expect(credential_1_id.sort).not_to eq(credential_2_id.sort)

        credentials = driver.get_credentials
        expect(credentials.length).to eq(2)

        credential_1 = nil
        credential_2 = nil

        credentials.each { |credential|
          puts credential.id
          puts credential_1_id
          if credential.id == credential_1_id
            credential_1 = credential
          elsif credential.id == credential_2_id
            credential_2 = credential
          else
            raise "Unrecognized credential id"
          end
        }

        expect(credential_1.is_resident_credential).to eq(true)
      end

      it 'should test remove credential by rawID' do
        create_rk_disabled_u2f_authenticator

        response = driver.execute_async_script(REGISTER_CREDENTIAL)
        expect(response['status']).to eq('OK')

        raw_id = extract_raw_id_from(response)
        puts response
        driver.remove_credential(raw_id)

        response = get_assertion_for(raw_id)
        expect(response['status']).to start_with("NotAllowedError")

      end
    end
  end
end


