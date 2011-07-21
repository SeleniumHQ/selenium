require File.expand_path("../../spec_helper", __FILE__)

module Selenium
  module WebDriver
    module Support

      describe EventFiringBridge do
        let(:bridge) { mock(Remote::Bridge, :driver_extensions => []) }
        let(:listener) { mock("EventListener") }
        let(:event_firing_bridge) { EventFiringBridge.new(bridge, listener) }
        let(:driver) { Driver.new(event_firing_bridge) }
        let(:element) { Element.new(event_firing_bridge, "ref") }

        context "navigation" do
          it "fires events for navigate.to" do
            url = "http://example.com"

            listener.should_receive(:before_navigate_to).with(url)
            bridge.should_receive(:get).with(url)
            listener.should_receive(:after_navigate_to).with(url)

            driver.navigate.to(url)
          end

          it "fires events for navigate.back" do
            listener.should_receive(:before_navigate_back)
            bridge.should_receive(:goBack)
            listener.should_receive(:after_navigate_back)

            driver.navigate.back
          end

          it "fires events for navigate.forward" do
            listener.should_receive(:before_navigate_forward)
            bridge.should_receive(:goForward)
            listener.should_receive(:after_navigate_forward)

            driver.navigate.forward
          end
        end

        context "finding elements" do
          it "fires events for find_element" do
            listener.should_receive(:before_find).with('id', "foo")
            bridge.should_receive(:find_element_by).with('id', "foo", nil).and_return(element)
            listener.should_receive(:after_find).with('id', "foo")

            driver.find_element(:id => "foo")
          end

          it "fires events for find_elements" do
            listener.should_receive(:before_find).with('class name', "foo")
            bridge.should_receive(:find_elements_by).with('class name', "foo", nil).and_return([element])
            listener.should_receive(:after_find).with('class name', "foo")

            driver.find_elements(:class => "foo")
          end
        end

        context "changing elements" do
          it "fires events for send_keys" do
            listener.should_receive(:before_change_value_of).with(instance_of(Element))
            bridge.should_receive(:sendKeysToElement).with("ref", ["cheese"])
            listener.should_receive(:after_change_value_of).with(instance_of(Element))

            element.send_keys "cheese"
          end

          it "fires events for clear" do
            listener.should_receive(:before_change_value_of).with(instance_of(Element))
            bridge.should_receive(:clearElement).with("ref")
            listener.should_receive(:after_change_value_of).with(instance_of(Element))

            element.clear
          end
        end

        context "executing scripts" do
          it "fires events for execute_script" do
            script, arg = 'script', 'arg'

            listener.should_receive(:before_execute_script).with(script)
            bridge.should_receive(:executeScript).with(script, arg)
            listener.should_receive(:after_execute_script).with(script)

            driver.execute_script script, arg
          end
        end

        context "closing and quitting" do
          it "fires events for close" do
            listener.should_receive(:before_close)
            bridge.should_receive(:close)
            listener.should_receive(:after_close)

            driver.close
          end

          it "fires events for quit" do
            listener.should_receive(:before_quit)
            bridge.should_receive(:quit)
            listener.should_receive(:after_quit)

            driver.quit
          end
        end
      end

    end # Support
  end # WebDriver
end # Selenium
