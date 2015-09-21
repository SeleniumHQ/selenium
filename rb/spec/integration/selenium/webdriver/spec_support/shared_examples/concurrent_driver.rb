shared_examples_for "driver that can be started concurrently" do |driver_name|
  it "is started sequentially" do
    expect {
      # start 5 drivers concurrently
      threads, drivers = [], []

      5.times do
        threads << Thread.new do
          drivers << Selenium::WebDriver.for(driver_name)
        end
      end

      threads.each do |thread|
        thread.abort_on_exception = true
        thread.join
      end

      drivers.each do |driver|
        driver.title # make any wire call
        driver.quit
      end
    }.not_to raise_error
  end
end
