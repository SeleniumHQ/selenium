require File.dirname(__FILE__) + '/helper'

require 'uri'

class TesterWithEach
  def each
    yield 'foo'
    yield 'bar'
    yield 'baz'
  end
end

context "Looking up a request" do

  setup do
    Sinatra.application = nil
  end

  # Deprecated. The lookup method is no longer used.
  xspecify "returns what's at the end" do
    block = Proc.new { 'Hello' }
    get '/', &block

    result = Sinatra.application.lookup(
      Rack::Request.new(
        'REQUEST_METHOD' => 'GET',
        'PATH_INFO' => '/'
      )
    )

    result.should.not.be.nil
    result.block.should.be block
  end

  # Deprecated. The lookup method is no longer used.
  xspecify "takes params in path" do
    block = Proc.new { 'Hello' }
    get '/:foo', &block

    result = Sinatra.application.lookup(
      Rack::Request.new(
        'REQUEST_METHOD' => 'GET',
        'PATH_INFO' => '/bar'
      )
    )

    result.should.not.be.nil
    result.block.should.be block
    result.params.should.equal "foo" => 'bar'
  end

end

context "An app returns" do

  setup do
    Sinatra.application = nil
  end

  specify "404 if no events found" do
    request = Rack::MockRequest.new(@app)
    get_it '/'
    should.be.not_found
    body.should.equal '<h1>Not Found</h1>'
  end

  specify "200 if success" do
    get '/' do
      'Hello World'
    end
    get_it '/'
    should.be.ok
    body.should.equal 'Hello World'
  end

  specify "an objects result from each if it has it" do

    get '/' do
      TesterWithEach.new
    end

    get_it '/'
    should.be.ok
    body.should.equal 'foobarbaz'

  end

  # Deprecated. The body method no longer halts.
  xspecify "the body set if set before the last" do

    get '/' do
      body 'Blake'
      'Mizerany'
    end

    get_it '/'
    should.be.ok
    body.should.equal 'Blake'

  end

  specify "404 if NotFound is raised" do

    get '/' do
      raise Sinatra::NotFound
    end

    get_it '/'
    should.be.not_found

  end

end

context "Application#configure blocks" do

  setup do
    Sinatra.application = nil
  end

  specify "run when no environment specified" do
    ref = false
    configure { ref = true }
    ref.should.equal true
  end

  specify "run when matching environment specified" do
    ref = false
    configure(:test) { ref = true }
    ref.should.equal true
  end

  specify "do not run when no matching environment specified" do
    configure(:foo) { flunk "block should not have been executed" }
    configure(:development, :production, :foo) { flunk "block should not have been executed" }
  end

  specify "accept multiple environments" do
    ref = false
    configure(:foo, :test, :bar) { ref = true }
    ref.should.equal true
  end

end

context "Default Application Configuration" do

  # Sinatra::ServerError is no longer used
  xspecify "includes 404 and 500 error handlers" do
    Sinatra.application.errors.should.include(Sinatra::ServerError)
    Sinatra.application.errors[Sinatra::ServerError].should.not.be.nil
    Sinatra.application.errors.should.include(Sinatra::NotFound)
    Sinatra.application.errors[Sinatra::NotFound].should.not.be.nil
  end

  # Deprecated. No such thing as a Static event anymore.
  xspecify "includes Static event" do
    assert Sinatra.application.events[:get].any? { |e| Sinatra::Static === e }
  end

end

context "Events in an app" do

  setup do
    Sinatra.application = nil
  end

  specify "evaluate in a clean context" do
    helpers do
      def foo
        'foo'
      end
    end

    get '/foo' do
      foo
    end

    get_it '/foo'
    should.be.ok
    body.should.equal 'foo'
  end

  specify "get access to request, response, and params" do
    get '/:foo' do
      params["foo"] + params["bar"]
    end

    get_it '/foo?bar=baz'
    should.be.ok
    body.should.equal 'foobaz'
  end

  specify "can filters by agent" do

    get '/', :agent => /Windows/ do
      request.env['HTTP_USER_AGENT']
    end

    get_it '/', :env => { :agent => 'Windows' }
    should.be.ok
    body.should.equal 'Windows'

    get_it '/', :env => { :agent => 'Mac' }
    should.not.be.ok

  end

  specify "can use regex to get parts of user-agent" do

    get '/', :agent => /Windows (NT)/ do
      params[:agent].first
    end

    get_it '/', :env => { :agent => 'Windows NT' }

    body.should.equal 'NT'

  end

  specify "can deal with spaces in paths" do

    path = '/path with spaces'

    get path do
      "Look ma, a path with spaces!"
    end

    get_it URI.encode(path)

    body.should.equal "Look ma, a path with spaces!"
  end

  specify "route based on host" do

    get '/' do
      'asdf'
    end

    get_it '/'
    assert ok?
    assert_equal('asdf', body)

    get '/foo', :host => 'foo.sinatrarb.com' do
      'in foo!'
    end

    get '/foo', :host => 'bar.sinatrarb.com'  do
      'in bar!'
    end

    get_it '/foo', {}, 'HTTP_HOST' => 'foo.sinatrarb.com'
    assert ok?
    assert_equal 'in foo!', body

    get_it '/foo', {}, 'HTTP_HOST' => 'bar.sinatrarb.com'
    assert ok?
    assert_equal 'in bar!', body

    get_it '/foo'
    assert not_found?

  end

end


context "Options in an app" do

  setup do
    Sinatra.application = nil
    @app = Sinatra::application
  end

  specify "can be set singly on app" do
    @app.set :foo, 1234
    @app.options.foo.should.equal 1234
  end

  specify "can be set singly from top-level" do
    set_option :foo, 1234
    @app.options.foo.should.equal 1234
  end

  specify "can be set multiply on app" do
    @app.options.foo.should.be.nil
    @app.set :foo => 1234,
      :bar => 'hello, world'
    @app.options.foo.should.equal 1234
    @app.options.bar.should.equal 'hello, world'
  end

  specify "can be set multiply from top-level" do
    @app.options.foo.should.be.nil
    set_options :foo => 1234,
      :bar => 'hello, world'
    @app.options.foo.should.equal 1234
    @app.options.bar.should.equal 'hello, world'
  end

  specify "can be enabled on app" do
    @app.options.foo.should.be.nil
    @app.enable :sessions, :foo, :bar
    @app.options.sessions.should.equal true
    @app.options.foo.should.equal true
    @app.options.bar.should.equal true
  end

  specify "can be enabled from top-level" do
    @app.options.foo.should.be.nil
    enable :sessions, :foo, :bar
    @app.options.sessions.should.equal true
    @app.options.foo.should.equal true
    @app.options.bar.should.equal true
  end

  specify "can be disabled on app" do
    @app.options.foo.should.be.nil
    @app.disable :sessions, :foo, :bar
    @app.options.sessions.should.equal false
    @app.options.foo.should.equal false
    @app.options.bar.should.equal false
  end

  specify "can be enabled from top-level" do
    @app.options.foo.should.be.nil
    disable :sessions, :foo, :bar
    @app.options.sessions.should.equal false
    @app.options.foo.should.equal false
    @app.options.bar.should.equal false
  end

end
