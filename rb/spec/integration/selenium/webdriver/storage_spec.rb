require File.expand_path("../spec_helper", __FILE__)

module Selenium::WebDriver::DriverExtensions
  describe HasWebStorage do

    compliant_on :browser => [:android] do
      shared_examples_for 'web storage' do
        before {
          driver.navigate.to url_for("clicks.html")
          storage.clear
        }

        it "can get and set items" do
          storage.should be_empty
          storage['foo'] = 'bar'
          storage['foo'].should == 'bar'

          storage['foo1'] = 'bar1'
          storage['foo1'].should == 'bar1'

          storage.size.should == 2
        end

        it "can get all keys" do
          storage['foo1'] = 'bar1'
          storage['foo2'] = 'bar2'
          storage['foo3'] = 'bar3'

          storage.size.should == 3
          storage.keys.should == %w[foo1 foo2 foo3]
        end

        it "can clear all items" do
          storage['foo1'] = 'bar1'
          storage['foo2'] = 'bar2'
          storage['foo3'] = 'bar3'

          storage.size.should == 3
          storage.clear
          storage.size.should == 0
          storage.keys.should be_empty
        end

        it "can delete an item" do
          storage['foo1'] = 'bar1'
          storage['foo2'] = 'bar2'
          storage['foo3'] = 'bar3'

          storage.size.should == 3
          storage.delete('foo1').should == 'bar1'
          storage.size.should == 2
        end

        it "knows if a key is set" do
          storage.should_not have_key('foo1')
          storage['foo1'] = 'bar1'
          storage.should have_key('foo1')
        end

        it "is Enumerable" do
          storage['foo1'] = 'bar1'
          storage['foo2'] = 'bar2'
          storage['foo3'] = 'bar3'

          storage.to_a.should == [
                                  ['foo1', 'bar1'],
                                  ['foo2', 'bar2'],
                                  ['foo3', 'bar3']
                                 ]
        end

        it "can fetch an item" do
          storage['foo1'] = 'bar1'
          storage.fetch('foo1').should == 'bar1'
        end

        it "raises IndexError on missing key" do
          lambda do
            storage.fetch('no-such-key')
          end.should raise_error(IndexError, /missing key/)
        end
      end

      context "local storage" do
        let(:storage) { driver.local_storage }
        it_behaves_like 'web storage'
      end

      context "session storage" do
        let(:storage) { driver.session_storage }
        it_behaves_like 'web storage'
      end
    end

  end
end
