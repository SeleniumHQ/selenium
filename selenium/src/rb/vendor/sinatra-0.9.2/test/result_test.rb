require File.dirname(__FILE__) + '/helper'

class ResultTest < Test::Unit::TestCase
  it "sets response.body when result is a String" do
    mock_app {
      get '/' do
        'Hello World'
      end
    }

    get '/'
    assert ok?
    assert_equal 'Hello World', body
  end

  it "sets response.body when result is an Array of Strings" do
    mock_app {
      get '/' do
        ['Hello', 'World']
      end
    }

    get '/'
    assert ok?
    assert_equal 'HelloWorld', body
  end

  it "sets response.body when result responds to #each" do
    mock_app {
      get '/' do
        res = lambda { 'Hello World' }
        def res.each ; yield call ; end
        res
      end
    }

    get '/'
    assert ok?
    assert_equal 'Hello World', body
  end

  it "sets response.body to [] when result is nil" do
    mock_app {
      get '/' do
        nil
      end
    }

    get '/'
    assert ok?
    assert_equal '', body
  end

  it "sets status, headers, and body when result is a Rack response tuple" do
    mock_app {
      get '/' do
        [205, {'Content-Type' => 'foo/bar'}, 'Hello World']
      end
    }

    get '/'
    assert_equal 205, status
    assert_equal 'foo/bar', response['Content-Type']
    assert_equal 'Hello World', body
  end

  it "sets status and body when result is a two-tuple" do
    mock_app {
      get '/' do
        [409, 'formula of']
      end
    }

    get '/'
    assert_equal 409, status
    assert_equal 'formula of', body
  end

  it "raises a TypeError when result is a non two or three tuple Array" do
    mock_app {
      get '/' do
        [409, 'formula of', 'something else', 'even more']
      end
    }

    assert_raise(TypeError) { get '/' }
  end

  it "sets status when result is a Fixnum status code" do
    mock_app {
      get('/') { 205 }
    }

    get '/'
    assert_equal 205, status
    assert_equal '', body
  end
end
