require 'test/spec'

begin
require 'rack/handler/thin'
require 'testrequest'
require 'timeout'
  
context "Rack::Handler::Thin" do
  include TestRequest::Helpers
  
  setup do
    @app = Rack::Lint.new(TestRequest.new)
    @server = nil
    Thin::Logging.silent = true
    @thread = Thread.new do
      Rack::Handler::Thin.run(@app, :Host => @host='0.0.0.0', :Port => @port=9204) do |server|
        @server = server
      end
    end
    Thread.pass until @server && @server.running?
  end

  specify "should respond" do
    lambda {
      GET("/")
    }.should.not.raise
  end

  specify "should be a Thin" do
    GET("/")
    status.should.be 200
    response["SERVER_SOFTWARE"].should =~ /thin/
    response["HTTP_VERSION"].should.equal "HTTP/1.1"
    response["SERVER_PROTOCOL"].should.equal "HTTP/1.1"
    response["SERVER_PORT"].should.equal "9204"
    response["SERVER_NAME"].should.equal "0.0.0.0"
  end

  specify "should have rack headers" do
    GET("/")
    response["rack.version"].should.equal [0,3]
    response["rack.multithread"].should.be false
    response["rack.multiprocess"].should.be false
    response["rack.run_once"].should.be false
  end

  specify "should have CGI headers on GET" do
    GET("/")
    response["REQUEST_METHOD"].should.equal "GET"
    response["REQUEST_PATH"].should.equal "/"
    response["PATH_INFO"].should.be.equal "/"
    response["QUERY_STRING"].should.equal ""
    response["test.postdata"].should.equal ""

    GET("/test/foo?quux=1")
    response["REQUEST_METHOD"].should.equal "GET"
    response["REQUEST_PATH"].should.equal "/test/foo"
    response["PATH_INFO"].should.equal "/test/foo"
    response["QUERY_STRING"].should.equal "quux=1"
  end

  specify "should have CGI headers on POST" do
    POST("/", {"rack-form-data" => "23"}, {'X-test-header' => '42'})
    status.should.equal 200
    response["REQUEST_METHOD"].should.equal "POST"
    response["REQUEST_PATH"].should.equal "/"
    response["QUERY_STRING"].should.equal ""
    response["HTTP_X_TEST_HEADER"].should.equal "42"
    response["test.postdata"].should.equal "rack-form-data=23"
  end

  specify "should support HTTP auth" do
    GET("/test", {:user => "ruth", :passwd => "secret"})
    response["HTTP_AUTHORIZATION"].should.equal "Basic cnV0aDpzZWNyZXQ="
  end

  specify "should set status" do
    GET("/test?secret")
    status.should.equal 403
    response["rack.url_scheme"].should.equal "http"
  end

  teardown do
    @server.stop!
    @thread.kill
  end
end

rescue LoadError
  $stderr.puts "Skipping Rack::Handler::Thin tests (Thin is required). `gem install thin` and try again."
end
