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

require File.expand_path('../../spec_helper', __dir__)

module Selenium
  module WebDriver
    module Remote
      module Http
        describe Default do
          let(:client) do
            client = described_class.new
            client.server_url = URI.parse('http://example.com')

            client
          end

          it 'assigns default timeouts' do
            http = client.send :http

            expect(http.open_timeout).to eq 60
            expect(http.read_timeout).to eq 120
          end

          describe '#initialize' do
            let(:client) do
              described_class.new(client_config: ClientConfig.new(read_timeout: 22, open_timeout: 23))
            end

            it 'accepts read timeout options' do
              expect(client.open_timeout).to eq 23
            end

            it 'accepts open timeout options' do
              expect(client.read_timeout).to eq 22
            end

            it 'still accepts open_timeout/read_timeout directly' do
              client = described_class.new(open_timeout: 23, read_timeout: 22)
              expect(client.open_timeout).to eq 23
              expect(client.read_timeout).to eq 22
            end

            it 'errors when given both a client_config and timeout options' do
              expect {
                described_class.new(client_config: ClientConfig.new, open_timeout: 23)
              }.to raise_error(ArgumentError, /Cannot use both/)
            end
          end

          describe 'with a client_config' do
            it 'configures the client from the config' do
              proxy = Proxy.new(http: 'http://proxy.example:8080')
              config = ClientConfig.new(
                open_timeout: 15,
                read_timeout: 25,
                max_redirects: 5,
                proxy: proxy,
                extra_headers: {'X-Custom-Header' => 'custom_value'},
                user_agent: 'Custom User Agent'
              )
              client = described_class.new(client_config: config)

              expect(client.open_timeout).to eq(15)
              expect(client.read_timeout).to eq(25)
              expect(client.client_config.max_redirects).to eq(5)
              expect(client.client_config.proxy).to eq(proxy)
              expect(client.client_config.extra_headers).to eq('X-Custom-Header' => 'custom_value')
              expect(client.client_config.user_agent).to eq('Custom User Agent')
            end

            it 'does not leak config headers onto the global Http::Common' do
              config = ClientConfig.new(
                extra_headers: {'X-Custom-Header' => 'custom_value'},
                user_agent: 'Custom User Agent'
              )
              described_class.new(client_config: config)

              expect(Common.extra_headers).to be_nil
              expect(Common.user_agent).to eq("selenium/#{WebDriver::VERSION} (ruby #{Platform.os})")
            end
          end

          describe 'with a self-signed certificate' do
            around do |example|
              WebMock.disable!
              with_self_signed_server do |url|
                client.server_url = URI.parse(url)
                example.run
              end
            ensure
              WebMock.enable!
            end

            it 'falls back to an unverified connection with a deprecation by default' do
              http = nil
              expect { http = client.send(:http) }
                .to have_deprecated(:ignore_certificates, /self-signed certificate/)

              expect(http.verify_mode).to eq(OpenSSL::SSL::VERIFY_NONE)
              expect(http).to be_started
            end

            it 'rejects the certificate when the config requires verification' do
              client.client_config.ignore_certificates = false

              expect { client.send :http }.to raise_error(OpenSSL::SSL::SSLError, /ignore_certificates/)
            end

            it 'connects without a deprecation when the config ignores certificates' do
              client.client_config.ignore_certificates = true

              expect { client.send :http }.not_to have_deprecated(:ignore_certificates)
              expect(client.send(:http)).to be_started
            end

            def with_self_signed_server
              server = OpenSSL::SSL::SSLServer.new(TCPServer.new('127.0.0.1', 0), self_signed_context)
              acceptor = Thread.new do
                loop do
                  server.accept.close
                rescue OpenSSL::SSL::SSLError, SystemCallError
                  next
                end
              end

              yield "https://127.0.0.1:#{server.addr[1]}"
            ensure
              acceptor&.kill
              server&.close
            end

            def self_signed_context
              key = OpenSSL::PKey::EC.generate('prime256v1')
              cert = OpenSSL::X509::Certificate.new
              cert.subject = cert.issuer = OpenSSL::X509::Name.parse('/CN=localhost')
              cert.public_key = key
              cert.not_before = Time.now - 60
              cert.not_after = Time.now + 60
              cert.sign(key, OpenSSL::Digest.new('SHA256'))

              OpenSSL::SSL::SSLContext.new.tap do |context|
                context.cert = cert
                context.key = key
              end
            end
          end

          it 'uses the specified proxy' do
            client.proxy = Proxy.new(http: 'http://foo:bar@proxy.org:8080')
            http = client.send :http

            expect(http).to be_proxy
            expect(http.proxy_address).to eq('proxy.org')
            expect(http.proxy_port).to eq(8080)
            expect(http.proxy_user).to eq('foo')
            expect(http.proxy_pass).to eq('bar')

            expect(http.address).to eq('example.com')
          end

          it 'raises an error if the proxy is not an HTTP proxy' do
            client.proxy = Proxy.new(ssl: 'ssl://example.com')
            expect { client.send :http }.to raise_error(Error::WebDriverError)
          end

          %w[http_proxy HTTP_PROXY].each do |proxy_var|
            it "honors the #{proxy_var} environment variable" do
              with_env(proxy_var => 'http://proxy.org:8080') do
                http = client.send :http

                expect(http).to be_proxy
                expect(http.proxy_address).to eq('proxy.org')
                expect(http.proxy_port).to eq(8080)
              end
            end

            it "handles #{proxy_var} without http://" do
              with_env(proxy_var => 'proxy.org:8080') do
                http = client.send :http

                expect(http).to be_proxy
                expect(http.proxy_address).to eq('proxy.org')
                expect(http.proxy_port).to eq(8080)
              end
            end
          end

          %w[no_proxy NO_PROXY].each do |no_proxy_var|
            it "honors the #{no_proxy_var} environment variable when matching" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => 'example.com') do
                http = client.send :http
                expect(http).not_to be_proxy
              end
            end

            it "ignores the #{no_proxy_var} environment variable when not matching" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => 'foo.com') do
                http = client.send :http

                expect(http).to be_proxy
                expect(http.proxy_address).to eq('proxy.org')
                expect(http.proxy_port).to eq(8080)
              end
            end

            it "understands a comma separated list of domains in #{no_proxy_var}" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => 'example.com,foo.com') do
                http = client.send :http
                expect(http).not_to be_proxy
              end
            end

            it "understands subnetting in #{no_proxy_var}" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => 'localhost,127.0.0.0/8') do
                client.server_url = URI.parse('http://127.0.0.1:4444/wd/hub')

                http = client.send :http
                expect(http).not_to be_proxy
              end
            end

            it "trims whitespace around entries in #{no_proxy_var}" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => 'localhost, example.com') do
                http = client.send :http
                expect(http).not_to be_proxy
              end
            end

            it "trims leading whitespace on a single entry in #{no_proxy_var}" do
              with_env('http_proxy' => 'proxy.org:8080', no_proxy_var => ' example.com') do
                http = client.send :http
                expect(http).not_to be_proxy
              end
            end
          end

          it 'raises a sane error if a proxy is refusing connections' do
            with_env('http_proxy' => 'http://localhost:1234') do
              http = client.send :http
              allow(http).to receive(:request).and_raise Errno::ECONNREFUSED.new('Connection refused')

              expect {
                client.call :post, 'http://example.com/foo/bar', {}
              }.to raise_error(Errno::ECONNREFUSED, %r{using proxy: http://localhost:1234})
            end
          end

          it 'stops following redirects after the configured max_redirects' do
            client = described_class.new(client_config: ClientConfig.new(max_redirects: 2))
            client.server_url = URI.parse('http://example.com')
            http = client.send :http

            redirect = Net::HTTPFound.new('1.1', '302', 'Found')
            redirect['Location'] = 'http://example.com/next'
            allow(http).to receive(:request).and_return(redirect)

            expect {
              client.call(:get, 'http://example.com/start', nil)
            }.to raise_error(Error::WebDriverError, /too many redirects/)
          end
        end
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
