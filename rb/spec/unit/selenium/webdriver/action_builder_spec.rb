require File.expand_path("../spec_helper", __FILE__)

describe Selenium::WebDriver::ActionBuilder do
  let(:bridge)      { mock("Bridge").as_null_object }
  let(:keyboard)    { mock(Selenium::WebDriver::Keyboard) }
  let(:mouse)       { mock(Selenium::WebDriver::Mouse)    }
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

end
