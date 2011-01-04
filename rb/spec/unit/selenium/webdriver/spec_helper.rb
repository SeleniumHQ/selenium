require "rubygems"
require "time"
require "rspec"
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

require "selenium-webdriver"
