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

            listener.should_receive(:before_navigate_to).with(url, instance_of(Driver))
            bridge.should_receive(:get).with(url)
            listener.should_receive(:after_navigate_to).with(url, instance_of(Driver))

            driver.navigate.to(url)
          end

          it "fires events for navigate.back" do
            listener.should_receive(:before_navigate_back).with instance_of(Driver)
            bridge.should_receive(:goBack)
            listener.should_receive(:after_navigate_back).with instance_of(Driver)

            driver.navigate.back
          end

          it "fires events for navigate.forward" do
            listener.should_receive(:before_navigate_forward).with instance_of(Driver)
            bridge.should_receive(:goForward)
            listener.should_receive(:after_navigate_forward).with instance_of(Driver)

            driver.navigate.forward
          end
        end

        context "finding elements" do
          it "fires events for find_element" do
            listener.should_receive(:before_find).with('id', "foo", instance_of(Driver))
            bridge.should_receive(:find_element_by).with('id', "foo", nil).and_return(element)
            listener.should_receive(:after_find).with('id', "foo", instance_of(Driver))

            driver.find_element(:id => "foo")
          end

          it "fires events for find_elements" do
            listener.should_receive(:before_find).with('class name', "foo", instance_of(Driver))
            bridge.should_receive(:find_elements_by).with('class name', "foo", nil).and_return([element])
            listener.should_receive(:after_find).with('class name', "foo", instance_of(Driver))

            driver.find_elements(:class => "foo")
          end
        end

        context "changing elements" do
          it "fires events for send_keys" do
            listener.should_receive(:before_change_value_of).with(instance_of(Element), instance_of(Driver))
            bridge.should_receive(:sendKeysToElement).with("ref", ["cheese"])
            listener.should_receive(:after_change_value_of).with(instance_of(Element), instance_of(Driver))

            element.send_keys "cheese"
          end

          it "fires events for clear" do
            listener.should_receive(:before_change_value_of).with(instance_of(Element), instance_of(Driver))
            bridge.should_receive(:clearElement).with("ref")
            listener.should_receive(:after_change_value_of).with(instance_of(Element), instance_of(Driver))

            element.clear
          end
        end

        context "executing scripts" do
          it "fires events for execute_script" do
            script, arg = 'script', 'arg'

            listener.should_receive(:before_execute_script).with(script, instance_of(Driver))
            bridge.should_receive(:executeScript).with(script, arg)
            listener.should_receive(:after_execute_script).with(script, instance_of(Driver))

            driver.execute_script script, arg
          end
        end

        context "closing and quitting" do
          it "fires events for close" do
            listener.should_receive(:before_close).with instance_of(Driver)
            bridge.should_receive(:close)
            listener.should_receive(:after_close).with instance_of(Driver)

            driver.close
          end

          it "fires events for quit" do
            listener.should_receive(:before_quit).with instance_of(Driver)
            bridge.should_receive(:quit)
            listener.should_receive(:after_quit).with instance_of(Driver)

            driver.quit
          end
        end
      end

    end # Support
  end # WebDriver
end # Selenium
