require File.dirname(__FILE__) + '/helper'

describe 'Sinatra::Base' do
  it 'includes Rack::Utils' do
    assert Sinatra::Base.included_modules.include?(Rack::Utils)
  end

  it 'can be used as a Rack application' do
    mock_app {
      get '/' do
        'Hello World'
      end
    }
    assert @app.respond_to?(:call)

    request = Rack::MockRequest.new(@app)
    response = request.get('/')
    assert response.ok?
    assert_equal 'Hello World', response.body
  end

  it 'can be used as Rack middleware' do
    app = lambda { |env| [200, {}, ['Goodbye World']] }
    mock_middleware =
      mock_app {
        get '/' do
          'Hello World'
        end
        get '/goodbye' do
          @app.call(request.env)
        end
      }
    middleware = mock_middleware.new(app)
    assert_same app, middleware.app

    request = Rack::MockRequest.new(middleware)
    response = request.get('/')
    assert response.ok?
    assert_equal 'Hello World', response.body

    response = request.get('/goodbye')
    assert response.ok?
    assert_equal 'Goodbye World', response.body
  end

  it 'can take multiple definitions of a route' do
    app = mock_app {
      user_agent(/Foo/)
      get '/foo' do
        'foo'
      end

      get '/foo' do
        'not foo'
      end
    }

    request = Rack::MockRequest.new(app)
    response = request.get('/foo', 'HTTP_USER_AGENT' => 'Foo')
    assert response.ok?
    assert_equal 'foo', response.body

    request = Rack::MockRequest.new(app)
    response = request.get('/foo')
    assert response.ok?
    assert_equal 'not foo', response.body
  end
end
