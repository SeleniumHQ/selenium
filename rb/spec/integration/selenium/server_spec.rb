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

require_relative 'webdriver/spec_helper'
require 'selenium/server'

module Selenium
  describe Server do
    after do
      File.delete(@location) if @location && File.exist?(@location)
    end

    it 'downloads latest version' do
      @location = described_class.download

      expect(File.exist?(@location)).to be true
      expect(@location).to eq("selenium-server-#{current_version}.jar")
    end

    it 'downloads specified version' do
      @location = described_class.download('4.9.0')

      expect(File.exist?(@location)).to be true
      expect(@location).to eq('selenium-server-4.9.0.jar')
    end

    it 'starts and stops server' do
      @location = described_class.download
      @server = described_class.new(@location, background: true)
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

    # Ruby Selenium is tagged one version ahead of release to support nightly gem
    def current_version
      selenium_version = Gem::Version.new(Selenium::WebDriver::VERSION).segments
      selenium_version[1] = selenium_version[1] - 1
      selenium_version.join('.')
    end
  end
end
