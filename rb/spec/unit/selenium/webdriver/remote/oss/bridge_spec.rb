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

require File.expand_path('../../../spec_helper', __FILE__)

module Selenium
  module WebDriver
    module Remote
      module OSS
        describe Bridge do
          subject(:bridge) { Bridge.new({}, '11123') }

          it 'raises ArgumentError if passed invalid options' do
            expect { Bridge.new(foo: 'bar') }.to raise_error(ArgumentError)
          end

          it 'raises WebDriverError if uploading non-files' do
            expect { bridge.upload('NotAFile') }.to raise_error(Error::WebDriverError)
          end

          it 'respects quit_errors' do
            allow(bridge).to receive(:execute).with(:quit).and_raise(IOError)
            expect { bridge.quit }.to_not raise_error
          end

          context 'when using a deprecated method' do
            it 'warns that #mouse is deprecated' do
              expect(WebDriver.logger).to receive(:deprecate).with('Driver#mouse', "driver.action.<command>.perform")
              bridge.mouse
            end

            it 'warns that #keyboard is deprecated' do
              expect(WebDriver.logger).to receive(:deprecate).with('Driver#keyboard', "driver.action.<command>.perform")
              bridge.keyboard
            end
          end
        end
      end # OSS
    end # Remote
  end # WebDriver
end # Selenium
