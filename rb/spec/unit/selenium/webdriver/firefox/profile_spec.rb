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

require_relative '../spec_helper'

module Selenium
  module WebDriver
    module Firefox
      describe Profile, only: {browser: %i[firefox]} do
        let(:profile) { described_class.new }

        def read_generated_prefs(from = nil)
          prof = from || profile
          dir = prof.layout_on_disk

          File.read(File.join(dir, 'user.js'))
        end

        it '#from_name' do
          ini = instance_double(ProfilesIni)
          allow(described_class).to receive(:ini).and_return(ini)
          allow(ini).to receive(:[]).and_return('not nil')
          described_class.from_name('default')

          expect(ini).to have_received(:[]).with('default')
        end

        it 'uses default preferences' do
          expect(read_generated_prefs).to include('user_pref("browser.newtabpage.enabled", false)',
                                                  'user_pref("browser.startup.homepage", "about:blank")',
                                                  'user_pref("startup.homepage_welcome_url", "about:blank")',
                                                  'user_pref("browser.usedOnWindows10.introURL", "about:blank")',
                                                  'user_pref("network.captive-portal-service.enabled", false)',
                                                  'user_pref("security.csp.enable", false)')
        end

        it 'can override welcome page' do
          profile['startup.homepage_welcome_url'] = 'http://google.com'

          expect(read_generated_prefs).to include('user_pref("browser.startup.homepage", "about:blank")',
                                                  'user_pref("startup.homepage_welcome_url", "http://google.com")')
        end

        it 'sets additional preferences' do
          profile['foo.number'] = 123
          profile['foo.boolean'] = true
          profile['foo.string'] = 'bar'

          expect(read_generated_prefs).to include('user_pref("foo.number", 123)',
                                                  'user_pref("foo.boolean", true)',
                                                  'user_pref("foo.string", "bar")')
        end

        it 'is serializable to JSON' do
          profile['foo.boolean'] = true

          new_profile = described_class.from_json(profile.to_json)
          expect(read_generated_prefs(new_profile)).to include('user_pref("foo.boolean", true)')
        end

        it 'properlies handle escaped characters' do
          profile['foo'] = 'C:\\r\\n'

          expect(read_generated_prefs).to include('user_pref("foo", "C:\\\\r\\\\n");')
        end

        it 'lets the user override some specific prefs' do
          profile['browser.startup.page'] = 'http://example.com'

          expect(read_generated_prefs).to include(%{user_pref("browser.startup.page", "http://example.com")})
        end

        it 'raises an error if the value given is not a string, number or boolean' do
          expect { profile['foo.bar'] = [] }.to raise_error(TypeError)
        end

        it 'raises an error if the value is already stringified' do
          expect { profile['foo.bar'] = '"stringified"' }.to raise_error(ArgumentError)
        end

        it 'can configure a manual proxy' do
          proxy = Proxy.new(
            http: 'foo:123',
            ftp: 'bar:234',
            ssl: 'baz:345',
            no_proxy: 'localhost'
          )

          profile.proxy = proxy
          expect(read_generated_prefs).to include('user_pref("network.proxy.http", "foo")',
                                                  'user_pref("network.proxy.http_port", 123)',
                                                  'user_pref("network.proxy.ftp", "bar")',
                                                  'user_pref("network.proxy.ftp_port", 234)',
                                                  'user_pref("network.proxy.ssl", "baz")',
                                                  'user_pref("network.proxy.ssl_port", 345)',
                                                  'user_pref("network.proxy.no_proxies_on", "localhost")',
                                                  'user_pref("network.proxy.type", 1)')
        end

        it 'can configure a PAC proxy' do
          profile.proxy = Proxy.new(pac: 'http://foo/bar.pac')

          expect(read_generated_prefs).to include('user_pref("network.proxy.autoconfig_url", "http://foo/bar.pac"',
                                                  'user_pref("network.proxy.type", 2)')
        end

        it 'can configure an auto-detected proxy' do
          profile.proxy = Proxy.new(auto_detect: true)

          expect(read_generated_prefs).to include('user_pref("network.proxy.type", 4)')
        end

        it 'can install extension' do
          firebug = File.expand_path('../../../../../../third_party/firebug/firebug-1.5.0-fx.xpi', __dir__)
          profile.add_extension(firebug)
          extension_directory = File.expand_path('extensions/firebug@software.joehewitt.com', profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to be(true)
        end

        it 'can install web extension without id' do
          mooltipass = File.expand_path('../../../../../../third_party/firebug/mooltipass-1.1.87.xpi', __dir__)
          profile.add_extension(mooltipass)
          extension_directory = File.expand_path('extensions/MooltipassExtension@1.1.87', profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to be(true)
        end

        it 'can install web extension with id' do
          ext = File.expand_path('../../../../../../third_party/firebug/favourite_colour-1.1-an+fx.xpi', __dir__)
          profile.add_extension(ext)
          extension_directory = File.expand_path('extensions/favourite-colour-examples@mozilla.org',
                                                 profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to be(true)
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
