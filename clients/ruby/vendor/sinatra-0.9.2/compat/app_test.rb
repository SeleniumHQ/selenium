require File.dirname(__FILE__) + '/helper'

context "Sinatra" do

  setup do
    Sinatra.application = nil
  end

  specify "should put all DSL methods on (main)" do
    object = Object.new
    methods = %w[get put post head delete configure template helpers set]
    methods.each do |method|
      object.private_methods.map { |m| m.to_sym }.should.include(method.to_sym)
    end
  end

  specify "should handle result of nil" do
    get '/' do
      nil
    end

    get_it '/'
    should.be.ok
    body.should == ''
  end

  specify "handles events" do
    get '/:name' do
      'Hello ' + params["name"]
    end

    get_it '/Blake'

    should.be.ok
    body.should.equal 'Hello Blake'
  end


  specify "handles splats" do
    get '/hi/*' do
      params["splat"].kind_of?(Array).should.equal true
      params["splat"].first
    end

    get_it '/hi/Blake'

    should.be.ok
    body.should.equal 'Blake'
  end

  specify "handles multiple splats" do
    get '/say/*/to/*' do
      params["splat"].join(' ')
    end

    get_it '/say/hello/to/world'

    should.be.ok
    body.should.equal 'hello world'
  end

  specify "allow empty splats" do
    get '/say/*/to*/*' do
      params["splat"].join(' ')
    end

    get_it '/say/hello/to/world'

    should.be.ok
    body.should.equal 'hello  world' # second splat is empty

    get_it '/say/hello/tomy/world'

    should.be.ok
    body.should.equal 'hello my world'
  end

  specify "gives access to underlying response header Hash" do
    get '/' do
      header['X-Test'] = 'Is this thing on?'
      headers 'X-Test2' => 'Foo', 'X-Test3' => 'Bar'
      ''
    end

    get_it '/'
    should.be.ok
    headers.should.include 'X-Test'
    headers['X-Test'].should.equal 'Is this thing on?'
    headers.should.include 'X-Test3'
    headers['X-Test3'].should.equal 'Bar'
  end

  specify "follows redirects" do
    get '/' do
      redirect '/blake'
    end

    get '/blake' do
      'Mizerany'
    end

    get_it '/'
    should.be.redirection
    body.should.equal ''

    follow!
    should.be.ok
    body.should.equal 'Mizerany'
  end

  specify "renders a body with a redirect" do
    helpers do
      def foo ; 'blah' ; end
    end
    get "/" do
      redirect 'foo', :foo
    end
    get_it '/'
    should.be.redirection
    headers['Location'].should.equal 'foo'
    body.should.equal 'blah'
  end

  specify "redirects permanently with 301 status code" do
    get "/" do
      redirect 'foo', 301
    end
    get_it '/'
    should.be.redirection
    headers['Location'].should.equal 'foo'
    status.should.equal 301
    body.should.be.empty
  end

  specify "stop sets content and ends event" do
    get '/set_body' do
      stop 'Hello!'
      stop 'World!'
      fail 'stop should have halted'
    end

    get_it '/set_body'

    should.be.ok
    body.should.equal 'Hello!'

  end

  specify "should easily set response Content-Type" do
    get '/foo.html' do
      content_type 'text/html', :charset => 'utf-8'
      "<h1>Hello, World</h1>"
    end

    get_it '/foo.html'
    should.be.ok
    headers['Content-Type'].should.equal 'text/html;charset=utf-8'
    body.should.equal '<h1>Hello, World</h1>'

    get '/foo_test.xml' do
      content_type :xml
      "<feed></feed>"
    end

    get_it '/foo_test.xml'
    should.be.ok
    headers['Content-Type'].should.equal 'application/xml'
    body.should.equal '<feed></feed>'
  end

  specify "supports conditional GETs with last_modified" do
    modified_at = Time.now
    get '/maybe' do
      last_modified modified_at
      'response body, maybe'
    end

    get_it '/maybe'
    should.be.ok
    body.should.equal 'response body, maybe'

    get_it '/maybe', :env => { 'HTTP_IF_MODIFIED_SINCE' => modified_at.httpdate }
    status.should.equal 304
    body.should.equal ''
  end

  specify "supports conditional GETs with entity_tag" do
    get '/strong' do
      entity_tag 'FOO'
      'foo response'
    end

    get_it '/strong'
    should.be.ok
    body.should.equal 'foo response'

    get_it '/strong', {},
      'HTTP_IF_NONE_MATCH' => '"BAR"'
    should.be.ok
    body.should.equal 'foo response'

    get_it '/strong', {},
      'HTTP_IF_NONE_MATCH' => '"FOO"'
    status.should.equal 304
    body.should.equal ''

    get_it '/strong', {},
      'HTTP_IF_NONE_MATCH' => '"BAR", *'
    status.should.equal 304
    body.should.equal ''
  end

  specify "delegates HEAD requests to GET handlers" do
    get '/invisible' do
      "I am invisible to the world"
    end

    head_it '/invisible'
    should.be.ok
    body.should.not.equal "I am invisible to the world"
    body.should.equal ''
  end


  specify "supports PUT" do
    put '/' do
      'puted'
    end
    put_it '/'
    assert_equal 'puted', body
  end

  specify "rewrites POSTs with _method param to PUT" do
    put '/' do
      'puted'
    end
    post_it '/', :_method => 'PUT'
    assert_equal 'puted', body
  end

  specify "rewrites POSTs with lowercase _method param to PUT" do
    put '/' do
      'puted'
    end
    post_it '/', :_method => 'put'
    body.should.equal 'puted'
  end

  specify "does not rewrite GETs with _method param to PUT" do
    get '/' do
      'getted'
    end
    get_it '/', :_method => 'put'
    should.be.ok
    body.should.equal 'getted'
  end

  specify "ignores _method query string parameter on non-POST requests" do
    post '/' do
      'posted'
    end
    put '/' do
      'booo'
    end
    post_it "/?_method=PUT"
    should.be.ok
    body.should.equal 'posted'
  end

  specify "does not read body if content type is not url encoded" do
    post '/foo.xml' do
      request.env['CONTENT_TYPE'].should.be == 'application/xml'
      request.content_type.should.be == 'application/xml'
      request.body.read
    end

    post_it '/foo.xml', '<foo></foo>', :content_type => 'application/xml'
    @response.should.be.ok
    @response.body.should.be == '<foo></foo>'
  end

end
