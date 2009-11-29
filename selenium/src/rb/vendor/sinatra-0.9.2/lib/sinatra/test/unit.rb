require 'sinatra/test'
require 'test/unit'

Sinatra::Test.deprecate('test/unit')

Test::Unit::TestCase.send :include, Sinatra::Test

Sinatra::Default.set(
  :environment => :test,
  :run => false,
  :raise_errors => true,
  :logging => false
)
