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

  specify "should get unregistered handler by name" do
    Rack::Handler.get('lobster').should.equal Rack::Handler::Lobster
  end

  specify "should register custom handler" do
    Rack::Handler.register('rock_lobster', 'RockLobster')
    Rack::Handler.get('rock_lobster').should.equal RockLobster
  end
end
