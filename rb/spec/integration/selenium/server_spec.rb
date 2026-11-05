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

require 'rspec'
require 'selenium-webdriver'
require 'selenium/server'
require_relative 'webdriver/spec_support/test_environment'

module Selenium
  describe Server do
    let!(:environment) { WebDriver::SpecSupport::TestEnvironment.new }

    before(:all) { ENV['SE_CACHE_PATH'] = Dir.mktmpdir('selenium-server') }

    after(:all) { FileUtils.rm_rf(ENV.delete('SE_CACHE_PATH')) }

    after do
      File.delete(@location) if @location && File.exist?(@location)
    end

    it 'downloads latest version' do
      @location = described_class.download

      expect(File.exist?(@location)).to be true
      expect(@location).to match(/\Aselenium-server-\d+\.\d+\.\d+\.jar\z/)
    end

    it 'reports the latest version' do
      version = described_class.latest
      @location = "selenium-server-#{version}.jar"

      expect(version).to match(/\A\d+\.\d+\.\d+\z/)
      expect(File.exist?(@location)).to be true
    end

    it 'downloads specified version' do
      @location = described_class.download('4.9.0')

      expect(File.exist?(@location)).to be true
      expect(@location).to eq('selenium-server-4.9.0.jar')
      expect(Dir.exist?(File.join(ENV.fetch('SE_CACHE_PATH'), 'grid', '4.9.0'))).to be true
    end

    it 'raises Selenium::Server::Error for a version that does not exist' do
      Dir.mktmpdir('selenium-server-empty') do |empty_cache|
        cache = ENV.fetch('SE_CACHE_PATH')
        ENV['SE_CACHE_PATH'] = empty_cache

        expect { described_class.download('99.99.99') }.to raise_error(described_class::Error, /99\.99\.99/)
      ensure
        ENV['SE_CACHE_PATH'] = cache
      end
    end

    it 'starts and stops server' do
      @location = described_class.download
      chrome_slot = ['--driver-configuration', 'display-name=chrome', 'stereotype={"browserName":"chrome"}']
      args = ['--detect-drivers', 'false', *chrome_slot]
      @server = described_class.new(@location, background: true, java: environment.bazel_java, args: args)
      @server.start
      status = server_status("http://#{@server.host}:#{@server.port}")
      expect(status.code).to eq 200

      @server.stop
      expect {
        server_status("http://#{@server.host}:#{@server.port}")
      }.to raise_error(Errno::ECONNREFUSED)
    ensure
      @server&.stop
    end

    def server_status(url)
      client = WebDriver::Remote::Http::Default.new
      client.server_url = URI.parse(url)
      client.send(:request, :get, URI.parse("#{url}/status"), {}, nil)
    end
  end
end
