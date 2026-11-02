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

require File.expand_path('webdriver/spec_helper', __dir__)
require 'selenium/server'

module Selenium
  describe Server do
    let(:mock_process) { instance_double(WebDriver::ChildProcess).as_null_object }
    let(:port) { 4321 }
    let(:jar) { 'selenium_server_deploy.jar' }

    before { allow(File).to receive(:exist?).with(jar).and_return(true) }

    it 'raises an error if the jar file does not exist' do
      expect {
        described_class.new('doesnt-exist.jar')
      }.to raise_error(Errno::ENOENT)
    end

    describe '#start' do
      let(:status_url) { "http://127.0.0.1:#{port}/status" }

      before do
        allow(WebDriver::ChildProcess).to receive(:build).and_return(mock_process)
        allow(WebDriver::SocketPoller).to receive(:new)
          .and_return(instance_double(WebDriver::SocketPoller, connected?: true))
        stub_request(:get, status_url).to_return(body: {value: {ready: true}}.to_json)
      end

      it 'uses the given jar file and port' do
        described_class.new(jar, port: port).start

        expect(WebDriver::ChildProcess).to have_received(:build)
          .with('java', '-jar', jar, 'standalone', '--port', port.to_s)
      end

      it 'waits for the server process by default' do
        described_class.new(jar, port: port).start

        expect(mock_process).to have_received(:wait)
      end

      it 'does not wait for the server process when running in the background' do
        described_class.new(jar, port: port, background: true).start

        expect(mock_process).not_to have_received(:wait)
      end

      it 'adds additional args' do
        server = described_class.new(jar, port: port)
        server << %w[foo bar]
        server.start

        expect(WebDriver::ChildProcess).to have_received(:build)
          .with('java', '-jar', jar, 'standalone', '--port', port.to_s, 'foo', 'bar')
      end

      it 'adds additional JAVA options args' do
        server = described_class.new(jar, port: port)
        server << %w[foo bar]
        server << '-Dwebdriver.chrome.driver=/bin/chromedriver'
        server.start

        expect(WebDriver::ChildProcess).to have_received(:build)
          .with('java',
                '-Dwebdriver.chrome.driver=/bin/chromedriver',
                '-jar', jar,
                'standalone',
                '--port', port.to_s,
                'foo',
                'bar')
      end

      it 'polls until the server reports it is ready' do
        stub_request(:get, status_url)
          .to_return(body: {value: {ready: false}}.to_json)
          .then.to_return(body: {value: {ready: true}}.to_json)

        described_class.new(jar, port: port).start

        expect(a_request(:get, status_url)).to have_been_made.twice
      end

      it 'raises Selenium::Server::Error if the server is not launched within the timeout' do
        stub_request(:get, status_url).to_return(body: {value: {ready: false}}.to_json)

        expect {
          described_class.new(jar, port: port, timeout: 0).start
        }.to raise_error(Selenium::Server::Error)
      end
    end

    context 'with a jar in the Selenium Manager cache' do
      let(:cached_jar) { File.expand_path('cache/grid/10.0.1/selenium-server-10.0.1.jar') }

      around do |example|
        Dir.mktmpdir { |dir| Dir.chdir(dir) { example.run } }
      end

      before do
        FileUtils.mkdir_p(File.dirname(cached_jar))
        File.write(cached_jar, 'cached jar')
        allow(WebDriver::SeleniumManager).to receive(:binary_paths).and_return({'driver_path' => cached_jar})
      end

      describe '.download' do
        it 'asks Selenium Manager for the latest server by default' do
          expect(described_class.download).to eq('selenium-server-10.0.1.jar')

          expect(WebDriver::SeleniumManager).to have_received(:binary_paths).with('--grid')
        end

        it 'asks Selenium Manager for the latest server when given :latest' do
          expect(described_class.download(:latest)).to eq('selenium-server-10.0.1.jar')

          expect(WebDriver::SeleniumManager).to have_received(:binary_paths).with('--grid')
        end

        it 'asks Selenium Manager for the given version' do
          expect(described_class.download('10.0.1')).to eq('selenium-server-10.0.1.jar')

          expect(WebDriver::SeleniumManager).to have_received(:binary_paths).with('--grid', '10.0.1')
        end

        it 'copies the cached jar into the current directory' do
          described_class.download

          expect(File.read('selenium-server-10.0.1.jar')).to eq('cached jar')
          expect(File).to exist(cached_jar)
        end

        it 'does not ask Selenium Manager when the jar is already in the current directory' do
          File.write('selenium-server-10.0.1.jar', 'existing jar')

          expect(described_class.download('10.0.1')).to eq('selenium-server-10.0.1.jar')

          expect(WebDriver::SeleniumManager).not_to have_received(:binary_paths)
          expect(File.read('selenium-server-10.0.1.jar')).to eq('existing jar')
        end

        it 'raises Selenium::Server::Error when Selenium Manager fails' do
          allow(WebDriver::SeleniumManager).to receive(:binary_paths)
            .and_raise(WebDriver::Error::WebDriverError, 'Unsuccessful command executed')

          expect {
            described_class.download('99.99.99')
          }.to raise_error(described_class::Error, /Unsuccessful command executed/)
        end
      end

      describe '.latest' do
        it 'downloads the latest server and reports its version' do
          expect(described_class.latest).to eq('10.0.1')

          expect(File).to exist('selenium-server-10.0.1.jar')
        end
      end

      describe '.get' do
        it 'builds a server for the downloaded jar with the given options' do
          server = described_class.get('10.0.1', port: port)

          expect(server).to be_a(described_class)
          expect(server.port).to eq(port)
        end
      end
    end

    it 'sets options after instantiation' do
      server = described_class.new(jar, port: port)
      expect(server.port).to eq(port)
      expect(server.timeout).to eq(30)
      expect(server.background).to be false
      expect(server.log).to be_nil

      server.port = 1234
      server.timeout = 5
      server.background = true
      server.log = '/tmp/server.log'

      aggregate_failures do
        expect(server.port).to eq(1234)
        expect(server.timeout).to eq(5)
        expect(server.background).to be_truthy
        expect(server.log).to eq('/tmp/server.log')
      end
    end
  end
end # Selenium
