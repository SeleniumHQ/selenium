begin
  require 'test/spec'
rescue LoadError
  require 'rubygems'
  require 'test/spec'
end

$:.unshift File.dirname(File.dirname(__FILE__)) + '/lib'
require 'sinatra/base'
require 'sinatra/test'
require 'sinatra/test/spec'

module Sinatra::Test
  # Sets up a Sinatra::Base subclass defined with the block
  # given. Used in setup or individual spec methods to establish
  # the application.
  def mock_app(base=Sinatra::Base, &block)
    @app = Sinatra.new(base, &block)
  end
end

class Sinatra::Base
  # Allow assertions in request context
  include Test::Unit::Assertions
end
