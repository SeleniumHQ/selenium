require 'bacon'
require 'sinatra/test'

Sinatra::Test.deprecate('Bacon')

Sinatra::Default.set(
  :environment => :test,
  :run => false,
  :raise_errors => true,
  :logging => false
)

module Sinatra::Test
  def should
    @response.should
  end
end

Bacon::Context.send(:include, Sinatra::Test)
