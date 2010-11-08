require "rubygems"
require "time"
require "spec"
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

require "selenium-webdriver"
