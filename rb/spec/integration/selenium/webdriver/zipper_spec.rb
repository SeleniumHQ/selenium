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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Zipper do
      let(:base_file_name) { 'file.txt' }
      let(:file_content)   { 'content' }
      let(:zip_file)       { File.join(Dir.tmpdir, 'test.zip') }
      let(:dir_to_zip)     { Dir.mktmpdir('webdriver-spec-zipper') }

      def create_file
        filename = File.join(dir_to_zip, base_file_name)
        File.open(filename, 'w') { |io| io << file_content }

        filename
      end

      after do
        FileUtils.rm_rf zip_file
      end

      context 'can zip' do
        it 'a file' do
          File.open(zip_file, 'wb') do |io|
            io << Base64.decode64(Zipper.zip_file(create_file))
          end

          expect(File).to exist(zip_file)
        end

        it 'a folder' do
          create_file

          File.open(zip_file, 'wb') do |io|
            io << Base64.decode64(Zipper.zip(dir_to_zip))
          end

          expect(File).to exist(zip_file)
        end

        it 'follows symlinks' do
          filename = create_file
          File.symlink(filename, File.join(dir_to_zip, 'link'))

          zip_file = File.join(Dir.tmpdir, 'test.zip')
          File.open(zip_file, 'wb') do |io|
            io << Base64.decode64(Zipper.zip(dir_to_zip))
          end

          unzipped = Zipper.unzip(zip_file)
          expect(File.read(File.join(unzipped, 'link'))).to eq(file_content)
        end
      end

      context 'can unzip' do
        it 'a file' do
          File.open(zip_file, 'wb') do |io|
            io << Base64.decode64(Zipper.zip_file(create_file))
          end

          unzipped = Zipper.unzip(zip_file)
          expect(File.read(File.join(unzipped, base_file_name))).to eq(file_content)
        end

        it 'a folder' do
          create_file

          File.open(zip_file, 'wb') do |io|
            io << Base64.decode64(Zipper.zip(dir_to_zip))
          end

          unzipped = Zipper.unzip(zip_file)
          expect(File.read(File.join(unzipped, base_file_name))).to eq(file_content)
        end
      end
    end # Zipper
  end # WebDriver
end # Selenium
