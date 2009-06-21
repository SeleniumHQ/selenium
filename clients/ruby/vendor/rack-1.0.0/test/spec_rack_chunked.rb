require 'rack/mock'
require 'rack/chunked'
require 'rack/utils'

context "Rack::Chunked" do

  before do
    @env = Rack::MockRequest.
      env_for('/', 'HTTP_VERSION' => '1.1', 'REQUEST_METHOD' => 'GET')
  end

  specify 'chunks responses with no Content-Length' do
    app = lambda { |env| [200, {}, ['Hello', ' ', 'World!']] }
    response = Rack::MockResponse.new(*Rack::Chunked.new(app).call(@env))
    response.headers.should.not.include 'Content-Length'
    response.headers['Transfer-Encoding'].should.equal 'chunked'
    response.body.should.equal "5\r\nHello\r\n1\r\n \r\n6\r\nWorld!\r\n0\r\n\r\n"
  end

  specify 'chunks empty bodies properly' do
    app = lambda { |env| [200, {}, []] }
    response = Rack::MockResponse.new(*Rack::Chunked.new(app).call(@env))
    response.headers.should.not.include 'Content-Length'
    response.headers['Transfer-Encoding'].should.equal 'chunked'
    response.body.should.equal "0\r\n\r\n"
  end

  specify 'does not modify response when Content-Length header present' do
    app = lambda { |env| [200, {'Content-Length'=>'12'}, ['Hello', ' ', 'World!']] }
    status, headers, body = Rack::Chunked.new(app).call(@env)
    status.should.equal 200
    headers.should.not.include 'Transfer-Encoding'
    headers.should.include 'Content-Length'
    body.join.should.equal 'Hello World!'
  end

  specify 'does not modify response when client is HTTP/1.0' do
    app = lambda { |env| [200, {}, ['Hello', ' ', 'World!']] }
    @env['HTTP_VERSION'] = 'HTTP/1.0'
    status, headers, body = Rack::Chunked.new(app).call(@env)
    status.should.equal 200
    headers.should.not.include 'Transfer-Encoding'
    body.join.should.equal 'Hello World!'
  end

  specify 'does not modify response when Transfer-Encoding header already present' do
    app = lambda { |env| [200, {'Transfer-Encoding' => 'identity'}, ['Hello', ' ', 'World!']] }
    status, headers, body = Rack::Chunked.new(app).call(@env)
    status.should.equal 200
    headers['Transfer-Encoding'].should.equal 'identity'
    body.join.should.equal 'Hello World!'
  end

  [100, 204, 304].each do |status_code|
    specify "does not modify response when status code is #{status_code}" do
      app = lambda { |env| [status_code, {}, []] }
      status, headers, body = Rack::Chunked.new(app).call(@env)
      status.should.equal status_code
      headers.should.not.include 'Transfer-Encoding'
    end
  end
end
