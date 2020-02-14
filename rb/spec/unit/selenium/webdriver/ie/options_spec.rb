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
    module IE
      describe Options do
        subject(:options) { Options.new }

        describe '#initialize' do
          it 'accepts all defined parameters' do
            allow(File).to receive(:directory?).and_return(true)

            opts = Options.new(args: %w[foo bar],
                               browser_attach_timeout: 30000,
                               element_scroll_behavior: Options::SCROLL_BOTTOM,
                               full_page_screenshot: true,
                               ensure_clean_session: true,
                               file_upload_dialog_timeout: 30000,
                               force_create_process_api: true,
                               force_shell_windows_api: true,
                               ignore_protected_mode_settings: true,
                               ignore_zoom_level: true,
                               initial_browser_url: 'http://google.com',
                               native_events: false,
                               persistent_hover: true,
                               require_window_focus: true,
                               use_per_process_proxy: true,
                               validate_cookie_document_type: true)

            expect(opts.args.to_a).to eq(%w[foo bar])
            expect(opts.browser_attach_timeout).to eq(30000)
            expect(opts.element_scroll_behavior).to eq(1)
            expect(opts.full_page_screenshot).to eq(true)
            expect(opts.ensure_clean_session).to eq(true)
            expect(opts.file_upload_dialog_timeout).to eq(30000)
            expect(opts.force_create_process_api).to eq(true)
            expect(opts.force_shell_windows_api).to eq(true)
            expect(opts.ignore_protected_mode_settings).to eq(true)
            expect(opts.ignore_zoom_level).to eq(true)
            expect(opts.initial_browser_url).to eq('http://google.com')
            expect(opts.native_events).to eq(false)
            expect(opts.persistent_hover).to eq(true)
            expect(opts.require_window_focus).to eq(true)
            expect(opts.use_per_process_proxy).to eq(true)
            expect(opts.validate_cookie_document_type).to eq(true)
          end

          it 'has native events on by default' do
            expect(options.native_events).to eq(true)
          end
        end

        describe '#add_argument' do
          it 'adds a command-line argument' do
            options.add_argument('foo')
            expect(options.args.to_a).to eq(['foo'])
          end
        end

        describe '#add_option' do
          it 'adds an option' do
            options.add_option(:foo, 'bar')
            expect(options.options[:foo]).to eq('bar')
          end
        end

        describe '#as_json' do
          it 'returns empty options by default' do
            expect(options.as_json).to eq("se:ieOptions" => {"nativeEvents" => true})
          end

          it 'returns added option' do
            options.add_option(:foo, 'bar')
            expect(options.as_json).to eq("se:ieOptions" => {"nativeEvents" => true, "foo" => "bar"})
          end

          it 'returns a JSON hash' do
            opts = Options.new(args: %w[foo bar],
                               browser_attach_timeout: 30000,
                               element_scroll_behavior: Options::SCROLL_BOTTOM,
                               full_page_screenshot: true,
                               ensure_clean_session: true,
                               file_upload_dialog_timeout: 30000,
                               force_create_process_api: true,
                               force_shell_windows_api: true,
                               ignore_protected_mode_settings: true,
                               ignore_zoom_level: true,
                               initial_browser_url: 'http://google.com',
                               native_events: false,
                               persistent_hover: true,
                               require_window_focus: true,
                               use_per_process_proxy: true,
                               validate_cookie_document_type: true)
            opts.add_option(:foo, 'bar')

            key = 'se:ieOptions'
            expect(opts.as_json).to eq(key => {'ie.browserCommandLineSwitches' => 'foo bar',
                                               'browserAttachTimeout' => 30000,
                                               'elementScrollBehavior' => 1,
                                               'ie.enableFullPageScreenshot' => true,
                                               'ie.ensureCleanSession' => true,
                                               'ie.fileUploadDialogTimeout' => 30000,
                                               'ie.forceCreateProcessApi' => true,
                                               'ie.forceShellWindowsApi' => true,
                                               'ignoreProtectedModeSettings' => true,
                                               'ignoreZoomSetting' => true,
                                               'initialBrowserUrl' => 'http://google.com',
                                               'nativeEvents' => false,
                                               'enablePersistentHover' => true,
                                               'requireWindowFocus' => true,
                                               'ie.usePerProcessProxy' => true,
                                               'ie.validateCookieDocumentType' => true,
                                               'foo' => 'bar'})
          end
        end
      end # Options
    end # IE
  end # WebDriver
end # Selenium
