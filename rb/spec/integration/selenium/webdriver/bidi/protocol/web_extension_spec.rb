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

require_relative '../../spec_helper'
require 'base64'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe WebExtension,
                 pending_if: {browser_family: :safari,
                              exception: {class: Error::UnknownCommandError},
                              reason: 'Safari driver currently returns unsupported for webExtension commands'},
                 skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          before { reset_driver!(args: chromium_web_extension_args) if GlobalTestEnv.browser_family == :chromium }

          after do |example|
            if GlobalTestEnv.browser_family == :chromium
              reset_driver!(example: example, args: chromium_web_extension_args)
            else
              reset_driver!(example: example)
            end
          end

          let(:web_extension) { described_class.new(driver) }
          let(:expected_id) { 'webextensions-selenium-example-v3@example.com' }

          def chromium_web_extension_args
            return [] unless GlobalTestEnv.browser_family == :chromium

            %w[--enable-unsafe-extension-debugging --remote-debugging-pipe]
          end

          def extension_path(name)
            File.expand_path("../../../../../../../common/extensions/#{name}", __dir__)
          end

          def archive_extension
            return 'webextensions-selenium-example.crx' if GlobalTestEnv.browser_family == :chromium

            'webextensions-selenium-example.xpi'
          end

          def expect_extension_injected
            driver.navigate.to url_for('blank.html')

            injected = driver.find_element(id: 'webextensions-selenium-example')
            expect(injected.text).to eq('Content injected by webextensions-selenium-example')
          end

          def install_and_assert(extension_data)
            result = web_extension.install(extension_data: extension_data)

            expect(result).to be_a(WebExtension::InstallResult)
            expect(result.extension).to be_a(String)
            expect(result.extension).not_to be_empty
            expect(result.extension).to eq(expected_id) if GlobalTestEnv.browser == :firefox
            expect_extension_injected

            result
          end

          describe '#install' do
            it 'installs an extension from a directory path' do
              result = install_and_assert(
                WebExtension::ExtensionPath.new(path: extension_path('webextensions-selenium-example-signed'))
              )

              web_extension.uninstall(extension: result.extension)
              driver.navigate.refresh
              expect(driver.find_elements(id: 'webextensions-selenium-example')).to be_empty
            end

            it 'installs an extension from an archive path',
               pending_if: {browser_family: :chromium,
                            exception: {class: Error::UnsupportedOperationError,
                                        message: /Archived and Base64 extensions are not supported/},
                            reason: 'Chromium driver currently returns unsupported for archivePath payloads'} do
              result = install_and_assert(
                WebExtension::ExtensionArchivePath.new(path: extension_path(archive_extension))
              )

              expect(result.extension).to be_a(String)
              web_extension.uninstall(extension: result.extension)
            end

            it 'installs an extension from base64 archive data',
               pending_if: {browser_family: :chromium,
                            exception: {class: Error::UnsupportedOperationError,
                                        message: /Archived and Base64 extensions are not supported/},
                            reason: 'Chromium driver currently returns unsupported for base64 payloads'} do
              encoded = Base64.strict_encode64(File.binread(extension_path(archive_extension)))
              result = install_and_assert(WebExtension::ExtensionBase64Encoded.new(value: encoded))

              expect(result.extension).to be_a(String)
              web_extension.uninstall(extension: result.extension)
            end
          end

          describe '#uninstall' do
            it 'uninstalls an installed extension' do
              result = web_extension.install(
                extension_data: WebExtension::ExtensionPath.new(
                  path: extension_path('webextensions-selenium-example-signed')
                )
              )

              expect(web_extension.uninstall(extension: result.extension)).to be_empty
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
