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
    describe ServiceManager do
      unless Platform.windows?
        let(:driver_dir) { Dir.mktmpdir }

        before { WebMock.disable! }

        after do
          WebMock.enable!
          FileUtils.rm_rf(driver_dir)
        end

        def manager_for(script, **)
          path = File.join(driver_dir, 'fake_driver')
          File.write(path, "#!/bin/sh\n#{script}\n")
          File.chmod(0o755, path)
          described_class.new(Service.chrome(path: path, **))
        end

        it 'reports the exit status when the driver exits before accepting connections' do
          manager = manager_for('exit 3')

          expect { manager.start }.to raise_error(Error::WebDriverError, /process exited \(pid \d+ exit 3\)/)
        end

        it 'stops the driver when it does not accept connections in time' do
          stub_const('Selenium::WebDriver::ServiceManager::START_TIMEOUT', 1)
          manager = manager_for('exec sleep 30')

          expect { manager.start }.to raise_error(Error::WebDriverError, /ECONNREFUSED/)
          expect(manager.instance_variable_get(:@process)).not_to be_alive
        end

        it 'keeps polling when connecting to the driver fails with EADDRINUSE' do
          stub_const('Selenium::WebDriver::ServiceManager::START_TIMEOUT', 1)
          allow(Net::HTTP).to receive(:start).and_raise(Errno::EADDRINUSE)
          manager = manager_for('exec sleep 30')

          expect { manager.start }.to raise_error(Error::WebDriverError, /EADDRINUSE/)
          expect(Net::HTTP).to have_received(:start).at_least(2).times
        end

        context 'when the logger is at debug' do
          around do |example|
            logger = WebDriver.logger
            original_level = logger.level
            logger.level = :debug unless logger.debug?
            example.run
          ensure
            logger.level = original_level unless logger.level == original_level
          end

          it 'sends driver output to the logger' do
            manager = manager_for('exit 3')

            expect { manager.start }.to raise_error(Error::WebDriverError)
            expect(manager.instance_variable_get(:@process).io).to eq WebDriver.logger.io
          end

          it 'keeps a driver log set by the user' do
            File.open(File.join(driver_dir, 'driver.log'), 'w') do |log|
              manager = manager_for('exit 3', log: log)

              expect { manager.start }.to raise_error(Error::WebDriverError)
              expected = ENV.key?('SE_DEBUG') ? WebDriver.logger.io : log
              expect(manager.instance_variable_get(:@process).io).to eq expected
            end
          end
        end
      end
    end
  end
end
