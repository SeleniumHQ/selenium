require 'test/spec'

require 'rack/showexceptions'
require 'rack/mock'

context "Rack::ShowExceptions" do
  specify "catches exceptions" do
    res = nil
    req = Rack::MockRequest.new(Rack::ShowExceptions.new(lambda { |env|
                                                           raise RuntimeError
                                                         }))
    lambda {
      res = req.get("/")
    }.should.not.raise
    res.should.be.a.server_error
    res.status.should.equal 500

    res.should =~ /RuntimeError/
    res.should =~ /ShowExceptions/
  end
end
