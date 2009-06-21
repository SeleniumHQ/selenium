require 'test/spec'

require 'rack/handler'

class Rack::Handler::Lobster; end
class RockLobster; end

context "Rack::Handler" do
  specify "has registered default handlers" do
    Rack::Handler.get('cgi').should.equal Rack::Handler::CGI
    Rack::Handler.get('fastcgi').should.equal Rack::Handler::FastCGI
    Rack::Handler.get('mongrel').should.equal Rack::Handler::Mongrel
    Rack::Handler.get('webrick').should.equal Rack::Handler::WEBrick
  end
  
  specify "handler that doesn't exist should raise a NameError" do
    lambda {
      Rack::Handler.get('boom')
    }.should.raise(NameError)
  end

  specify "should get unregistered, but already required, handler by name" do
    Rack::Handler.get('Lobster').should.equal Rack::Handler::Lobster
  end

  specify "should register custom handler" do
    Rack::Handler.register('rock_lobster', 'RockLobster')
    Rack::Handler.get('rock_lobster').should.equal RockLobster
  end
  
  specify "should not need registration for properly coded handlers even if not already required" do
    begin
      $:.push "test/unregistered_handler"
      Rack::Handler.get('Unregistered').should.equal Rack::Handler::Unregistered
      lambda {
        Rack::Handler.get('UnRegistered')
      }.should.raise(NameError)
      Rack::Handler.get('UnregisteredLongOne').should.equal Rack::Handler::UnregisteredLongOne
    ensure
      $:.delete "test/unregistered_handler"
    end
  end
end
