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
    module Support
      describe Select do
        let(:select) { described_class.new(driver.find_element(name: 'selectomatic')) }
        let(:multi_select) { described_class.new(driver.find_element(id: 'multi')) }
        let(:single_disabled) { described_class.new(driver.find_element(name: 'single_disabled')) }
        let(:multi_disabled) { described_class.new(driver.find_element(name: 'multi_disabled')) }

        before { driver.navigate.to url_for('formPage.html') }

        describe '#initialize' do
          it 'raises exception if not a select element' do
            expect { described_class.new(driver.find_element(id: 'checky')) }.to raise_exception(ArgumentError)
          end
        end

        describe '#multiple?' do
          it 'detects multiple' do
            select = described_class.new(driver.find_element(id: 'multi'))
            expect(select).to be_multiple
          end

          it 'detects not multiple' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))
            expect(select).not_to be_multiple
          end
        end

        describe '#options' do
          it 'lists all' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))
            options = select.options
            expect(options.size).to eq 4
            expect(options).to include(driver.find_element(id: 'non_multi_option'))
          end
        end

        describe '#selected_options' do
          it 'finds one' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))
            expect(select.selected_options).to eq([driver.find_element(id: 'non_multi_option')])
          end

          it 'finds two' do
            select = described_class.new(driver.find_element(id: 'multi'))
            expect(select.selected_options).to include(driver.find_element(css: 'option[value=eggs]'))
            expect(select.selected_options).to include(driver.find_element(css: 'option[value=sausages]'))
          end
        end

        describe '#first_selected_option' do
          it 'when multiple selected' do
            select = described_class.new(driver.find_element(id: 'multi'))
            expect(select.first_selected_option).to eq(driver.find_element(css: 'option[value=eggs]'))
          end
        end

        describe '#select_by' do
          it 'invalid how raises exception' do
            select = described_class.new(driver.find_element(id: 'multi'))
            expect { select.select_by(:invalid, 'foo') }.to raise_exception(ArgumentError)
          end

          context 'when multiple select' do
            context 'when by text' do
              it 'already selected stays selected' do
                multi_select.select_by(:text, 'Sausages')
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 2
                expect(selected_options).to include(driver.find_element(css: 'option[value=sausages]'))
              end

              it 'not already selected adds to selected' do
                multi_select.select_by(:text, 'Ham')
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 3
                expect(selected_options).to include(driver.find_element(css: 'option[value=ham]'))
              end

              it 'not already selected adds to selected when text multiple words' do
                multi_select.select_by(:text, 'Onion gravy')
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 3
                expect(selected_options).to include(driver.find_element(css: 'option[value="onion gravy"]'))
              end

              it 'errors when option disabled' do
                expect {
                  multi_disabled.select_by(:text, 'Disabled')
                }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { multi_select.select_by(:text, 'invalid') }.to raise_exception(Error::NoSuchElementError)
              end
            end

            context 'when by index' do
              it 'already selected stays selected' do
                multi_select.select_by(:index, 0)
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 2
                expect(selected_options).to include(driver.find_element(css: 'option[value=sausages]'))
              end

              it 'not already selected adds to selected' do
                multi_select.select_by(:index, 1)
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 3
                expect(selected_options).to include(driver.find_element(css: 'option[value=ham]'))
              end

              it 'errors when option disabled' do
                expect { multi_disabled.select_by(:index, 1) }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { multi_select.select_by(:index, 5) }.to raise_exception(Error::NoSuchElementError)
              end
            end

            context 'when by value' do
              it 'already selected stays selected' do
                multi_select.select_by(:value, 'sausages')
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 2
                expect(selected_options).to include(driver.find_element(css: 'option[value=sausages]'))
              end

              it 'not already selected adds to selected' do
                multi_select.select_by(:value, 'ham')
                selected_options = multi_select.selected_options

                expect(selected_options.size).to eq 3
                expect(selected_options).to include(driver.find_element(css: 'option[value=ham]'))
              end

              it 'errors when option disabled' do
                expect {
                  multi_disabled.select_by(:value, 'disabled')
                }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { multi_select.select_by(:value, 'invalid') }.to raise_exception(Error::NoSuchElementError)
              end
            end
          end

          context 'when single select' do
            context 'when by text' do
              it 'already selected stays selected' do
                select.select_by(:text, 'One')
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(id: 'non_multi_option')])
              end

              it 'not already selected changes selected value' do
                select.select_by(:text, 'Two')
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(css: 'option[value="two"]')])
              end

              it 'not already selected changes selected by complex text' do
                select.select_by(:text, 'Still learning how to count, apparently')
                expected_option = driver.find_element(css: 'option[value="still learning how to count, apparently"]')
                expect(select.selected_options).to eq([expected_option])
              end

              it 'errors when option disabled' do
                expect {
                  single_disabled.select_by(:text, 'Disabled')
                }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { select.select_by(:text, 'invalid') }.to raise_exception(Error::NoSuchElementError)
              end
            end

            context 'when by index' do
              it 'already selected stays selected' do
                select.select_by(:index, 0)
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(id: 'non_multi_option')])
              end

              it 'not already selected changes selected value' do
                select.select_by(:index, 1)
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(css: 'option[value="two"]')])
              end

              it 'errors when option disabled' do
                expect { single_disabled.select_by(:index, 1) }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { select.select_by(:index, 5) }.to raise_exception(Error::NoSuchElementError)
              end
            end

            context 'when by value' do
              it 'already selected stays selected' do
                select.select_by(:value, 'one')
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(id: 'non_multi_option')])
              end

              it 'not already selected changes selected value' do
                select.select_by(:value, 'two')
                selected_options = select.selected_options

                expect(selected_options).to eq([driver.find_element(css: 'option[value="two"]')])
              end

              it 'errors when option disabled' do
                expect {
                  single_disabled.select_by(:value, 'disabled')
                }.to raise_exception(Error::UnsupportedOperationError)
              end

              it 'errors when not found' do
                expect { select.select_by(:value, 'invalid') }.to raise_exception(Error::NoSuchElementError)
              end
            end
          end
        end

        describe '#deselect_by' do
          it 'invalid how raises exception' do
            expect { multi_select.deselect_by(:invalid, 'foo') }.to raise_exception(ArgumentError)
          end

          it 'raises exception if select not multiple' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))

            expect { select.deselect_by(:text, 'foo') }.to raise_exception(Error::UnsupportedOperationError)
          end

          context 'when by text' do
            it 'already selected is removed from selected' do
              multi_select.deselect_by(:text, 'Sausages')
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 1
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=sausages]'))
            end

            it 'not already selected is not selected' do
              multi_select.deselect_by(:text, 'Ham')
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 2
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=ham]'))
            end

            it 'errors when not found' do
              expect { multi_select.deselect_by(:text, 'invalid') }.to raise_exception(Error::NoSuchElementError)
            end
          end

          context 'when by index' do
            it 'already selected is removed from selected' do
              multi_select.deselect_by(:index, 0)
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 1
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=ham]'))
            end

            it 'not already selected is not selected' do
              multi_select.deselect_by(:index, 1)
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 2
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=ham]'))
            end

            it 'errors when not found' do
              expect { multi_select.deselect_by(:index, 5) }.to raise_exception(Error::NoSuchElementError)
            end
          end

          context 'when by value' do
            it 'already selected is removed from selected' do
              multi_select.deselect_by(:value, 'sausages')
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 1
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=sausages]'))
            end

            it 'not already selected is not selected' do
              multi_select.deselect_by(:value, 'ham')
              selected_options = multi_select.selected_options

              expect(selected_options.size).to eq 2
              expect(selected_options).not_to include(driver.find_element(css: 'option[value=ham]'))
            end

            it 'errors when not found' do
              expect { multi_select.deselect_by(:value, 'invalid') }.to raise_exception(Error::NoSuchElementError)
            end
          end
        end

        describe '#select_all' do
          it 'raises exception if select not multiple' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))

            expect { select.select_all }.to raise_exception(Error::UnsupportedOperationError)
          end

          it 'raises exception if select contains disabled options' do
            select = described_class.new(driver.find_element(name: 'multi_disabled'))

            expect { select.select_all }.to raise_exception(Error::UnsupportedOperationError)
          end

          it 'selects all options' do
            multi_select = described_class.new(driver.find_element(id: 'multi'))
            multi_select.select_all

            selected_options = multi_select.selected_options

            expect(selected_options.size).to eq 4
          end
        end

        describe '#deselect_all' do
          it 'raises exception if select not multiple' do
            select = described_class.new(driver.find_element(name: 'selectomatic'))

            expect { select.deselect_all }.to raise_exception(Error::UnsupportedOperationError)
          end

          it 'does not error when select contains disabled options' do
            select = described_class.new(driver.find_element(name: 'multi_disabled'))

            expect { select.deselect_all }.not_to raise_exception
          end

          it 'deselects all options' do
            multi_select = described_class.new(driver.find_element(id: 'multi'))
            multi_select.deselect_all

            expect(multi_select.selected_options).to be_empty
          end
        end
      end
    end # Support
  end # WebDriver
end # Selenium
