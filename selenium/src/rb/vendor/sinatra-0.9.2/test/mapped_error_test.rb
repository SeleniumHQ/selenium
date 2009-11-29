require File.dirname(__FILE__) + '/helper'

class FooError < RuntimeError
end

class FooNotFound < Sinatra::NotFound
end

class MappedErrorTest < Test::Unit::TestCase
  def test_default
    assert true
  end

  describe 'Exception Mappings' do
    it 'invokes handlers registered with ::error when raised' do
      mock_app {
        set :raise_errors, false
        error(FooError) { 'Foo!' }
        get '/' do
          raise FooError
        end
      }
      get '/'
      assert_equal 500, status
      assert_equal 'Foo!', body
    end

    it 'uses the Exception handler if no matching handler found' do
      mock_app {
        set :raise_errors, false
        error(Exception) { 'Exception!' }
        get '/' do
          raise FooError
        end
      }

      get '/'
      assert_equal 500, status
      assert_equal 'Exception!', body
    end

    it "sets env['sinatra.error'] to the rescued exception" do
      mock_app {
        set :raise_errors, false
        error(FooError) {
          assert env.include?('sinatra.error')
          assert env['sinatra.error'].kind_of?(FooError)
          'looks good'
        }
        get '/' do
          raise FooError
        end
      }
      get '/'
      assert_equal 'looks good', body
    end

    it "raises without calling the handler when the raise_errors options is set" do
      mock_app {
        set :raise_errors, true
        error(FooError) { "she's not there." }
        get '/' do
          raise FooError
        end
      }
      assert_raise(FooError) { get '/' }
    end

    it "never raises Sinatra::NotFound beyond the application" do
      mock_app {
        set :raise_errors, true
        get '/' do
          raise Sinatra::NotFound
        end
      }
      assert_nothing_raised { get '/' }
      assert_equal 404, status
    end

    it "cascades for subclasses of Sinatra::NotFound" do
      mock_app {
        set :raise_errors, true
        error(FooNotFound) { "foo! not found." }
        get '/' do
          raise FooNotFound
        end
      }
      assert_nothing_raised { get '/' }
      assert_equal 404, status
      assert_equal 'foo! not found.', body
    end

    it 'has a not_found method for backwards compatibility' do
      mock_app {
        not_found do
          "Lost, are we?"
        end
      }

      get '/test'
      assert_equal 404, status
      assert_equal "Lost, are we?", body
    end
  end

  describe 'Custom Error Pages' do
    it 'allows numeric status code mappings to be registered with ::error' do
      mock_app {
        set :raise_errors, false
        error(500) { 'Foo!' }
        get '/' do
          [500, {}, 'Internal Foo Error']
        end
      }
      get '/'
      assert_equal 500, status
      assert_equal 'Foo!', body
    end

    it 'allows ranges of status code mappings to be registered with :error' do
      mock_app {
        set :raise_errors, false
        error(500..550) { "Error: #{response.status}" }
        get '/' do
          [507, {}, 'A very special error']
        end
      }
      get '/'
      assert_equal 507, status
      assert_equal 'Error: 507', body
    end

    class FooError < RuntimeError
    end

    it 'runs after exception mappings and overwrites body' do
      mock_app {
        set :raise_errors, false
        error FooError do
          response.status = 502
          'from exception mapping'
        end
        error(500) { 'from 500 handler' }
        error(502) { 'from custom error page' }

        get '/' do
          raise FooError
        end
      }
      get '/'
      assert_equal 502, status
      assert_equal 'from custom error page', body
    end
  end
end
