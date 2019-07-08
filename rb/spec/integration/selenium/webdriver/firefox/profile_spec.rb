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
        let(:profile) { Profile.new }

        def read_generated_prefs(from = nil)
          prof = from || profile
          dir = prof.layout_on_disk

          File.read(File.join(dir, 'user.js'))
        end

        it 'should set additional preferences' do
          profile['foo.number'] = 123
          profile['foo.boolean'] = true
          profile['foo.string'] = 'bar'

          string = read_generated_prefs
          expect(string).to include('user_pref("foo.number", 123)')
          expect(string).to include('user_pref("foo.boolean", true)')
          expect(string).to include(%{user_pref("foo.string", "bar")})
        end

        it 'should be serializable to JSON' do
          profile['foo.boolean'] = true

          new_profile = Profile.from_json(profile.to_json)
          string = read_generated_prefs(new_profile)
          expect(string).to include('user_pref("foo.boolean", true)')
        end

        it 'should not let user override defaults' do
          profile['app.update.enabled'] = true

          string = read_generated_prefs
          expect(string).to include('user_pref("app.update.enabled", false)')
        end

        it 'should properly handle escaped characters' do
          profile['foo'] = 'C:\\r\\n'

          string = read_generated_prefs
          expect(string).to include('user_pref("foo", "C:\\\\r\\\\n");')
        end

        it 'should let the user override some specific prefs' do
          profile['browser.startup.page'] = 'http://example.com'

          string = read_generated_prefs
          expect(string).to include(%{user_pref("browser.startup.page", "http://example.com")})
        end

        it 'should raise an error if the value given is not a string, number or boolean' do
          expect { profile['foo.bar'] = [] }.to raise_error(TypeError)
        end

        it 'should raise an error if the value is already stringified' do
          expect { profile['foo.bar'] = '"stringified"' }.to raise_error(ArgumentError)
        end

        it 'should enable secure SSL' do
          profile.secure_ssl = true

          string = read_generated_prefs
          expect(string).to include('user_pref("webdriver_accept_untrusted_certs", false)')
        end

        it 'should disable secure SSL' do
          profile.secure_ssl = false

          string = read_generated_prefs
          expect(string).to include('user_pref("webdriver_accept_untrusted_certs", true)')
        end

        it 'should change the setting for untrusted certificate issuer' do
          profile.assume_untrusted_certificate_issuer = false

          string = read_generated_prefs
          expect(string).to include('user_pref("webdriver_assume_untrusted_issuer", false)')
        end

        it 'can configure a manual proxy' do
          proxy = Proxy.new(
            http: 'foo:123',
            ftp: 'bar:234',
            ssl: 'baz:345',
            no_proxy: 'localhost'
          )

          profile.proxy = proxy
          string = read_generated_prefs

          expect(string).to include('user_pref("network.proxy.http", "foo")')
          expect(string).to include('user_pref("network.proxy.http_port", 123)')

          expect(string).to include('user_pref("network.proxy.ftp", "bar")')
          expect(string).to include('user_pref("network.proxy.ftp_port", 234)')

          expect(string).to include('user_pref("network.proxy.ssl", "baz")')
          expect(string).to include('user_pref("network.proxy.ssl_port", 345)')

          expect(string).to include('user_pref("network.proxy.no_proxies_on", "localhost")')
          expect(string).to include('user_pref("network.proxy.type", 1)')
        end

        it 'can configure a PAC proxy' do
          profile.proxy = Proxy.new(pac: 'http://foo/bar.pac')
          string = read_generated_prefs

          expect(string).to include('user_pref("network.proxy.autoconfig_url", "http://foo/bar.pac")')
          expect(string).to include('user_pref("network.proxy.type", 2)')
        end

        it 'can configure an auto-detected proxy' do
          profile.proxy = Proxy.new(auto_detect: true)
          string = read_generated_prefs

          expect(string).to include('user_pref("network.proxy.type", 4)')
        end

        it 'can install extension' do
          firebug = File.expand_path('../../../../../../third_party/firebug/firebug-1.5.0-fx.xpi', __dir__)
          profile.add_extension(firebug)
          extension_directory = File.expand_path('extensions/firebug@software.joehewitt.com', profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to eq(true)
        end

        it 'can install web extension without id' do
          mooltipass = File.expand_path('../../../../../../third_party/firebug/mooltipass-1.1.87.xpi', __dir__)
          profile.add_extension(mooltipass)
          extension_directory = File.expand_path('extensions/MooltipassExtension@1.1.87', profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to eq(true)
        end

        it 'can install web extension with id' do
          ext = File.expand_path('../../../../../../third_party/firebug/favourite_colour-1.1-an+fx.xpi', __dir__)
          profile.add_extension(ext)
          extension_directory = File.expand_path('extensions/favourite-colour-examples@mozilla.org', profile.layout_on_disk)
          expect(Dir.exist?(extension_directory)).to eq(true)
        end

        describe 'with browser' do
          before do
            quit_driver
            sleep 2
            profile['browser.startup.homepage'] = url_for('simpleTest.html')
            profile['browser.startup.page'] = 1
          end

          it 'should instantiate the browser with the correct profile' do
            create_driver!(options: Options.new(profile: profile)) do |driver|
              expect { wait(5).until { driver.find_element(id: 'oneline') } }.not_to raise_error
            end
          end

          it 'should be able to use the same profile more than once' do
            create_driver!(options: Options.new(profile: profile)) do |driver1|
              expect { wait(5).until { driver1.find_element(id: 'oneline') } }.not_to raise_error
              create_driver!(options: Options.new(profile: profile)) do |driver2|
                expect { wait(5).until { driver2.find_element(id: 'oneline') } }.not_to raise_error
              end
            end
          end
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
