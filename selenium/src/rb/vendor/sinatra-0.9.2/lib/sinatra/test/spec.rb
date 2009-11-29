require 'test/spec'
require 'sinatra/test'
require 'sinatra/test/unit'

Sinatra::Test.deprecate('test/spec')

module Sinatra::Test
  def should
    @response.should
  end
end
