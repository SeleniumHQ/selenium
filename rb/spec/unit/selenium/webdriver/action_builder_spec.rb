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
    describe ActionBuilder do
      let(:bridge)      { double('Bridge').as_null_object }
      let(:keyboard)    { double(Selenium::WebDriver::Keyboard) }
      let(:mouse)       { double(Selenium::WebDriver::Mouse)    }
      let(:element)     { Selenium::WebDriver::Element.new(bridge, 'element') }
      let(:builder)     { Selenium::WebDriver::ActionBuilder.new(mouse, keyboard) }

      it 'should create all keyboard actions' do
        expect(keyboard).to receive(:press).with(:shift)
        expect(keyboard).to receive(:send_keys).with('abc')
        expect(keyboard).to receive(:release).with(:control)

        builder.key_down(:shift)
               .send_keys('abc')
               .key_up(:control).perform
      end

      it 'should pass an element to keyboard actions' do
        expect(mouse).to receive(:click).with(element)
        expect(keyboard).to receive(:press).with(:shift)

        builder.key_down(element, :shift).perform
      end

      it 'should allow supplying individual elements to keyboard actions' do
        element2 = Selenium::WebDriver::Element.new(bridge, 'element2')
        element3 = Selenium::WebDriver::Element.new(bridge, 'element3')

        expect(mouse).to receive(:click).with(element)
        expect(keyboard).to receive(:press).with(:shift)
        expect(mouse).to receive(:click).with(element2)
        expect(keyboard).to receive(:send_keys).with('abc')
        expect(mouse).to receive(:click).with(element3)
        expect(keyboard).to receive(:release).with(:control)

        builder.key_down(element, :shift)
               .send_keys(element2, 'abc')
               .key_up(element3, :control).perform
      end

      it 'should create all mouse actions' do
        expect(mouse).to receive(:down).with(element)
        expect(mouse).to receive(:up).with(element)
        expect(mouse).to receive(:click).with(element)
        expect(mouse).to receive(:double_click).with(element)
        expect(mouse).to receive(:move_to).with(element)
        expect(mouse).to receive(:context_click).with(element)

        builder.click_and_hold(element)
               .release(element)
               .click(element)
               .double_click(element)
               .move_to(element)
               .context_click(element).perform
      end

      it 'should move_to ignore floating point part of coordinate' do
        expect(mouse).to receive(:move_to).with(element, -300, 400)

        builder.move_to(element, -300.1, 400.1).perform
      end

      it 'should move_by ignore floating point part of coordinate' do
        expect(mouse).to receive(:move_by).with(-300, 400)

        builder.move_by(-300.1, 400.1).perform
      end

      it 'should drag and drop' do
        source = element
        target = Selenium::WebDriver::Element.new(bridge, 'element2')

        expect(mouse).to receive(:down).with(source)
        expect(mouse).to receive(:move_to).with(target)
        expect(mouse).to receive(:up)

        builder.drag_and_drop(source, target).perform
      end

      it 'should drag and drop with offsets' do
        source = element

        expect(mouse).to receive(:down).with(source)
        expect(mouse).to receive(:move_by).with(-300, 400)
        expect(mouse).to receive(:up)

        builder.drag_and_drop_by(source, -300, 400).perform
      end

      it 'can move the mouse by coordinates' do
        expect(mouse).to receive(:down).with(element)
        expect(mouse).to receive(:move_by).with(-300, 400)
        expect(mouse).to receive(:up)

        builder.click_and_hold(element)
               .move_by(-300, 400)
               .release.perform
      end

      it 'can click, hold and release at the current location' do
        expect(mouse).to receive(:down).with(nil)
        expect(mouse).to receive(:up)

        builder.click_and_hold.release.perform
      end
    end
  end # WebDriver
end # Selenium
