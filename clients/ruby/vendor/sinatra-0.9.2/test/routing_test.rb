require File.dirname(__FILE__) + '/helper'

# Helper method for easy route pattern matching testing
def route_def(pattern)
  mock_app { get(pattern) { } }
end

class RegexpLookAlike
  class MatchData
    def captures
      ["this", "is", "a", "test"]
    end
  end

  def match(string)
    ::RegexpLookAlike::MatchData.new if string == "/this/is/a/test/"
  end

  def keys
    ["one", "two", "three", "four"]
  end
end

class RoutingTest < Test::Unit::TestCase
  %w[get put post delete].each do |verb|
    it "defines #{verb.upcase} request handlers with #{verb}" do
      mock_app {
        send verb, '/hello' do
          'Hello World'
        end
      }

      request = Rack::MockRequest.new(@app)
      response = request.request(verb.upcase, '/hello', {})
      assert response.ok?
      assert_equal 'Hello World', response.body
    end
  end

  it "defines HEAD request handlers with HEAD" do
    mock_app {
      head '/hello' do
        response['X-Hello'] = 'World!'
        'remove me'
      end
    }

    request = Rack::MockRequest.new(@app)
    response = request.request('HEAD', '/hello', {})
    assert response.ok?
    assert_equal 'World!', response['X-Hello']
    assert_equal '', response.body
  end

  it "404s when no route satisfies the request" do
    mock_app {
      get('/foo') { }
    }
    get '/bar'
    assert_equal 404, status
  end

  it "overrides the content-type in error handlers" do
    mock_app {
      before { content_type 'text/plain' }
      error Sinatra::NotFound do
        content_type "text/html"
        "<h1>Not Found</h1>"
      end
    }

    get '/foo'
    assert_equal 404, status
    assert_equal 'text/html', response["Content-Type"]
    assert_equal "<h1>Not Found</h1>", response.body
  end

  it 'takes multiple definitions of a route' do
    mock_app {
      user_agent(/Foo/)
      get '/foo' do
        'foo'
      end

      get '/foo' do
        'not foo'
      end
    }

    get '/foo', {}, 'HTTP_USER_AGENT' => 'Foo'
    assert ok?
    assert_equal 'foo', body

    get '/foo'
    assert ok?
    assert_equal 'not foo', body
  end

  it "exposes params with indifferent hash" do
    mock_app {
      get '/:foo' do
        assert_equal 'bar', params['foo']
        assert_equal 'bar', params[:foo]
        'well, alright'
      end
    }
    get '/bar'
    assert_equal 'well, alright', body
  end

  it "merges named params and query string params in params" do
    mock_app {
      get '/:foo' do
        assert_equal 'bar', params['foo']
        assert_equal 'biz', params['baz']
      end
    }
    get '/bar?baz=biz'
    assert ok?
  end

  it "supports named params like /hello/:person" do
    mock_app {
      get '/hello/:person' do
        "Hello #{params['person']}"
      end
    }
    get '/hello/Frank'
    assert_equal 'Hello Frank', body
  end

  it "supports optional named params like /?:foo?/?:bar?" do
    mock_app {
      get '/?:foo?/?:bar?' do
        "foo=#{params[:foo]};bar=#{params[:bar]}"
      end
    }

    get '/hello/world'
    assert ok?
    assert_equal "foo=hello;bar=world", body

    get '/hello'
    assert ok?
    assert_equal "foo=hello;bar=", body

    get '/'
    assert ok?
    assert_equal "foo=;bar=", body
  end

  it "supports single splat params like /*" do
    mock_app {
      get '/*' do
        assert params['splat'].kind_of?(Array)
        params['splat'].join "\n"
      end
    }

    get '/foo'
    assert_equal "foo", body

    get '/foo/bar/baz'
    assert_equal "foo/bar/baz", body
  end

  it "supports mixing multiple splat params like /*/foo/*/*" do
    mock_app {
      get '/*/foo/*/*' do
        assert params['splat'].kind_of?(Array)
        params['splat'].join "\n"
      end
    }

    get '/bar/foo/bling/baz/boom'
    assert_equal "bar\nbling\nbaz/boom", body

    get '/bar/foo/baz'
    assert not_found?
  end

  it "supports mixing named and splat params like /:foo/*" do
    mock_app {
      get '/:foo/*' do
        assert_equal 'foo', params['foo']
        assert_equal ['bar/baz'], params['splat']
      end
    }

    get '/foo/bar/baz'
    assert ok?
  end

  it "matches a dot ('.') as part of a named param" do
    mock_app {
      get '/:foo/:bar' do
        params[:foo]
      end
    }

    get '/user@example.com/name'
    assert_equal 200, response.status
    assert_equal 'user@example.com', body
  end

  it "matches a literal dot ('.') outside of named params" do
    mock_app {
      get '/:file.:ext' do
        assert_equal 'pony', params[:file]
        assert_equal 'jpg', params[:ext]
        'right on'
      end
    }

    get '/pony.jpg'
    assert_equal 200, response.status
    assert_equal 'right on', body
  end

  it "literally matches . in paths" do
    route_def '/test.bar'

    get '/test.bar'
    assert ok?
    get 'test0bar'
    assert not_found?
  end

  it "literally matches $ in paths" do
    route_def '/test$/'

    get '/test$/'
    assert ok?
  end

  it "literally matches + in paths" do
    route_def '/te+st/'

    get '/te%2Bst/'
    assert ok?
    get '/teeeeeeest/'
    assert not_found?
  end

  it "literally matches () in paths" do
    route_def '/test(bar)/'

    get '/test(bar)/'
    assert ok?
  end

  it "supports basic nested params" do
    mock_app {
      get '/hi' do
        params["person"]["name"]
      end
    }

    get "/hi?person[name]=John+Doe"
    assert ok?
    assert_equal "John Doe", body
  end

  it "exposes nested params with indifferent hash" do
    mock_app {
      get '/testme' do
        assert_equal 'baz', params['bar']['foo']
        assert_equal 'baz', params['bar'][:foo]
        'well, alright'
      end
    }
    get '/testme?bar[foo]=baz'
    assert_equal 'well, alright', body
  end

  it "supports deeply nested params" do
    expected_params = {
      "emacs" => {
        "map"     => { "goto-line" => "M-g g" },
        "version" => "22.3.1"
      },
      "browser" => {
        "firefox" => {"engine" => {"name"=>"spidermonkey", "version"=>"1.7.0"}},
        "chrome"  => {"engine" => {"name"=>"V8", "version"=>"1.0"}}
      },
      "paste" => {"name"=>"hello world", "syntax"=>"ruby"}
    }
    mock_app {
      get '/foo' do
        assert_equal expected_params, params
        'looks good'
      end
    }
    get '/foo', expected_params
    assert ok?
    assert_equal 'looks good', body
  end

  it "preserves non-nested params" do
    mock_app {
      get '/foo' do
        assert_equal "2", params["article_id"]
        assert_equal "awesome", params['comment']['body']
        assert_nil params['comment[body]']
        'looks good'
      end
    }

    get '/foo?article_id=2&comment[body]=awesome'
    assert ok?
    assert_equal 'looks good', body
  end

  it "matches paths that include spaces encoded with %20" do
    mock_app {
      get '/path with spaces' do
        'looks good'
      end
    }

    get '/path%20with%20spaces'
    assert ok?
    assert_equal 'looks good', body
  end

  it "matches paths that include spaces encoded with +" do
    mock_app {
      get '/path with spaces' do
        'looks good'
      end
    }

    get '/path+with+spaces'
    assert ok?
    assert_equal 'looks good', body
  end

  it "URL decodes named parameters and splats" do
    mock_app {
      get '/:foo/*' do
        assert_equal 'hello world', params['foo']
        assert_equal ['how are you'], params['splat']
        nil
      end
    }

    get '/hello%20world/how%20are%20you'
    assert ok?
  end

  it 'supports regular expressions' do
    mock_app {
      get(/^\/foo...\/bar$/) do
        'Hello World'
      end
    }

    get '/foooom/bar'
    assert ok?
    assert_equal 'Hello World', body
  end

  it 'makes regular expression captures available in params[:captures]' do
    mock_app {
      get(/^\/fo(.*)\/ba(.*)/) do
        assert_equal ['orooomma', 'f'], params[:captures]
        'right on'
      end
    }

    get '/foorooomma/baf'
    assert ok?
    assert_equal 'right on', body
  end

  it 'supports regular expression look-alike routes' do
    mock_app {
      get(RegexpLookAlike.new) do
        assert_equal 'this', params[:one]
        assert_equal 'is', params[:two]
        assert_equal 'a', params[:three]
        assert_equal 'test', params[:four]
        'right on'
      end
    }

    get '/this/is/a/test/'
    assert ok?
    assert_equal 'right on', body
  end

  it 'raises a TypeError when pattern is not a String or Regexp' do
    assert_raise(TypeError) {
      mock_app { get(42){} }
    }
  end

  it "returns response immediately on halt" do
    mock_app {
      get '/' do
        halt 'Hello World'
        'Boo-hoo World'
      end
    }

    get '/'
    assert ok?
    assert_equal 'Hello World', body
  end

  it "halts with a response tuple" do
    mock_app {
      get '/' do
        halt 295, {'Content-Type' => 'text/plain'}, 'Hello World'
      end
    }

    get '/'
    assert_equal 295, status
    assert_equal 'text/plain', response['Content-Type']
    assert_equal 'Hello World', body
  end

  it "halts with an array of strings" do
    mock_app {
      get '/' do
        halt %w[Hello World How Are You]
      end
    }

    get '/'
    assert_equal 'HelloWorldHowAreYou', body
  end

  it "transitions to the next matching route on pass" do
    mock_app {
      get '/:foo' do
        pass
        'Hello Foo'
      end

      get '/*' do
        assert !params.include?('foo')
        'Hello World'
      end
    }

    get '/bar'
    assert ok?
    assert_equal 'Hello World', body
  end

  it "transitions to 404 when passed and no subsequent route matches" do
    mock_app {
      get '/:foo' do
        pass
        'Hello Foo'
      end
    }

    get '/bar'
    assert not_found?
  end

  it "passes when matching condition returns false" do
    mock_app {
      condition { params[:foo] == 'bar' }
      get '/:foo' do
        'Hello World'
      end
    }

    get '/bar'
    assert ok?
    assert_equal 'Hello World', body

    get '/foo'
    assert not_found?
  end

  it "does not pass when matching condition returns nil" do
    mock_app {
      condition { nil }
      get '/:foo' do
        'Hello World'
      end
    }

    get '/bar'
    assert ok?
    assert_equal 'Hello World', body
  end

  it "passes to next route when condition calls pass explicitly" do
    mock_app {
      condition { pass unless params[:foo] == 'bar' }
      get '/:foo' do
        'Hello World'
      end
    }

    get '/bar'
    assert ok?
    assert_equal 'Hello World', body

    get '/foo'
    assert not_found?
  end

  it "passes to the next route when host_name does not match" do
    mock_app {
      host_name 'example.com'
      get '/foo' do
        'Hello World'
      end
    }
    get '/foo'
    assert not_found?

    get '/foo', {}, { 'HTTP_HOST' => 'example.com' }
    assert_equal 200, status
    assert_equal 'Hello World', body
  end

  it "passes to the next route when user_agent does not match" do
    mock_app {
      user_agent(/Foo/)
      get '/foo' do
        'Hello World'
      end
    }
    get '/foo'
    assert not_found?

    get '/foo', {}, { 'HTTP_USER_AGENT' => 'Foo Bar' }
    assert_equal 200, status
    assert_equal 'Hello World', body
  end

  it "makes captures in user agent pattern available in params[:agent]" do
    mock_app {
      user_agent(/Foo (.*)/)
      get '/foo' do
        'Hello ' + params[:agent].first
      end
    }
    get '/foo', {}, { 'HTTP_USER_AGENT' => 'Foo Bar' }
    assert_equal 200, status
    assert_equal 'Hello Bar', body
  end

  it "filters by accept header" do
    mock_app {
      get '/', :provides => :xml do
        request.env['HTTP_ACCEPT']
      end
    }

    get '/', {}, { 'HTTP_ACCEPT' => 'application/xml' }
    assert ok?
    assert_equal 'application/xml', body
    assert_equal 'application/xml', response.headers['Content-Type']

    get '/', {}, { :accept => 'text/html' }
    assert !ok?
  end

  it "allows multiple mime types for accept header" do
    types = ['image/jpeg', 'image/pjpeg']

    mock_app {
      get '/', :provides => types do
        request.env['HTTP_ACCEPT']
      end
    }

    types.each do |type|
      get '/', {}, { 'HTTP_ACCEPT' => type }
      assert ok?
      assert_equal type, body
      assert_equal type, response.headers['Content-Type']
    end
  end

  it 'degrades gracefully when optional accept header is not provided' do
    mock_app {
      get '/', :provides => :xml do
        request.env['HTTP_ACCEPT']
      end
      get '/' do
        'default'
      end
    }
    get '/'
    assert ok?
    assert_equal 'default', body
  end

  it 'passes a single url param as block parameters when one param is specified' do
    mock_app {
      get '/:foo' do |foo|
        assert_equal 'bar', foo
      end
    }

    get '/bar'
    assert ok?
  end

  it 'passes multiple params as block parameters when many are specified' do
    mock_app {
      get '/:foo/:bar/:baz' do |foo, bar, baz|
        assert_equal 'abc', foo
        assert_equal 'def', bar
        assert_equal 'ghi', baz
      end
    }

    get '/abc/def/ghi'
    assert ok?
  end

  it 'passes regular expression captures as block parameters' do
    mock_app {
      get(/^\/fo(.*)\/ba(.*)/) do |foo, bar|
        assert_equal 'orooomma', foo
        assert_equal 'f', bar
        'looks good'
      end
    }

    get '/foorooomma/baf'
    assert ok?
    assert_equal 'looks good', body
  end

  it "supports mixing multiple splat params like /*/foo/*/* as block parameters" do
    mock_app {
      get '/*/foo/*/*' do |foo, bar, baz|
        assert_equal 'bar', foo
        assert_equal 'bling', bar
        assert_equal 'baz/boom', baz
        'looks good'
      end
    }

    get '/bar/foo/bling/baz/boom'
    assert ok?
    assert_equal 'looks good', body
  end

  it 'raises an ArgumentError with block arity > 1 and too many values' do
    mock_app {
      get '/:foo/:bar/:baz' do |foo, bar|
        'quux'
      end
    }

    assert_raise(ArgumentError) { get '/a/b/c' }
  end

  it 'raises an ArgumentError with block param arity > 1 and too few values' do
    mock_app {
      get '/:foo/:bar' do |foo, bar, baz|
        'quux'
      end
    }

    assert_raise(ArgumentError) { get '/a/b' }
  end

  it 'succeeds if no block parameters are specified' do
    mock_app {
      get '/:foo/:bar' do
        'quux'
      end
    }

    get '/a/b'
    assert ok?
    assert_equal 'quux', body
  end

  it 'passes all params with block param arity -1 (splat args)' do
    mock_app {
      get '/:foo/:bar' do |*args|
        args.join
      end
    }

    get '/a/b'
    assert ok?
    assert_equal 'ab', body
  end

  it 'allows custom route-conditions to be set via route options' do
    protector = Module.new {
      def protect(*args)
        condition {
          unless authorize(params["user"], params["password"])
            halt 403, "go away"
          end
        }
      end
    }

    mock_app {
      register protector

      helpers do
        def authorize(username, password)
          username == "foo" && password == "bar"
        end
      end

      get "/", :protect => true do
        "hey"
      end
    }

    get "/"
    assert forbidden?
    assert_equal "go away", body

    get "/", :user => "foo", :password => "bar"
    assert ok?
    assert_equal "hey", body
  end

  # NOTE Block params behaves differently under 1.8 and 1.9. Under 1.8, block
  # param arity is lax: declaring a mismatched number of block params results
  # in a warning. Under 1.9, block param arity is strict: mismatched block
  # arity raises an ArgumentError.

  if RUBY_VERSION >= '1.9'

    it 'raises an ArgumentError with block param arity 1 and no values' do
      mock_app {
        get '/foo' do |foo|
          'quux'
        end
      }

      assert_raise(ArgumentError) { get '/foo' }
    end

    it 'raises an ArgumentError with block param arity 1 and too many values' do
      mock_app {
        get '/:foo/:bar/:baz' do |foo|
          'quux'
        end
      }

      assert_raise(ArgumentError) { get '/a/b/c' }
    end

  else

    it 'does not raise an ArgumentError with block param arity 1 and no values' do
      mock_app {
        get '/foo' do |foo|
          'quux'
        end
      }

      silence_warnings { get '/foo' }
      assert ok?
      assert_equal 'quux', body
    end

    it 'does not raise an ArgumentError with block param arity 1 and too many values' do
      mock_app {
        get '/:foo/:bar/:baz' do |foo|
          'quux'
        end
      }

      silence_warnings { get '/a/b/c' }
      assert ok?
      assert_equal 'quux', body
    end

  end
end
