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

shared_examples_for 'driver that can be started concurrently' do |guard|
  let(:drivers) { [] }
  let(:threads) { [] }

  before { quit_driver }

  after do
    drivers.each(&:quit)
    threads.select(&:alive?).each(&:kill)
    create_driver!
  end

  it 'starts multiple drivers sequentially', guard do
    expected_count = WebDriver::Platform.ci ? 2 : 4
    expected_count.times do
      thread = Thread.new do
        drivers << create_driver!
      end
      thread.report_on_exception = false
      threads << thread
    end

    expect { threads.each(&:join) }.not_to raise_error
    expect(drivers.count).to eq(expected_count)

    # make any wire call
    expect { drivers.each(&:title) }.not_to raise_error
  end
end
