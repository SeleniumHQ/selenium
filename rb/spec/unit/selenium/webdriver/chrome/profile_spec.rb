require File.expand_path("../../spec_helper", __FILE__)


module Selenium
  module WebDriver
    module Chrome

      describe Profile do
        let(:profile) { Profile.new }
        let(:model) { "/some/path" }
        let(:model_profile) { Profile.new(model) }

        before do
          File.stub!(:exist?).with(model).and_return true
          File.stub!(:directory?).with(model).and_return true

          Dir.stub!(:mktmpdir => "/tmp/some/path")
          FileUtils.stub!(:rm_rf)
          FileUtils.stub!(:mkdir_p)
          FileUtils.stub!(:cp_r)
        end

        it "should set and get preference paths" do
          profile['foo.bar.baz'] = true
          profile['foo.bar.baz'].should == true
        end

        it "reads existing prefs" do
          File.should_receive(:read).with("/some/path/Default/Preferences").
                                     and_return('{"autofill": {"enabled": false}}')

          model_profile['autofill.enabled'].should == false
        end

        it "writes out prefs" do
          File.should_receive(:read).with("/some/path/Default/Preferences").
                                     and_return('{"autofill": {"enabled": false}}')

          model_profile['some.other.pref'] = 123

          mock_io = StringIO.new
          FileUtils.should_receive(:mkdir_p).with("/tmp/some/path/Default")
          File.should_receive(:open).with("/tmp/some/path/Default/Preferences", "w").and_yield(mock_io)

          model_profile.layout_on_disk

          result = WebDriver.json_load(mock_io.string)

          result['autofill']['enabled'].should == false
          result['some']['other']['pref'].should == 123
        end
      end

    end # Chrome
  end # WebDriver
end # Selenium

