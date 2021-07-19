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
    describe Proxy do
      let :proxy_settings do # manual proxy settings
        {
          ftp: 'mythicalftpproxy:21',
          http: 'mythicalproxy:80',
          no_proxy: 'noproxy',
          ssl: 'mythicalsslproxy',
          socks: 'mythicalsocksproxy:65555',
          socks_username: 'test',
          socks_password: 'test',
          socks_version: 5
        }
      end

      let :pac_proxy_settings do
        {
          pac: 'http://example.com/foo.pac'
        }
      end

      it 'raises ArgumentError if passed invalid options' do
        expect { Proxy.new(invalid_options: 'invalid') }.to raise_error(ArgumentError)
      end

      it 'raises ArgumentError if passed an invalid proxy type' do
        expect { Proxy.new(type: :invalid) }.to raise_error(ArgumentError)
      end

      it 'raises ArgumentError if the proxy type is changed' do
        proxy = Proxy.new(type: :direct)
        expect { proxy.type = :system }.to raise_error(ArgumentError)
      end

      it 'should allow valid options for a manual proxy', :aggregate_failures do
        proxy = Proxy.new(proxy_settings)

        expect(proxy.ftp).to            eq(proxy_settings[:ftp])
        expect(proxy.http).to           eq(proxy_settings[:http])
        expect(proxy.no_proxy).to       eq(proxy_settings[:no_proxy])
        expect(proxy.ssl).to            eq(proxy_settings[:ssl])
        expect(proxy.socks).to          eq(proxy_settings[:socks])
        expect(proxy.socks_username).to eq(proxy_settings[:socks_username])
        expect(proxy.socks_password).to eq(proxy_settings[:socks_password])
        expect(proxy.socks_version).to  eq(proxy_settings[:socks_version])
      end

      it 'should return a hash of the json properties to serialize', :aggregate_failures do
        proxy_json = Proxy.new(proxy_settings).as_json

        expect(proxy_json['proxyType']).to     eq('manual')
        expect(proxy_json['ftpProxy']).to      eq(proxy_settings[:ftp])
        expect(proxy_json['httpProxy']).to     eq(proxy_settings[:http])
        expect(proxy_json['noProxy']).to       eq([proxy_settings[:no_proxy]])
        expect(proxy_json['sslProxy']).to      eq(proxy_settings[:ssl])
        expect(proxy_json['socksProxy']).to    eq(proxy_settings[:socks])
        expect(proxy_json['socksUsername']).to eq(proxy_settings[:socks_username])
        expect(proxy_json['socksPassword']).to eq(proxy_settings[:socks_password])
        expect(proxy_json['socksVersion']).to  eq(proxy_settings[:socks_version])
      end

      it 'should configure a PAC proxy', :aggregate_failures do
        proxy_json = Proxy.new(pac_proxy_settings).as_json

        expect(proxy_json['proxyType']).to eq('pac')
        expect(proxy_json['proxyAutoconfigUrl']).to eq(pac_proxy_settings[:pac])
      end

      it 'should configure an auto-detected proxy', :aggregate_failures do
        proxy_json = Proxy.new(auto_detect: true).as_json

        expect(proxy_json['proxyType']).to eq('autodetect')
        expect(proxy_json['autodetect']).to be true
      end

      it 'should only add settings that are not nil', :aggregate_failures do
        settings = {type: :manual, http: 'http proxy'}

        proxy = Proxy.new(settings)
        proxy_json = proxy.as_json

        expect(proxy_json.delete('proxyType')).to eq(settings[:type].to_s)
        expect(proxy_json.delete('httpProxy')).to eq(settings[:http])

        expect(proxy_json).to be_empty
      end

      it 'returns a JSON string' do
        proxy = Proxy.new(proxy_settings)
        expect(proxy.to_json).to be_kind_of(String)
      end

      it 'can be serialized and deserialized' do
        proxy = Proxy.new(proxy_settings)
        other = Proxy.json_create(proxy.as_json)

        expect(proxy).to eq(other)
      end

      it 'deserializes to nil if proxyType is UNSPECIFIED' do
        expect(Proxy.json_create('proxyType' => 'UNSPECIFIED')).to be_nil
      end
    end
  end # WebDriver
end # Selenium
