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

require File.expand_path('../spec_helper', __dir__)

module Selenium
  module WebDriver
    describe ChildProcess do
      unless Selenium::WebDriver::Platform.windows?
        it 'does not raise an error when terminating a non-existent process' do
          process = described_class.new('sleep', '5')
          process.start

          pid = process.instance_variable_get(:@pid)
          Process.kill('KILL', pid)
          Process.wait(pid)

          expect {
            process.send(:terminate, pid)
          }.not_to raise_error
        end

        it 'does not raise an error when killing a non-existent process' do
          process = described_class.new('sleep', '5')
          process.start

          pid = process.instance_variable_get(:@pid)
          Process.kill('KILL', pid)
          Process.wait(pid)

          expect {
            process.send(:kill, pid)
          }.not_to raise_error
        end
      end

      it 'spawns process with environment variables' do
        process = described_class.new('ruby', '-e', 'puts ENV["SELENIUM_TEST_VAR"]')
        process.env = {'SELENIUM_TEST_VAR' => 'test_value'}

        temp_file = Tempfile.new('selenium_test')
        process.io = temp_file.path

        process.start
        process.wait

        temp_file.close
        output = File.read(temp_file.path).strip
        expect(output).to eq('test_value')
      ensure
        temp_file.unlink
      end
    end
  end
end
