require 'test/spec'

require 'rack/static'
require 'rack/mock'

class DummyApp
  def call(env)
    [200, {}, ["Hello World"]]
  end
end

context "Rack::Static" do
  root = File.expand_path(File.dirname(__FILE__))
  OPTIONS = {:urls => ["/cgi"], :root => root}

  setup do
    @request = Rack::MockRequest.new(Rack::Static.new(DummyApp.new, OPTIONS))
  end

  specify "serves files" do
    res = @request.get("/cgi/test")
    res.should.be.ok
    res.body.should =~ /ruby/
  end

  specify "404s if url root is known but it can't find the file" do
    res = @request.get("/cgi/foo")
    res.should.be.not_found
  end

  specify "calls down the chain if url root is not known" do
    res = @request.get("/something/else")
    res.should.be.ok
    res.body.should == "Hello World"
  end

end
