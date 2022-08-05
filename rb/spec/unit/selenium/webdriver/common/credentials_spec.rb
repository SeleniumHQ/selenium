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
    describe Credential do
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
      let(:id) { [1, 2, 3, 4] }
      let(:rp_id) { 'localhost' }
      let(:user_handle) { [1] }
      let(:private_key) { Credential.decode(base64_encoded_pk) }
      let(:sign_count) { 0 }

      describe '#self.resident' do
        it 'adds credential' do
          credential = Credential.resident(id: id,
                                           rp_id: rp_id,
                                           user_handle: user_handle,
                                           private_key: private_key,
                                           sign_count: sign_count)

          expect(credential.id).to eq([1, 2, 3, 4])
          expect(credential.resident_credential?).to eq(true)
          expect(credential.rp_id).to eq('localhost')
          expect(credential.user_handle).to eq(user_handle)
          expect(credential.private_key).to eq(private_key)
          expect(credential.sign_count).to eq(0)
        end
      end

      describe '#self.non_resident' do
        it 'can testRkDisabledCredential' do
          credential = Credential.non_resident(id: id,
                                               rp_id: rp_id,
                                               private_key: private_key,
                                               sign_count: sign_count)

          expect(credential.id).to eq([1, 2, 3, 4])
          expect(credential.resident_credential?).to eq(false)
          expect(credential.rp_id).to eq('localhost')
          expect(credential.private_key).to eq(private_key)
          expect(credential.sign_count).to eq(0)
        end
      end

      describe '#self.from_json' do
        it 'creates Credential from JSON' do
          credential_data = {'credentialId' => Credential.encode(id),
                             'isResidentCredential' => true,
                             'rpId' => 'localhost',
                             'userHandle' => Credential.encode(user_handle),
                             'privateKey' => base64_encoded_pk,
                             'signCount' => 0}

          credential = Credential.from_json(credential_data)

          expect(credential.id).to eq(id)
          expect(credential.resident_credential?).to eq(true)
          expect(credential.rp_id).to eq('localhost')
          expect(credential.user_handle).to eq(user_handle)
          expect(credential.private_key).to eq(base64_encoded_pk)
          expect(credential.sign_count).to eq(0)
        end
      end

      describe '#as_json' do
        it 'converts to JSON' do
          credential = Credential.resident(id: id,
                                           rp_id: rp_id,
                                           private_key: private_key,
                                           user_handle: user_handle,
                                           sign_count: sign_count)

          credential_json = credential.as_json

          expect(credential_json['credentialId']).to eq(Credential.encode([1, 2, 3, 4]))
          expect(credential_json['isResidentCredential']).to eq(true)
          expect(credential_json['rpId']).to eq('localhost')
          expect(credential_json['userHandle']).to eq(Credential.encode(user_handle))

          expect(credential_json['privateKey']).to eq(Credential.encode(private_key))
          expect(credential_json['signCount']).to eq(0)
        end
      end
    end # Credential
  end # WebDriver
end # Selenium
