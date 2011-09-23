module Selenium
  module WebDriver
    module Opera

      describe Driver do

        before(:all) { GlobalTestEnv.quit_driver rescue nil }

        it 'raises ArgumentError if sent an unknown capability as an argument' do
          lambda {
            Selenium::WebDriver.for :opera, :foo => 'bar'
          }.should raise_error(ArgumentError)
        end

        it 'accepts an array of custom command-line arguments' do
          begin
            driver = Selenium::WebDriver.for :opera, :arguments => ['-geometry 800x600']
          ensure
            driver.quit if driver
          end
        end

        it 'raises ArgumentError if :arguments is not an Array' do
          lambda {
            Selenium::WebDriver.for :opera, :arguments => '-foo'
          }.should raise_error(ArgumentError)
        end

        it 'accepts a valid logging level' do
          begin
            driver = Selenium::WebDriver.for :opera, :logging_level => :config
            # TODO(andreastt): Validate output to console
          ensure
            driver.quit if driver
          end
        end

        it 'raises ArgumentError if :logging_level uses an invalid logging level' do
          lambda {
            Selenium::WebDriver.for :opera, :logging_level => :hoobaflooba
          }.should raise_error(ArgumentError)
        end
      end

    end
  end
end
