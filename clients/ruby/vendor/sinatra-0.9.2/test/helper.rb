ENV['RACK_ENV'] = 'test'

begin
  require 'rack'
rescue LoadError
  require 'rubygems'
  require 'rack'
end

testdir = File.dirname(__FILE__)
$LOAD_PATH.unshift testdir unless $LOAD_PATH.include?(testdir)

libdir = File.dirname(File.dirname(__FILE__)) + '/lib'
$LOAD_PATH.unshift libdir unless $LOAD_PATH.include?(libdir)

require 'contest'
require 'rack/test'
require 'sinatra/base'

class Sinatra::Base
  # Allow assertions in request context
  include Test::Unit::Assertions
end

Sinatra::Base.set :environment, :test

class Test::Unit::TestCase
  include Rack::Test::Methods

  class << self
    alias_method :it, :test
  end

  alias_method :response, :last_response

  setup do
    Sinatra::Base.set :environment, :test
  end

  # Sets up a Sinatra::Base subclass defined with the block
  # given. Used in setup or individual spec methods to establish
  # the application.
  def mock_app(base=Sinatra::Base, &block)
    @app = Sinatra.new(base, &block)
  end

  def app
    Rack::Lint.new(@app)
  end

  def body
    response.body.to_s
  end

  # Delegate other missing methods to response.
  def method_missing(name, *args, &block)
    if response && response.respond_to?(name)
      response.send(name, *args, &block)
    else
      super
    end
  end

  # Also check response since we delegate there.
  def respond_to?(symbol, include_private=false)
    super || (response && response.respond_to?(symbol, include_private))
  end

  # Do not output warnings for the duration of the block.
  def silence_warnings
    $VERBOSE, v = nil, $VERBOSE
    yield
  ensure
    $VERBOSE = v
  end
end
