$:.unshift File.expand_path("../lib", __FILE__)

require 'bundler/setup'
require 'rake'
require 'rake/testtask'
require "spec/rake/spectask"
require "selenium/rake/tasks"

Rake::TestTask.new(:unit)do |t|
  t.libs << "test" << "lib"
  t.test_files = FileList["test/unit/**/*_tests.rb"]
end

Spec::Rake::SpecTask.new("spec:integration") do |t|
  t.libs << "test/integration"
  t.spec_files = FileList["test/integration/**/*_spec.rb"]
end

Selenium::Rake::SeleniumServerStartTask.new do |rc|
  rc.port = 4444
  rc.timeout_in_seconds = 3 * 60
  rc.background = true
  rc.nohup = ENV['SELENIUM_RC_NOHUP'] == "true"
  rc.wait_until_up_and_running = true
  rc.jar_file = File.expand_path("../../build/remote/server/server-standalone.jar", __FILE__)
  rc.additional_args << "-singleWindow"
end

Selenium::Rake::SeleniumServerStopTask.new do |rc|
  rc.host = "localhost"
  rc.port = 4444
  rc.timeout_in_seconds = 3 * 60
  rc.wait_until_stopped = true
end



task :defult => :unit
