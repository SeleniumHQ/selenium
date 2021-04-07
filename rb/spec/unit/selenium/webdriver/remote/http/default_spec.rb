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
            client = Default.new
            client.server_url = URI.parse('http://example.com')

            client
          end

          it 'assigns default timeout to nil' do
            http = client.send :http

            expect(http.open_timeout).to eq 60
            expect(http.read_timeout).to eq 60
          end

          describe '#initialize' do
            let(:client) { Default.new(read_timeout: 22, open_timeout: 23) }

            it 'accepts read timeout options' do
              expect(client.open_timeout).to eq 23
            end

            it 'accepts open timeout options' do
              expect(client.read_timeout).to eq 22
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
            client.proxy = Proxy.new(ftp: 'ftp://example.com')
            expect { client.send :http }.to raise_error(Error::WebDriverError)
          end

          %w[http_proxy HTTP_PROXY].each do |proxy_var|
            it "honors the #{proxy_var} environment varable" do
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
        end
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
