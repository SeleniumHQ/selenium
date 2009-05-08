require File.dirname(__FILE__) + '/helper'

describe "Routing" do
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
    input = {
      'browser[chrome][engine][name]' => 'V8',
      'browser[chrome][engine][version]' => '1.0',
      'browser[firefox][engine][name]' => 'spidermonkey',
      'browser[firefox][engine][version]' => '1.7.0',
      'emacs[map][goto-line]' => 'M-g g',
      'emacs[version]' => '22.3.1',
      'paste[name]' => 'hello world',
      'paste[syntax]' => 'ruby'
    }
    expected = {
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
        assert_equal expected, params
        'looks good'
      end
    }
    get "/foo?#{param_string(input)}"
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

  it "supports paths that include spaces" do
    mock_app {
      get '/path with spaces' do
        'looks good'
      end
    }

    get '/path%20with%20spaces'
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

    get '/foo', :env => { 'HTTP_HOST' => 'example.com' }
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

    get '/foo', :env => { 'HTTP_USER_AGENT' => 'Foo Bar' }
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
    get '/foo', :env => { 'HTTP_USER_AGENT' => 'Foo Bar' }
    assert_equal 200, status
    assert_equal 'Hello Bar', body
  end

  it "filters by accept header" do
    mock_app {
      get '/', :provides => :xml do
        request.env['HTTP_ACCEPT']
      end
    }

    get '/', :env => { :accept => 'application/xml' }
    assert ok?
    assert_equal 'application/xml', body
    assert_equal 'application/xml', response.headers['Content-Type']

    get '/', :env => { :accept => 'text/html' }
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
      get '/', :env => { :accept => type }
      assert ok?
      assert_equal type, body
      assert_equal type, response.headers['Content-Type']
    end
  end
end
