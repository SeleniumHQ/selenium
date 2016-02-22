# encoding: utf-8
#
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

require File.expand_path("../../webdriver/spec_helper", __FILE__)
require 'selenium/rake/server_task'

describe Selenium::Rake::ServerTask do
  let(:mock_server) { double(Selenium::Server).as_null_object }

  it "raises an error if no jar file is specified" do
    expect {
      Selenium::Rake::ServerTask.new
    }.to raise_error(Selenium::Rake::MissingJarFileError)
  end

  it "launches the server with default options" do
    expected_opts = {
      :port       => 4444,
      :timeout    => 30,
      :background => true,
      :log        => true,
    }

    expect(Selenium::Server).to receive(:new).
                     with("selenium-server.jar", expected_opts).
                     and_return(mock_server)

    task = Selenium::Rake::ServerTask.new { |t| t.jar = "selenium-server.jar" }

    expect(task.port).to eq(4444)
    expect(task.timeout).to eq(30)
    expect(task.background).to be true
    expect(task.log).to be true
    expect(task.opts).to eq([])
  end

  it "lets the user override the default options" do
    expected_opts = {
      :port       => 5555,
      :timeout    => 120,
      :background => false,
      :log        => false,
    }

    expect(Selenium::Server).to receive(:new).
                     with("selenium-server.jar", expected_opts).
                     and_return(mock_server)

    task = Selenium::Rake::ServerTask.new { |t|
      t.jar        = "selenium-server.jar"
      t.port       = 5555
      t.timeout    = 120
      t.background = false
      t.log        = false

      t.opts << "-some" << "args"
    }

    expect(task.port).to eq(5555)
    expect(task.timeout).to eq(120)
    expect(task.background).to be false
    expect(task.log).to be false
    expect(task.opts).to eq(["-some", "args"])
  end

  it "lets the user specify a version to use which it will automatically download" do
    required_version = '10.2.0'
    jar_file = "selenium-server-standalone-#{required_version}.jar"

    expect(Selenium::Server).to receive(:new).
                     with(jar_file, anything()).
                     and_return(mock_server)

    expect(Selenium::Server).to receive(:download).
                     with(required_version).
                     and_return(jar_file)

    Selenium::Rake::ServerTask.new { |t| t.version = required_version }
  end


end
