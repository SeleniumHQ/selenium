require 'test/spec'

require 'rack/directory'
require 'rack/lint'

require 'rack/mock'

context "Rack::Directory" do
  DOCROOT = File.expand_path(File.dirname(__FILE__))
  FILE_CATCH = proc{|env| [200, {'Content-Type'=>'text/plain', "Content-Length" => "7"}, 'passed!'] }
  app = Rack::Directory.new DOCROOT, FILE_CATCH

  specify "serves directory indices" do
    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/")

    res.should.be.ok
    res.should =~ /<html><head>/
  end

  specify "passes to app if file found" do
    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/test")

    res.should.be.ok
    res.should =~ /passed!/
  end

  specify "serves uri with URL encoded filenames" do
    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/%63%67%69/") # "/cgi/test"

    res.should.be.ok
    res.should =~ /<html><head>/

    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/%74%65%73%74") # "/cgi/test"

    res.should.be.ok
    res.should =~ /passed!/
  end

  specify "does not allow directory traversal" do
    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/../test")

    res.should.be.forbidden

    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/%2E%2E/test")

    res.should.be.forbidden
  end

  specify "404s if it can't find the file" do
    res = Rack::MockRequest.new(Rack::Lint.new(app)).
      get("/cgi/blubb")

    res.should.be.not_found
  end
end
