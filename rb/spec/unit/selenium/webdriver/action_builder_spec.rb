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

require File.expand_path("../spec_helper", __FILE__)

describe Selenium::WebDriver::ActionBuilder do
  let(:bridge)      { double("Bridge").as_null_object }
  let(:keyboard)    { double(Selenium::WebDriver::Keyboard) }
  let(:mouse)       { double(Selenium::WebDriver::Mouse)    }
  let(:element)     { Selenium::WebDriver::Element.new(bridge, 'element')  }
  let(:builder)     { Selenium::WebDriver::ActionBuilder.new(mouse, keyboard) }

  it "should create all keyboard actions" do
    keyboard.should_receive(:press).with(:shift)
    keyboard.should_receive(:send_keys).with("abc")
    keyboard.should_receive(:release).with(:control)

    builder.key_down(:shift).
            send_keys("abc").
            key_up(:control).perform
  end

  it "should pass an element to keyboard actions" do
    mouse.should_receive(:click).with(element)
    keyboard.should_receive(:press).with(:shift)

    builder.key_down(element, :shift).perform
  end

  it "should allow supplying individual elements to keyboard actions" do
    element2 = Selenium::WebDriver::Element.new(bridge, 'element2')
    element3 = Selenium::WebDriver::Element.new(bridge, 'element3')

    mouse.should_receive(:click).with(element)
    keyboard.should_receive(:press).with(:shift)
    mouse.should_receive(:click).with(element2)
    keyboard.should_receive(:send_keys).with("abc")
    mouse.should_receive(:click).with(element3)
    keyboard.should_receive(:release).with(:control)

    builder.key_down(element, :shift ).
            send_keys(element2, "abc").
            key_up(element3, :control).perform
  end

  it "should create all mouse actions" do
    mouse.should_receive(:down).with(element)
    mouse.should_receive(:up).with(element)
    mouse.should_receive(:click).with(element)
    mouse.should_receive(:double_click).with(element)
    mouse.should_receive(:move_to).with(element)
    mouse.should_receive(:context_click).with(element)

    builder.click_and_hold(element).
            release(element).
            click(element).
            double_click(element).
            move_to(element).
            context_click(element).perform
  end

  it "should drag and drop" do
    source = element
    target = Selenium::WebDriver::Element.new(bridge, 'element2')

    mouse.should_receive(:down).with(source)
    mouse.should_receive(:move_to).with(target)
    mouse.should_receive(:up)

    builder.drag_and_drop(source, target).perform
  end

  it "should drag and drop with offsets" do
    source = element

    mouse.should_receive(:down).with(source)
    mouse.should_receive(:move_by).with(-300, 400)
    mouse.should_receive(:up)

    builder.drag_and_drop_by(source, -300, 400).perform
  end

  it "can move the mouse by coordinates" do
    mouse.should_receive(:down).with(element)
    mouse.should_receive(:move_by).with(-300, 400)
    mouse.should_receive(:up)

    builder.click_and_hold(element).
            move_by(-300, 400).
            release.perform
  end

  it 'can click, hold and release at the current location' do
    mouse.should_receive(:down).with(nil)
    mouse.should_receive(:up)

    builder.click_and_hold.release.perform
  end

end
