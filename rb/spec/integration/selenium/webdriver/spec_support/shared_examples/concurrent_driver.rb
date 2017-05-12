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

shared_examples_for 'driver that can be started concurrently' do |browser_name|
  it 'is started sequentially' do
    caps_opt = {}
    if browser_name == :ff_esr
      caps_opt[:firefox_binary] = ENV['FF_ESR_BINARY']
      caps_opt[:marionette] = false
      browser_name = :firefox
    end

    expect do
      # start 5 drivers concurrently
      threads = []
      drivers = []

      5.times do
        threads << Thread.new do
          drivers << GlobalTestEnv.send(:create_driver)
        end
      end

      threads.each do |thread|
        thread.abort_on_exception = true
        thread.join
      end

      drivers.each do |driver|
        driver.title # make any wire call
        driver.quit
      end
    end.not_to raise_error
  end
end
