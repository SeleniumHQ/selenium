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
    describe VirtualAuthenticator, exclusive: {browser: %i[chrome edge]} do
      # A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
      let(:pkcs8_private_key) do
        "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q" \
          "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU" \
          "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB"
      end
      let(:encoded_private_key) do
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
      let(:u2f) { VirtualAuthenticatorOptions.new(protocol: :u2f) }
      let(:ctap2) { VirtualAuthenticatorOptions.new(user_verification: true, user_verified: true) }

      before { driver.navigate.to url_for('virtual-authenticator.html') }

      after { @authenticator&.remove! if @authenticator&.valid? }

      def register_credential(require_resident: false, user_verification: false)
        params = if require_resident
                   '{authenticatorSelection: {requireResidentKey: true}}'
                 elsif user_verification
                   "{userVerification: 'required'}"
                 else
                   ''
                 end
        driver.execute_async_script "registerCredential(#{params}).then(arguments[arguments.length - 1]);"
      end

      def credential(id)
        script = <<~CREDENTIAL
          getCredential([{
            "type": "public-key",
            "id": Int8Array.from(arguments[0]),
          }]).then(arguments[arguments.length - 1]);
        CREDENTIAL
        driver.execute_async_script(script, id)
      end

      describe '#intialize' do
        it 'creates resident key disabled u2f' do
          @authenticator = driver.add_virtual_authenticator(u2f)

          expect(@authenticator.options.protocol).to eq :u2f
          expect(@authenticator.options.resident_key?).to eq false
        end

        it 'creates resident key enabled u2f' do
          u2f.resident_key = true
          @authenticator = driver.add_virtual_authenticator(u2f)

          expect(@authenticator.options.protocol).to eq :u2f
          expect(@authenticator.options.resident_key?).to eq true
        end

        it 'creates resident key disabled ctap2' do
          @authenticator = driver.add_virtual_authenticator(ctap2)

          expect(@authenticator.options.protocol).to eq :ctap2
          expect(@authenticator.options.resident_key?).to eq false
          expect(@authenticator.options.user_verified?).to eq true
          expect(@authenticator.options.user_verification?).to eq true
        end

        it 'creates resident key enabled ctap2' do
          ctap2.resident_key = true
          @authenticator = driver.add_virtual_authenticator(ctap2)

          expect(@authenticator.options.protocol).to eq :ctap2
          expect(@authenticator.options.resident_key?).to eq true
          expect(@authenticator.options.user_verified?).to eq true
          expect(@authenticator.options.user_verification?).to eq true
        end
      end

      describe '#remove!' do
        it 'removes authenticator' do
          @authenticator = driver.add_virtual_authenticator(u2f)

          @authenticator.remove!

          expect(@authenticator.valid?).to eq false
        end
      end

      describe '#add_credential' do
        it 'to non-resident ctap' do
          @authenticator = driver.add_virtual_authenticator(ctap2)

          byte_array_id = [1, 2, 3, 4]
          credential = Credential.non_resident(id: byte_array_id,
                                               rp_id: 'localhost',
                                               private_key: Credential.decode(encoded_private_key))

          @authenticator.add_credential(credential)

          expect(credential(byte_array_id)['status']).to eq('OK')
        end

        it 'to non-resident u2f' do
          @authenticator = driver.add_virtual_authenticator(u2f)

          byte_array_id = [1, 2, 3, 4]
          credential = Credential.non_resident(id: byte_array_id,
                                               rp_id: 'localhost',
                                               private_key: Credential.decode(pkcs8_private_key))

          @authenticator.add_credential(credential)

          expect(credential(byte_array_id)['status']).to eq('OK')
        end

        it 'to resident ctap' do
          ctap2.resident_key = true
          @authenticator = driver.add_virtual_authenticator(ctap2)

          byte_array_id = [1, 2, 3, 4]
          credential = Credential.resident(id: byte_array_id,
                                           rp_id: 'localhost',
                                           user_handle: [1],
                                           private_key: Credential.decode(encoded_private_key))

          @authenticator.add_credential(credential)

          expect(credential(byte_array_id)['status']).to eq('OK')
          expect(@authenticator.credentials.first.user_handle).to eq [1]
        end

        it 'to resident u2f' do
          u2f.resident_key = true
          @authenticator = driver.add_virtual_authenticator(u2f)

          byte_array_id = [1, 2, 3, 4]
          credential = Credential.resident(id: byte_array_id,
                                           rp_id: 'localhost',
                                           user_handle: [1],
                                           private_key: Credential.decode(encoded_private_key))

          msg = /The Authenticator does not support Resident Credentials/
          expect { @authenticator.add_credential(credential) }.to raise_error(Error::InvalidArgumentError, msg)
        end
      end

      describe '#credentials' do
        it 'gets multiple' do
          ctap2.resident_key = true
          @authenticator = driver.add_virtual_authenticator(ctap2)

          # Add multiple credentials with JS
          res_cred_resp = register_credential(require_resident: true)['credential']
          non_res_cred_resp = register_credential['credential']
          expect(res_cred_resp['id']).not_to eq(non_res_cred_resp['id'])

          credentials = @authenticator.credentials
          expect(credentials.length).to eq(2)

          res_cred_output = credentials.find { |cred| Credential.encode(cred.id).match res_cred_resp['id'] }
          non_res_cred_output = credentials.tap { |cred| cred.delete(res_cred_output) }.first

          expect(res_cred_output.resident_credential?).to eq true
          expect(res_cred_output.rp_id).to eq 'localhost'
          expect(res_cred_output.sign_count).to eq 1
          expect(res_cred_output.user_handle).to eq [1]

          expect(non_res_cred_output.resident_credential?).to eq false
          expect(non_res_cred_output.rp_id).to eq nil
          expect(non_res_cred_output.sign_count).to eq 1
          expect(non_res_cred_output.user_handle).to be_nil
        end
      end

      describe '#remove_credential' do
        it 'by raw ID' do
          @authenticator = driver.add_virtual_authenticator(u2f)

          credential = register_credential['credential']
          raw_id = credential['rawId']
          id = credential['id']
          2.times { register_credential }

          @authenticator.remove_credential(raw_id)

          expect(@authenticator.credentials.map(&:id)).not_to include(id)
        end

        it 'by encoded ID' do
          @authenticator = driver.add_virtual_authenticator(u2f)

          id = register_credential.dig('credential', 'id')
          2.times { register_credential }

          @authenticator.remove_credential(id)

          expect(@authenticator.credentials.map(&:id)).not_to include(id)
        end
      end

      describe '#remove_all_credentials' do
        it 'removes multiple' do
          @authenticator = driver.add_virtual_authenticator(u2f)
          3.times { register_credential }

          @authenticator.remove_all_credentials

          expect(@authenticator.credentials).to be_empty
        end
      end

      describe '#user_verified=' do
        it 'can not obtain credential requiring verification when set to false' do
          ctap2.resident_key = true
          @authenticator = driver.add_virtual_authenticator(ctap2)

          raw_id = register_credential(user_verification: true).dig('credential', 'rawId')

          @authenticator.user_verified = false

          expect(credential(raw_id)['status']).to include "NotAllowedError"
        end
      end
    end # VirtualAuthenticator
  end # WebDriver
end # Selenium
