require 'rubygems'
require 'time'
require 'rspec'
require 'ci/reporter/rspec'
require 'webmock/rspec'
require 'selenium-webdriver'

module Selenium
  module WebDriver
    module UnitSpecHelper

      def with_env(hash, &blk)
        hash.each { |k,v| ENV[k.to_s] = v.to_s }
        yield
      ensure
        hash.each_key { |k| ENV.delete(k) }
      end

    end
  end
end

RSpec.configure do |c|
  c.include Selenium::WebDriver::UnitSpecHelper

  c.filter_run :focus => true if ENV['focus']
end