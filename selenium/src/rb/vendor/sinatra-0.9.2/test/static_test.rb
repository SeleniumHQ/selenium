require File.dirname(__FILE__) + '/helper'

class StaticTest < Test::Unit::TestCase
  setup do
    mock_app {
      set :static, true
      set :public, File.dirname(__FILE__)
    }
  end

  it 'serves GET requests for files in the public directory' do
    get "/#{File.basename(__FILE__)}"
    assert ok?
    assert_equal File.read(__FILE__), body
    assert_equal File.size(__FILE__).to_s, response['Content-Length']
    assert response.headers.include?('Last-Modified')
  end

  it 'produces a body that can be iterated over multiple times' do
    env = Rack::MockRequest.env_for("/#{File.basename(__FILE__)}")
    status, headers, body = @app.call(env)
    buf1, buf2 = [], []
    body.each { |part| buf1 << part }
    body.each { |part| buf2 << part }
    assert_equal buf1.join, buf2.join
    assert_equal File.read(__FILE__), buf1.join
  end

  it 'serves HEAD requests for files in the public directory' do
    head "/#{File.basename(__FILE__)}"
    assert ok?
    assert_equal '', body
    assert_equal File.size(__FILE__).to_s, response['Content-Length']
    assert response.headers.include?('Last-Modified')
  end

  it 'serves files in preference to custom routes' do
    @app.get("/#{File.basename(__FILE__)}") { 'Hello World' }
    get "/#{File.basename(__FILE__)}"
    assert ok?
    assert body != 'Hello World'
  end

  it 'does not serve directories' do
    get "/"
    assert not_found?
  end

  it 'passes to the next handler when the static option is disabled' do
    @app.set :static, false
    get "/#{File.basename(__FILE__)}"
    assert not_found?
  end

  it 'passes to the next handler when the public option is nil' do
    @app.set :public, nil
    get "/#{File.basename(__FILE__)}"
    assert not_found?
  end

  it '404s when a file is not found' do
    get "/foobarbaz.txt"
    assert not_found?
  end

  it 'serves files when .. path traverses within public directory' do
    get "/data/../#{File.basename(__FILE__)}"
    assert ok?
    assert_equal File.read(__FILE__), body
  end

  it '404s when .. path traverses outside of public directory' do
    mock_app {
      set :static, true
      set :public, File.dirname(__FILE__) + '/data'
    }
    get "/../#{File.basename(__FILE__)}"
    assert not_found?
  end
end
