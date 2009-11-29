require File.dirname(__FILE__) + '/helper'

context "before filters" do

  setup do
    Sinatra.application = nil
    @app = Sinatra.application
  end

  specify "should be executed in the order defined" do
    invoked = 0x0
    @app.before { invoked = 0x01 }
    @app.before { invoked |= 0x02 }
    @app.get('/') { 'Hello World' }
    get_it '/'
    should.be.ok
    body.should.be == 'Hello World'
    invoked.should.be == 0x03
  end

  specify "should be capable of modifying the request" do
    @app.get('/foo') { 'foo' }
    @app.get('/bar') { 'bar' }
    @app.before { request.path_info = '/bar' }
    get_it '/foo'
    should.be.ok
    body.should.be == 'bar'
  end

end
