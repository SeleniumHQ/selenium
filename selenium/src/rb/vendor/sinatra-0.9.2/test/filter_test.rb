require File.dirname(__FILE__) + '/helper'

class FilterTest < Test::Unit::TestCase
  it "executes filters in the order defined" do
    count = 0
    mock_app do
      get('/') { 'Hello World' }
      before {
        assert_equal 0, count
        count = 1
      }
      before {
        assert_equal 1, count
        count = 2
      }
    end

    get '/'
    assert ok?
    assert_equal 2, count
    assert_equal 'Hello World', body
  end

  it "allows filters to modify the request" do
    mock_app {
      get('/foo') { 'foo' }
      get('/bar') { 'bar' }
      before { request.path_info = '/bar' }
    }

    get '/foo'
    assert ok?
    assert_equal 'bar', body
  end

  it "can modify instance variables available to routes" do
    mock_app {
      before { @foo = 'bar' }
      get('/foo') { @foo }
    }

    get '/foo'
    assert ok?
    assert_equal 'bar', body
  end

  it "allows redirects in filters" do
    mock_app {
      before { redirect '/bar' }
      get('/foo') do
        fail 'before block should have halted processing'
        'ORLY?!'
      end
    }

    get '/foo'
    assert redirect?
    assert_equal '/bar', response['Location']
    assert_equal '', body
  end

  it "does not modify the response with its return value" do
    mock_app {
      before { 'Hello World!' }
      get '/foo' do
        assert_equal [], response.body
        'cool'
      end
    }

    get '/foo'
    assert ok?
    assert_equal 'cool', body
  end

  it "does modify the response with halt" do
    mock_app {
      before { halt 302, 'Hi' }
      get '/foo' do
        "should not happen"
      end
    }

    get '/foo'
    assert_equal 302, response.status
    assert_equal 'Hi', body
  end

  it "gives you access to params" do
    mock_app {
      before { @foo = params['foo'] }
      get('/foo') { @foo }
    }

    get '/foo?foo=cool'
    assert ok?
    assert_equal 'cool', body
  end
end
