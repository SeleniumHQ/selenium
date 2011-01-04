require "selenium-client"
require "stringio"

# for bamboo
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

module SeleniumClientSpecHelper
  def capture_stderr(&blk)
    io = StringIO.new
    orig, $stderr = $stderr, io

    begin
      yield
    ensure
      $stderr = orig
    end

    io.string
  end
end

RSpec.configure do |config|
  config.include(SeleniumClientSpecHelper)
end