require 'test/spec'

require 'rack/mock'
require 'rack/methodoverride'
require 'stringio'

context "Rack::MethodOverride" do
  specify "should not affect GET requests" do
    env = Rack::MockRequest.env_for("/?_method=delete", :method => "GET")
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["REQUEST_METHOD"].should.equal "GET"
  end

  specify "_method parameter should modify REQUEST_METHOD for POST requests" do
    env = Rack::MockRequest.env_for("/", :method => "POST", :input => "_method=put")
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["REQUEST_METHOD"].should.equal "PUT"
  end

  specify "X-HTTP-Method-Override header should modify REQUEST_METHOD for POST requests" do
    env = Rack::MockRequest.env_for("/",
            :method => "POST",
            "HTTP_X_HTTP_METHOD_OVERRIDE" => "PUT"
          )
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["REQUEST_METHOD"].should.equal "PUT"
  end

  specify "should not modify REQUEST_METHOD if the method is unknown" do
    env = Rack::MockRequest.env_for("/", :method => "POST", :input => "_method=foo")
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["REQUEST_METHOD"].should.equal "POST"
  end

  specify "should not modify REQUEST_METHOD when _method is nil" do
    env = Rack::MockRequest.env_for("/", :method => "POST", :input => "foo=bar")
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["REQUEST_METHOD"].should.equal "POST"
  end

  specify "should store the original REQUEST_METHOD prior to overriding" do
    env = Rack::MockRequest.env_for("/",
            :method => "POST",
            :input  => "_method=options")
    app = Rack::MethodOverride.new(lambda { |env| Rack::Request.new(env) })
    req = app.call(env)

    req.env["rack.methodoverride.original_method"].should.equal "POST"
  end
end
