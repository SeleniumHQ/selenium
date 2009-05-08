require 'test/spec'
require 'sinatra/test'
require 'sinatra/test/unit'

module Sinatra::Test
  def should
    @response.should
  end
end
