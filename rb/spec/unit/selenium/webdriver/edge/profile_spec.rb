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
    module Edge
      describe Profile do
        let(:profile) { described_class.new }
        let(:model) { '/some/path' }
        let(:model_profile) { described_class.new(model) }

        before do
          allow(File).to receive(:exist?).with(model).and_return true
          allow(File).to receive(:directory?).with(model).and_return true

          allow(Dir).to receive(:mktmpdir).and_return('/tmp/some/path')
          allow(FileUtils).to receive(:rm_rf)
          allow(FileUtils).to receive(:mkdir_p)
          allow(FileUtils).to receive(:cp_r)
        end

        it 'sets and get preference paths' do
          profile['foo.bar.baz'] = true
          expect(profile['foo.bar.baz']).to be(true)
        end

        it 'reads existing prefs' do
          allow(File).to receive(:read).with('/some/path/Default/Preferences')
                                       .and_return('{"autofill": {"enabled": false}}')

          expect(model_profile['autofill.enabled']).to be(false)
        end

        it 'writes out prefs' do
          allow(File).to receive(:read).with('/some/path/Default/Preferences')
                                       .and_return('{"autofill": {"enabled": false}}')

          model_profile['some.other.pref'] = 123

          mock_io = StringIO.new
          allow(FileUtils).to receive(:mkdir_p)
          allow(File).to receive(:open).with('/tmp/some/path/Default/Preferences', 'w').and_yield(mock_io)

          model_profile.layout_on_disk

          result = JSON.parse(mock_io.string)

          expect(result['autofill']['enabled']).to be(false)
          expect(result['some']['other']['pref']).to eq(123)
          expect(FileUtils).to have_received(:mkdir_p).with('/tmp/some/path/Default')
        end
      end
    end # Edge
  end # WebDriver
end # Selenium
