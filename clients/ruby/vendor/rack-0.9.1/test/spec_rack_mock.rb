require 'yaml'
require 'rack/mock'
require 'rack/request'
require 'rack/response'

app = lambda { |env|
  req = Rack::Request.new(env)
  
  env["mock.postdata"] = env["rack.input"].read
  if req.GET["error"]
    env["rack.errors"].puts req.GET["error"]
    env["rack.errors"].flush
  end
  
  Rack::Response.new(env.to_yaml,
                     req.GET["status"] || 200,
                     "Content-Type" => "text/yaml").finish
}

context "Rack::MockRequest" do
  specify "should return a MockResponse" do
    res = Rack::MockRequest.new(app).get("")
    res.should.be.kind_of Rack::MockResponse
  end

  specify "should be able to only return the environment" do
    env = Rack::MockRequest.env_for("")
    env.should.be.kind_of Hash
    env.should.include "rack.version"
  end

  specify "should provide sensible defaults" do
    res = Rack::MockRequest.new(app).request

    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "GET"
    env["SERVER_NAME"].should.equal "example.org"
    env["SERVER_PORT"].should.equal "80"
    env["QUERY_STRING"].should.equal ""
    env["PATH_INFO"].should.equal "/"
    env["SCRIPT_NAME"].should.equal ""
    env["rack.url_scheme"].should.equal "http"
    env["mock.postdata"].should.be.empty
  end

  specify "should allow GET/POST/PUT/DELETE" do
    res = Rack::MockRequest.new(app).get("", :input => "foo")
    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "GET"

    res = Rack::MockRequest.new(app).post("", :input => "foo")
    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "POST"

    res = Rack::MockRequest.new(app).put("", :input => "foo")
    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "PUT"

    res = Rack::MockRequest.new(app).delete("", :input => "foo")
    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "DELETE"

    Rack::MockRequest.env_for("/", :method => "OPTIONS")["REQUEST_METHOD"].
      should.equal "OPTIONS"
  end

  specify "should allow posting" do
    res = Rack::MockRequest.new(app).get("", :input => "foo")
    env = YAML.load(res.body)
    env["mock.postdata"].should.equal "foo"

    res = Rack::MockRequest.new(app).post("", :input => StringIO.new("foo"))
    env = YAML.load(res.body)
    env["mock.postdata"].should.equal "foo"
  end

  specify "should use all parts of an URL" do
    res = Rack::MockRequest.new(app).
      get("https://bla.example.org:9292/meh/foo?bar")
    res.should.be.kind_of Rack::MockResponse

    env = YAML.load(res.body)
    env["REQUEST_METHOD"].should.equal "GET"
    env["SERVER_NAME"].should.equal "bla.example.org"
    env["SERVER_PORT"].should.equal "9292"
    env["QUERY_STRING"].should.equal "bar"
    env["PATH_INFO"].should.equal "/meh/foo"
    env["rack.url_scheme"].should.equal "https"
  end

  specify "should behave valid according to the Rack spec" do
    lambda {
      res = Rack::MockRequest.new(app).
        get("https://bla.example.org:9292/meh/foo?bar", :lint => true)
    }.should.not.raise(Rack::Lint::LintError)
  end
end

context "Rack::MockResponse" do
  specify "should provide access to the HTTP status" do
    res = Rack::MockRequest.new(app).get("")
    res.should.be.successful
    res.should.be.ok

    res = Rack::MockRequest.new(app).get("/?status=404")
    res.should.not.be.successful
    res.should.be.client_error
    res.should.be.not_found

    res = Rack::MockRequest.new(app).get("/?status=501")
    res.should.not.be.successful
    res.should.be.server_error

    res = Rack::MockRequest.new(app).get("/?status=307")
    res.should.be.redirect

    res = Rack::MockRequest.new(app).get("/?status=201", :lint => true)
    res.should.be.empty
  end

  specify "should provide access to the HTTP headers" do
    res = Rack::MockRequest.new(app).get("")
    res.should.include "Content-Type"
    res.headers["Content-Type"].should.equal "text/yaml"
    res.original_headers["Content-Type"].should.equal "text/yaml"
    res["Content-Type"].should.equal "text/yaml"
    res.content_type.should.equal "text/yaml"
    res.content_length.should.be 381  # needs change often.
    res.location.should.be.nil
  end

  specify "should provide access to the HTTP body" do
    res = Rack::MockRequest.new(app).get("")
    res.body.should =~ /rack/
    res.should =~ /rack/
    res.should.match(/rack/)
    res.should.satisfy { |r| r.match(/rack/) }
  end

  specify "should provide access to the Rack errors" do
    res = Rack::MockRequest.new(app).get("/?error=foo", :lint => true)
    res.should.be.ok
    res.errors.should.not.be.empty
    res.errors.should.include "foo"
  end

  specify "should optionally make Rack errors fatal" do
    lambda {
      Rack::MockRequest.new(app).get("/?error=foo", :fatal => true)
    }.should.raise(Rack::MockRequest::FatalWarning)
  end
end
