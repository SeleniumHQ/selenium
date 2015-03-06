module Selenium
  module WebDriver
    module Safari

      describe 'with custom extension' do
        before { GlobalTestEnv.quit_driver }
        after  { @driver.quit if @driver }

        let(:wait) { Wait.new(timeout: 2) }
        let(:extension_path) { }

        def create_driver(with_extension = false)
          extensions = []

          if with_extension
            extensions << GlobalTestEnv.root.join('java/client/test/org/openqa/selenium/safari/setAttribute.safariextz').to_s
          end

          @driver = WebDriver.for :safari, extensions: extensions
          @driver.get url_for('blank.html')

          @driver
        end

        def custom_extension_installed?(driver)
          wait.until { driver.find_element(css: "html[istestsafariextzinstalled759='yes']") }
          true
        rescue Error::TimeOutError
          false
        end

        it 'should start without custom extension by default' do
          driver = create_driver
          custom_extension_installed?(driver).should be false
        end

        it 'should start with custom extension if requested' do
          driver = create_driver(true)
          custom_extension_installed?(driver).should be true
        end
      end

    end # Safari
  end # WebDriver
end # Selenium

