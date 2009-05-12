Welcome to the official Ruby driver for [Selenium Remote Control](http://selenium-rc.openqa.org)

Mission
=======

 Provide a **lightweight, simple and idiomatic API to write 
 Selenium tests in Ruby**. Focus is also on improving test 
 feedback -- especially on failures -- by providing 
 out-of-the-box **state-of-the-art reporting capabilities**.
 With screenshots, HTML snapshopts and log captures,
 investigating test failures becomes a breeze.
 

Install It
==========

 The easiest way to install the install selenium-client using RubyGems:

    sudo gem install selenium-client

Features
========

* Backward compatible with the old-fashioned, XSL generated Selenium Ruby API.
 See [the generated driver](http://selenium-client.rubyforge.org/classes/Selenium/Client/GeneratedDriver.html) to get an extensive reference.
   
* Idiomatic interface to the Selenium API.
  See [the Idiomatic module](http://selenium-client.rubyforge.org/classes/Selenium/Client/Idiomatic.html)
  for more details.
 
* Convenience methods for AJAX.
 See the [Extensions](http://selenium-client.rubyforge.org/classes/Selenium/Client/Extensions.html)
  for more details.

* Flexible wait semantics inline with the trigerring action. e.g.
 
  * `click 'the_button_id', :wait_for => :page`
  * `click 'the_button_id', :wait_for => :ajax`
  * `click 'the_button_id', :wait_for => :element, :element => 'new_element_id'`
  * `click 'the_button_id', :wait_for => :no_element, :element => 'disappearing_element_id'`
  * `click 'the_button_id', :wait_for => :text, :text => 'New Text'`
  * `click 'the_button_id', :wait_for => :text, :text => /A Regexp/`
  * `click 'the_button_id', :wait_for => :text, :element => 'notification_box', :text => 'New Text'`
  * `click 'the_button_id', :wait_for => :no_text, :text => 'Disappearing Text'`
  * `click 'the_button_id', :wait_for => :no_text, :text => /A Regexp/`
  * `click 'the_button_id', :wait_for => :no_text, :element => 'notification_box', :text => 'Disappearing Text'`
  * `click 'the_button_id', :wait_for => :effects`
  * `click 'the_button_id', :wait_for => :value, :element => 'a_locator', :value => 'some value'`
  * `click 'the_button_id', :wait_for => :no_value, :element => 'a_locator', :value => 'some value' # will wait for the field value of 'a_locator' to not be 'some value'`  
  * `click 'the_button_id', :wait_for => :condition, :javascript => "some arbitrary javascript expression"`

  Check out the `click`, `go_back` and `wait_for` methods of the [Idiomatic Module](http://selenium-client.rubyforge.org/classes/Selenium/Client/Idiomatic.html)
           
* Leveraging latest innovations in Selenium Remote Control (screenshots, log captures, ...)
 
* Robust Rake task to start/stop the Selenium Remote Control server. More details in the next section.

* State-of-the-art reporting for RSpec.

Plain API
=========
 
 Selenium client is just a plain Ruby API, so you can use it wherever you can use Ruby. 
 
 To used the new API just require the client driver:
 
    require "rubygems"
    require "selenium/client"

 For a fully backward compatible API you can start with:
 
    require "rubygems"
    gem "selenium-client"
    require "selenium"
 
 For instance
 to write a little Ruby script using selenium-client you could write something like:

    #!/usr/bin/env ruby
    #
    # Sample Ruby script using the Selenium client API
    #
    require "rubygems"
    gem "selenium-client", ">=1.2.15"
    require "selenium/client"
    
    begin
      @browser = Selenium::Client::Driver.new \
          :host => "localhost", 
          :port => 4444, 
          :browser => "*firefox", 
          :url => "http://www.google.com", 
          :timeout_in_second => 60
    
      @browser.start_new_browser_session
    	@browser.open "/"
    	@browser.type "q", "Selenium seleniumhq.org"
    	@browser.click "btnG", :wait_for => :page
    	puts @browser.text?("seleniumhq.org")
    ensure
      @browser.close_current_browser_session    
    end

 
Writing Tests
=============
 
 Most likely you will be writing functional and acceptance tests using selenium-client. If you are a 
 `Test::Unit` fan your tests will look like:
 
    #!/usr/bin/env ruby
    #
    # Sample Test:Unit based test case using the selenium-client API
    #
    require "test/unit"
    require "rubygems"
    gem "selenium-client", ">=1.2.15"
    require "selenium/client"
    
    class ExampleTest < Test::Unit::TestCase
    	attr_reader :browser
    
      def setup
        @browser = Selenium::Client::Driver.new \
            :host => "localhost", 
            :port => 4444, 
            :browser => "*firefox", 
            :url => "http://www.google.com", 
            :timeout_in_second => 60
    
        browser.start_new_browser_session
      end
    
      def teardown
        browser.close_current_browser_session
      end
    
      def test_page_search
    		browser.open "/"
    		assert_equal "Google", browser.title
    		browser.type "q", "Selenium seleniumhq"
    		browser.click "btnG", :wait_for => :page
    		assert_equal "Selenium seleniumhq - Google Search", browser.title
    		assert_equal "Selenium seleniumhq", browser.field("q")
    		assert browser.text?("seleniumhq.org")
    		assert browser.element?("link=Cached")
      end
    
    end
    
 If BDD is more your style, here is how you can achieve the same thing  using RSpec:

    require 'rubygems'
    gem "rspec", "=1.2.6"
    gem "selenium-client", ">=1.2.15"
    require "selenium/client"
    require "selenium/rspec/spec_helper"
    
    describe "Google Search" do
    	attr_reader :selenium_driver
    	alias :page :selenium_driver
    
      before(:all) do
          @selenium_driver = Selenium::Client::Driver.new \
              :host => "localhost", 
              :port => 4444, 
              :browser => "*firefox", 
              :url => "http://www.google.com", 
              :timeout_in_second => 60
      end
    
      before(:each) do
        selenium_driver.start_new_browser_session
      end
    
      # The system capture need to happen BEFORE closing the Selenium session 
      append_after(:each) do    
        @selenium_driver.close_current_browser_session
      end
    
      it "can find Selenium" do    
        page.open "/"
        page.title.should eql("Google")
        page.type "q", "Selenium seleniumhq"
        page.click "btnG", :wait_for => :page
        page.value("q").should eql("Selenium seleniumhq")
        page.text?("seleniumhq.org").should be_true
        page.title.should eql("Selenium seleniumhq - Google Search")
        page.text?("seleniumhq.org").should be_true
    		page.element?("link=Cached").should be_true		
      end
    
    end

Start/Stop a Selenium Remote Control Server
===========================================
 
  Selenium client comes with some convenient Rake tasks to start/stop a Remote Control server.
  To leverage all selenium-client capabilities I recommend downloading a recent nightly build of
  a standalone packaging of Selenium Remote Control (great for kick-ass Safari and Firefox 3 support anyway).
  You will find the mightly build at [OpenQA.org](http://archiva.openqa.org/repository/snapshots/org/openqa/selenium/selenium-remote-control/1.0-SNAPSHOT/)
 
 You typically "freeze" the Selenium Remote Control jar in your `vendor` 
 directory.
 
    require 'selenium/rake/tasks' 
    
    Selenium::Rake::RemoteControlStartTask.new do |rc|
      rc.port = 4444
      rc.timeout_in_seconds = 3 * 60
      rc.background = true
      rc.wait_until_up_and_running = true
      rc.jar_file = "/path/to/where/selenium-rc-standalone-jar-is-installed"
      rc.additional_args << "-singleWindow"
    end

    Selenium::Rake::RemoteControlStopTask.new do |rc|
      rc.host = "localhost"
      rc.port = 4444
      rc.timeout_in_seconds = 3 * 60
    end

  If you do not explicitly specify the path to selenium remote control jar
  it will be "auto-discovered" in `vendor` directory using the following
  path : `vendor/selenium-remote-control/selenium-server*-standalone.jar`

  Check out [RemoteControlStartTask](http://selenium-client.rubyforge.org/classes/Selenium/Rake/RemoteControlStartTask.html) and [RemoteControlStopTask](http://selenium-client.rubyforge.org/classes/Selenium/Rake/RemoteControlStopTask.html) for more 
details. 

State-of-the-Art RSpec Reporting
================================

 Selenium Client comes with out-of-the-box RSpec reporting that include HTML snapshots, O.S. screenshots, in-browser page
screenshots (not limited to current viewport), and a capture of the latest remote controls for all failing tests. And all
course all this works even if your infrastructure is distributed (In particular in makes wonders with [Selenium
Grid](http://selenium-grid.openqa.org))

 Using selenium-client RSpec reporting is as simple as using `SeleniumTestReportFormatter` as one of you RSpec formatters. For instance:

    require 'spec/rake/spectask'
    desc 'Run acceptance tests for web application'
    Spec::Rake::SpecTask.new(:'test:acceptance:web') do |t|
     t.libs << "test"
     t.pattern = "test/*_spec.rb"
     t.spec_opts << '--color'
     t.spec_opts << "--require 'rubygems,selenium/rspec/reporting/selenium_test_report_formatter'"
     t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./tmp/acceptance_tests_report.html"
     t.spec_opts << "--format=progress"                
     t.verbose = true
    end

 You can then get cool reports like [this one](http://ph7spot.com/examples/selenium_rspec_report.html)

 To capture screenshots and logs on failures, also make sure you 
 require the following files in your `spec_helper`:
 
    require "rubygems"
    require "spec"
    require "selenium/client"
    require "selenium/rspec/spec_helper"

Other Resources
===============

* Report bugs at http://github.com/ph7/selenium-client/issues
* Browse API at http://selenium-client.rubyforge.org


Contribute and Join the Fun!
============================

  We welcome new features, add-ons, bug fixes, example, documentation, 
  etc. Make the gem work the way you envision!

* Report bugs at http://github.com/ph7/selenium-client/issues
  
* I recommend cloning the selenium-client 
  [reference repository](http://github.com/ph7/selenium-client/tree/master)
  
* You can also check out the [RubyForge page](http://rubyforge.org/projects/selenium-client) 
  and the [RDoc](http://selenium-client.rubyforge.org)
  
* We also have a [continuous integration server](http://xserve.openqa.org:8080/view/Ruby%20Client)

* Stories live in [Pivotal Tracker](https://www.pivotaltracker.com/projects/6280)
* To build, run `rake clean default package`. You can then install the
generated gem with `sudo gem install pkg/*.gem`
* You can also run all integration tests with `rake ci:integration`


Core Team
=========

* Philippe Hanrigou (`ph7`): Current Maintainer and main contributor
* Aslak Hellesoy and Darren Hobbs : Original version of the Selenium Ruby driver

Contributors
============
  
* Aaron Tinio (`aptinio`):
   - More robust Selenium RC shutdown
   - Support for locator including single quotes in `wait_for_...` methods
   - Do not capture system state on execution errors for pending examples
     (ExamplePendingError, NotYetImplementedError)

* Rick Lee-Morlang (`rleemorlang`):
   - Fix for incremental calls to `wait_for_text`
   - Regex support in `wait_for_text`
  
* [Paul Boone](http://www.mindbucket.com) (`paulboone`)
   - Fixed method_missing in selenium_helper to only delegate to methods 
     that @selenium responds to

* [Adam Greene](http://blog.sweetspot.dm) (`skippy`)
   - Added the ability to redirect output to a log file, when
     launching Selenium Remote Control with the Rake task
   