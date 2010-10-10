require 'spec_helper'

module Selenium
  module WebDriver
    module Firefox

      describe Profile do
        let(:profile) { Profile.new }

        def read_generated_prefs
          io = StringIO.new

          File.should_receive(:open).and_yield(io)
          profile.layout_on_disk

          io.string
        end

        it "should set additional preferences" do
          profile['foo.number'] = 123
          profile['foo.boolean'] = true
          profile['foo.string'] = "bar"

          string = read_generated_prefs
          string.should include('user_pref("foo.number", 123)')
          string.should include('user_pref("foo.boolean", true)')
          string.should include(%{user_pref("foo.string", "bar")})
        end

        it "should not let user override defaults" do
          profile['app.update.enabled'] = 'true'

          string = read_generated_prefs
          string.should include('user_pref("app.update.enabled", false)')
        end

        it "should let the user override some specific prefs" do
          profile["browser.startup.page"] = "http://example.com"

          string = read_generated_prefs
          string.should include(%Q{user_pref("browser.startup.page", "http://example.com")})
        end

        it "should raise an error if the value given is not a string, number or boolean" do
          lambda { profile['foo.bar'] = [] }.should raise_error(TypeError)
        end

        it "should raise an error if the value is already stringified" do
          lambda { profile['foo.bar'] = '"stringified"' }.should raise_error(ArgumentError)
        end

        it "should enable secure SSL" do
          profile.secure_ssl = true

          string = read_generated_prefs
          string.should include('user_pref("webdriver_accept_untrusted_certs", false)')
        end

        it "should disable secure SSL" do
          profile.secure_ssl = false

          string = read_generated_prefs
          string.should include('user_pref("webdriver_accept_untrusted_certs", true)')
        end

        it "should change the setting for untrusted certificate issuer" do
          profile.assume_untrusted_certificate_issuer = false

          string = read_generated_prefs
          string.should include('user_pref("webdriver_assume_untrusted_issuer", false)')
        end

        not_compliant_on :platform => :macosx do
          it "should be able to use the same profile more than once" do
            profile['browser.startup.homepage'] = url_for("formPage.html")

            begin
              driver_one = WebDriver.for(:firefox, :profile => profile)
              driver_two = WebDriver.for(:firefox, :profile => profile)
            ensure
              driver_one.quit if driver_one
              driver_two.quit if driver_two
            end
          end
        end

      end
    end # Firefox
  end # WebDriver
end # Selenium

