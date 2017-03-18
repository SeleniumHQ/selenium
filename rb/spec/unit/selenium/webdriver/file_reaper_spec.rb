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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe FileReaper do
      before { FileReaper.reap = true }

      let(:tmp_file) do
        Pathname.new(Dir.tmpdir).join(SecureRandom.uuid).tap(&:mkpath)
      end

      it 'reaps files that have been added' do
        expect(tmp_file).to exist

        FileReaper << tmp_file.to_s
        expect(FileReaper.reap!).to be true

        expect(tmp_file).not_to exist
      end

      it 'fails if the file has not been added' do
        expect(tmp_file).to exist

        expect do
          FileReaper.reap(tmp_file.to_s)
        end.to raise_error(Error::WebDriverError)
      end

      it 'does not reap if reaping has been disabled' do
        expect(tmp_file).to exist

        FileReaper.reap = false
        FileReaper << tmp_file.to_s

        expect(FileReaper.reap!).to be false

        expect(tmp_file).to exist
      end

      unless Platform.jruby? || Platform.windows?
        it 'reaps files only for the current pid' do
          expect(tmp_file).to exist

          FileReaper << tmp_file.to_s

          pid = fork do
            FileReaper.reap!
            exit
            exit
          end
          Process.wait pid

          expect(tmp_file).to exist
        end
      end
    end
  end # WebDriver
end # Selenium
