require 'test/spec'
require 'time'

require 'rack/mock'
require 'rack/conditionalget'

context "Rack::ConditionalGet" do
  specify "should set a 304 status and truncate body when If-Modified-Since hits" do
    timestamp = Time.now.httpdate
    app = Rack::ConditionalGet.new(lambda { |env|
      [200, {'Last-Modified'=>timestamp}, 'TEST'] })

    response = Rack::MockRequest.new(app).
      get("/", 'HTTP_IF_MODIFIED_SINCE' => timestamp)

    response.status.should.be == 304
    response.body.should.be.empty
  end

  specify "should set a 304 status and truncate body when If-None-Match hits" do
    app = Rack::ConditionalGet.new(lambda { |env|
      [200, {'Etag'=>'1234'}, 'TEST'] })

    response = Rack::MockRequest.new(app).
      get("/", 'HTTP_IF_NONE_MATCH' => '1234')

    response.status.should.be == 304
    response.body.should.be.empty
  end

  specify "should not affect non-GET/HEAD requests" do
    app = Rack::ConditionalGet.new(lambda { |env|
      [200, {'Etag'=>'1234'}, 'TEST'] })

    response = Rack::MockRequest.new(app).
      post("/", 'HTTP_IF_NONE_MATCH' => '1234')

    response.status.should.be == 200
    response.body.should.be == 'TEST'
  end
end
