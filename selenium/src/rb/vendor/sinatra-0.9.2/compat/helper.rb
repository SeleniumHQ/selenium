require 'rubygems'
require 'mocha'

# disable warnings in compat specs.
$VERBOSE = nil

$:.unshift File.dirname(File.dirname(__FILE__)) + "/lib"

ENV['RACK_ENV'] ||= 'test'

require 'sinatra'
require 'sinatra/test'
require 'sinatra/test/unit'
require 'sinatra/test/spec'

module Sinatra::Test
  # we need to remove the new test helper methods since they conflict with
  # the top-level methods of the same name.
  %w(get head post put delete).each do |verb|
    remove_method verb
  end
  include Sinatra::Delegator
end

class Test::Unit::TestCase
  include Sinatra::Test

  PASSTHROUGH_EXCEPTIONS = [] unless const_defined?(:PASSTHROUGH_EXCEPTIONS)

  def setup
    @app = lambda { |env| Sinatra::Application.call(env) }
  end
end
