require File.dirname(__FILE__) + '/helper'

context "Static files (by default)" do

  setup do
    Sinatra.application = nil
    Sinatra.application.options.public = File.dirname(__FILE__) + '/public'
  end

  specify "are served from root/public" do
    get_it '/foo.xml'
    should.be.ok
    headers['Content-Length'].should.equal '12'
    headers['Content-Type'].should.equal 'application/xml'
    body.should.equal "<foo></foo>\n"
  end

  specify "are not served when verb is not GET or HEAD" do
    post_it '/foo.xml'
    # these should actually be giving back a 405 Method Not Allowed but that
    # complicates the routing logic quite a bit.
    should.be.not_found
    status.should.equal 404
  end

  specify "are served when verb is HEAD but missing a body" do
    head_it '/foo.xml'
    should.be.ok
    headers['Content-Length'].should.equal '12'
    headers['Content-Type'].should.equal 'application/xml'
    body.should.equal ""
  end

  # static files override dynamic/internal events and ...
  specify "are served when conflicting events exists" do
    get '/foo.xml' do
      'this is not foo.xml!'
    end
    get_it '/foo.xml'
    should.be.ok
    body.should.equal "<foo></foo>\n"
  end

  specify "are irrelevant when request_method is not GET/HEAD" do
    put '/foo.xml' do
      'putted!'
    end
    put_it '/foo.xml'
    should.be.ok
    body.should.equal 'putted!'

    get_it '/foo.xml'
    should.be.ok
    body.should.equal "<foo></foo>\n"
  end

  specify "include a Last-Modified header" do
    last_modified = File.mtime(Sinatra.application.options.public + '/foo.xml')
    get_it('/foo.xml')
    should.be.ok
    body.should.not.be.empty
    headers['Last-Modified'].should.equal last_modified.httpdate
  end

  # Deprecated. Use: ConditionalGet middleware.
  specify "are not served when If-Modified-Since matches" do
    last_modified = File.mtime(Sinatra.application.options.public + '/foo.xml')
    @request = Rack::MockRequest.new(Sinatra.application)
    @response = @request.get('/foo.xml', 'HTTP_IF_MODIFIED_SINCE' => last_modified.httpdate)
    status.should.equal 304
    body.should.be.empty
  end

  specify "should omit Content-Disposition headers" do
    get_it('/foo.xml')
    should.be.ok
    headers['Content-Disposition'].should.be.nil
    headers['Content-Transfer-Encoding'].should.be.nil
  end

  specify "should be served even if their path is url escaped" do
	get_it('/fo%6f.xml')
	should.be.ok
    body.should.equal "<foo></foo>\n"
  end

end

context "SendData" do

  setup do
    Sinatra.application = nil
  end

  # Deprecated. send_data is going away.
  specify "should send the data with options" do
    get '/' do
      send_data 'asdf', :status => 500
    end

    get_it '/'

    should.be.server_error
    body.should.equal 'asdf'
  end

  # Deprecated. The Content-Disposition is no longer handled by sendfile.
  specify "should include a Content-Disposition header" do
    get '/' do
      send_file File.dirname(__FILE__) + '/public/foo.xml',
        :disposition => 'attachment'
    end

    get_it '/'

    should.be.ok
    headers['Content-Disposition'].should.not.be.nil
    headers['Content-Disposition'].should.equal 'attachment; filename="foo.xml"'
  end

  specify "should include a Content-Disposition header when :disposition set to attachment" do
    get '/' do
      send_file File.dirname(__FILE__) + '/public/foo.xml',
        :disposition => 'attachment'
    end

    get_it '/'

    should.be.ok
    headers['Content-Disposition'].should.not.be.nil
    headers['Content-Disposition'].should.equal 'attachment; filename="foo.xml"'
  end
end
