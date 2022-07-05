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
      @options
      before(:each) do
        @options = VirtualAuthenticatorOptions.new
      end

      it 'can test_set_transport' do
        @options.set_transport(VirtualAuthenticatorOptions.transports['USB'])
        expect(@options.get_transport).to eq(VirtualAuthenticatorOptions.transports['USB'])
      end

      it 'can test_get_transport' do
        @options.transport = VirtualAuthenticatorOptions.transports['NFC']
        expect(@options.get_transport).to eq(VirtualAuthenticatorOptions.transports['NFC'])
      end


      it 'can test_set_protocol' do
        @options.set_protocol(VirtualAuthenticatorOptions.protocols['U2F'])
        expect(@options.get_protocol).to eq(VirtualAuthenticatorOptions.protocols['U2F'])
      end

      it 'can test_get_protocol' do
        @options.protocol = VirtualAuthenticatorOptions.protocols['CTAP2']
        expect(@options.get_protocol).to eq(VirtualAuthenticatorOptions.protocols['CTAP2'])
      end

      it 'can test_set_has_resident_key' do
        @options.set_has_resident_key(true)
        expect(@options.get_has_resident_key).to eq(true)
      end

      it 'can test_get_has_resident_key' do
        @options.has_resident_key = false
        expect(@options.get_has_resident_key).to eq(false)
      end

      it 'can test_set_has_user_verification' do
        @options.set_has_user_verification(true)
        expect(@options.get_has_user_verification).to eq(true)
      end

      it 'can test_get_has_user_verification' do
        @options.has_user_verification = false
        expect(@options.get_has_user_verification).to eq(false)
      end

      it 'can test_set_is_user_consenting' do
        @options.set_is_user_consenting(true)
        expect(@options.get_is_user_consenting).to eq(true)
      end

      it 'can test_get_is_user_consenting' do
        @options.is_user_consenting = false
        expect(@options.get_is_user_consenting).to eq(false)
      end

      it 'can test_set_is_user_verified' do
        @options.set_is_user_verified(true)
        expect(@options.get_is_user_verified).to eq(true)
      end

      it 'can test_get_is_user_verified' do
        @options.is_user_verified = false
        expect(@options.get_is_user_verified).to eq(false)
      end

      it 'can test_to_dict_with_defaults' do
        default_options = @options.to_dict
        expect(default_options[:transport]).to eq(VirtualAuthenticatorOptions.transports['USB'])
        expect(default_options[:protocol]).to eq(VirtualAuthenticatorOptions.protocols['CTAP2'])
        expect(default_options[:hasResidentKey]).to eq(false)
        expect(default_options[:hasUserVerification]).to eq(false)
        expect(default_options[:isUserConsenting]).to eq(true)
        expect(default_options[:isUserVerified]).to eq(false)
      end

    end
  end
end


