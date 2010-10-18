require "rubygems"
# Bundler on jruby-complete.jar is blocked on http://jira.codehaus.org/browse/JRUBY-5006
if RUBY_PLATFORM != "java"
  require 'bundler/setup'
end

require "time"
require "spec"
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

require "selenium-webdriver"
