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

require 'base64'
require 'securerandom'
require 'webrick'
require 'webrick/https'
require_relative '../spec_helper'

module Selenium
  module WebDriver
    module Firefox
      describe Profile, skip_unless: [{bidi: false, reason: 'Not yet implemented with BiDi'}, {browser: :firefox}] do
        let(:profile) { described_class.new }

        before do
          profile['browser.startup.homepage'] = url_for('simpleTest.html')
          profile['browser.startup.page'] = 1
        end

        it 'instantiates the browser with the correct profile' do
          reset_driver!(profile: profile) do |driver|
            expect { wait(5).until { driver.find_element(id: 'oneline') } }.not_to raise_error
          end
        end

        it 'is able to use the same profile more than once',
           skip_if: {driver: :remote, rbe: true, reason: 'Cannot start 2+ drivers at once.'} do
          reset_driver!(profile: profile) do |driver1|
            expect { wait(5).until { driver1.find_element(id: 'oneline') } }.not_to raise_error
            reset_driver!(profile: profile) do |driver2|
              expect { wait(5).until { driver2.find_element(id: 'oneline') } }.not_to raise_error
            end
          end
        end

        it 'ships preferences from an existing profile directory' do
          reset_driver!(profile: described_class.new(profile.layout_on_disk)) do |driver|
            expect { wait(5).until { driver.find_element(id: 'oneline') } }.not_to raise_error
          end
        end

        it 'accepts a large base64-encoded profile' do
          Dir.mktmpdir('webdriver-large-profile') do |directory|
            File.binwrite(File.join(directory, 'ballast.bin'), SecureRandom.random_bytes(20 * 1024 * 1024))
            large = described_class.new(directory)
            large['browser.startup.homepage'] = url_for('simpleTest.html')
            large['browser.startup.page'] = 1

            reset_driver!(profile: large) do |driver|
              expect { wait(10).until { driver.find_element(id: 'oneline') } }.not_to raise_error
            end
          end
        end

        context 'with a self-signed TLS certificate' do
          before { @https_server = start_https_server }
          after { @https_server&.fetch(:server)&.shutdown }

          it 'reuses a stored certificate exception' do
            Dir.mktmpdir('webdriver-cert-profile') do |directory|
              write_cert_override(directory, @https_server[:certificate])

              reset_driver!(profile: described_class.new(directory), accept_insecure_certs: false) do |driver|
                driver.navigate.to secure_url
                expect(driver.find_element(id: 'secure-content').text).to eq('secure')
              end
            end
          end
        end

        def secure_url
          "https://#{Platform.localhost}:#{@https_server[:port]}/"
        end

        # A permanent certificate override in Firefox's cert_override.txt format: the db-key is
        # base64 of <0><0><serialLen><issuerLen><serial><issuer>.
        def write_cert_override(directory, certificate)
          serial = certificate.serial.to_s(2)
          issuer = certificate.issuer.to_der
          db_key = Base64.strict_encode64([0, 0, serial.bytesize, issuer.bytesize].pack('N4') + serial + issuer)
          fingerprint = OpenSSL::Digest::SHA256.hexdigest(certificate.to_der).upcase.scan(/../).join(':')
          line = ["#{Platform.localhost}:#{@https_server[:port]}", 'OID.2.16.840.1.101.3.4.2.1',
                  fingerprint, 'MUT', db_key].join("\t")
          File.write(File.join(directory, 'cert_override.txt'), "#{line}\n")
        end

        def start_https_server
          certificate, key = self_signed_certificate
          port = free_port
          server = WEBrick::HTTPServer.new(
            BindAddress: Platform.localhost,
            Port: port,
            SSLEnable: true,
            SSLCertificate: certificate,
            SSLPrivateKey: key,
            Logger: WEBrick::Log.new(File::NULL),
            AccessLog: []
          )
          server.mount_proc('/') do |_req, res|
            res['Content-Type'] = 'text/html'
            res.body = '<html><body><div id="secure-content">secure</div></body></html>'
          end
          Thread.new { server.start }
          {server: server, port: port, certificate: certificate}
        end

        def self_signed_certificate
          key = OpenSSL::PKey::RSA.new(2048)
          name = OpenSSL::X509::Name.parse("/CN=#{Platform.localhost}")
          certificate = OpenSSL::X509::Certificate.new
          certificate.version = 2
          certificate.serial = 1
          certificate.subject = name
          certificate.issuer = name
          certificate.public_key = key.public_key
          certificate.not_before = Time.now - 3600
          certificate.not_after = Time.now + 3600
          factory = OpenSSL::X509::ExtensionFactory.new
          factory.subject_certificate = certificate
          factory.issuer_certificate = certificate
          certificate.add_extension(factory.create_extension('subjectAltName', 'DNS:localhost,IP:127.0.0.1'))
          certificate.sign(key, OpenSSL::Digest.new('SHA256'))
          [certificate, key]
        end

        def free_port
          server = TCPServer.new(Platform.localhost, 0)
          port = server.addr[1]
          server.close
          port
        end
      end
    end # Firefox
  end # WebDriver
end # Selenium
