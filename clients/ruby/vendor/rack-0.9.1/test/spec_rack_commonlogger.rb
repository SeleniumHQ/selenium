require 'test/spec'
require 'stringio'

require 'rack/commonlogger'
require 'rack/lobster'
require 'rack/mock'

context "Rack::CommonLogger" do
  app = lambda { |env|
    [200,
     {"Content-Type" => "text/html"},
     ["foo"]]}

  specify "should log to rack.errors by default" do
    log = StringIO.new
    res = Rack::MockRequest.new(Rack::CommonLogger.new(app)).get("/")

    res.errors.should.not.be.empty
    res.errors.should =~ /GET /
    res.errors.should =~ / 200 / # status
    res.errors.should =~ / 3 /   # length
  end

  specify "should log to anything with <<" do
    log = ""
    res = Rack::MockRequest.new(Rack::CommonLogger.new(app, log)).get("/")

    log.should =~ /GET /
    log.should =~ / 200 / # status
    log.should =~ / 3 / # length
  end
end
