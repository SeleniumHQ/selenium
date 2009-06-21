require File.dirname(__FILE__) + '/helper'

class HelpersTest < Test::Unit::TestCase
  def test_default
    assert true
  end

  describe 'status' do
    setup do
      mock_app {
        get '/' do
          status 207
          nil
        end
      }
    end

    it 'sets the response status code' do
      get '/'
      assert_equal 207, response.status
    end
  end

  describe 'body' do
    it 'takes a block for defered body generation' do
      mock_app {
        get '/' do
          body { 'Hello World' }
        end
      }

      get '/'
      assert_equal 'Hello World', body
    end

    it 'takes a String, Array, or other object responding to #each' do
      mock_app {
        get '/' do
          body 'Hello World'
        end
      }

      get '/'
      assert_equal 'Hello World', body
    end
  end

  describe 'redirect' do
    it 'uses a 302 when only a path is given' do
      mock_app {
        get '/' do
          redirect '/foo'
          fail 'redirect should halt'
        end
      }

      get '/'
      assert_equal 302, status
      assert_equal '', body
      assert_equal '/foo', response['Location']
    end

    it 'uses the code given when specified' do
      mock_app {
        get '/' do
          redirect '/foo', 301
          fail 'redirect should halt'
        end
      }

      get '/'
      assert_equal 301, status
      assert_equal '', body
      assert_equal '/foo', response['Location']
    end

    it 'redirects back to request.referer when passed back' do
      mock_app {
        get '/try_redirect' do
          redirect back
        end
      }

      request = Rack::MockRequest.new(@app)
      response = request.get('/try_redirect', 'HTTP_REFERER' => '/foo')
      assert_equal 302, response.status
      assert_equal '/foo', response['Location']
    end
  end

  describe 'error' do
    it 'sets a status code and halts' do
      mock_app {
        get '/' do
          error 501
          fail 'error should halt'
        end
      }

      get '/'
      assert_equal 501, status
      assert_equal '', body
    end

    it 'takes an optional body' do
      mock_app {
        get '/' do
          error 501, 'FAIL'
          fail 'error should halt'
        end
      }

      get '/'
      assert_equal 501, status
      assert_equal 'FAIL', body
    end

    it 'uses a 500 status code when first argument is a body' do
      mock_app {
        get '/' do
          error 'FAIL'
          fail 'error should halt'
        end
      }

      get '/'
      assert_equal 500, status
      assert_equal 'FAIL', body
    end
  end

  describe 'not_found' do
    it 'halts with a 404 status' do
      mock_app {
        get '/' do
          not_found
          fail 'not_found should halt'
        end
      }

      get '/'
      assert_equal 404, status
      assert_equal '', body
    end
  end

  describe 'headers' do
    it 'sets headers on the response object when given a Hash' do
      mock_app {
        get '/' do
          headers 'X-Foo' => 'bar', 'X-Baz' => 'bling'
          'kthx'
        end
      }

      get '/'
      assert ok?
      assert_equal 'bar', response['X-Foo']
      assert_equal 'bling', response['X-Baz']
      assert_equal 'kthx', body
    end

    it 'returns the response headers hash when no hash provided' do
      mock_app {
        get '/' do
          headers['X-Foo'] = 'bar'
          'kthx'
        end
      }

      get '/'
      assert ok?
      assert_equal 'bar', response['X-Foo']
    end
  end

  describe 'session' do
    it 'uses the existing rack.session' do
      mock_app {
        get '/' do
          session[:foo]
        end
      }

      get '/', {}, { 'rack.session' => { :foo => 'bar' } }
      assert_equal 'bar', body
    end

    it 'creates a new session when none provided' do
      mock_app {
        get '/' do
          assert session.empty?
          session[:foo] = 'bar'
          'Hi'
        end
      }

      get '/'
      assert_equal 'Hi', body
    end
  end

  describe 'media_type' do
    include Sinatra::Helpers

    it "looks up media types in Rack's MIME registry" do
      Rack::Mime::MIME_TYPES['.foo'] = 'application/foo'
      assert_equal 'application/foo', media_type('foo')
      assert_equal 'application/foo', media_type('.foo')
      assert_equal 'application/foo', media_type(:foo)
    end

    it 'returns nil when given nil' do
      assert media_type(nil).nil?
    end

    it 'returns nil when media type not registered' do
      assert media_type(:bizzle).nil?
    end

    it 'returns the argument when given a media type string' do
      assert_equal 'text/plain', media_type('text/plain')
    end
  end

  describe 'content_type' do
    it 'sets the Content-Type header' do
      mock_app {
        get '/' do
          content_type 'text/plain'
          'Hello World'
        end
      }

      get '/'
      assert_equal 'text/plain', response['Content-Type']
      assert_equal 'Hello World', body
    end

    it 'takes media type parameters (like charset=)' do
      mock_app {
        get '/' do
          content_type 'text/html', :charset => 'utf-8'
          "<h1>Hello, World</h1>"
        end
      }

      get '/'
      assert ok?
      assert_equal 'text/html;charset=utf-8', response['Content-Type']
      assert_equal "<h1>Hello, World</h1>", body
    end

    it "looks up symbols in Rack's mime types dictionary" do
      Rack::Mime::MIME_TYPES['.foo'] = 'application/foo'
      mock_app {
        get '/foo.xml' do
          content_type :foo
          "I AM FOO"
        end
      }

      get '/foo.xml'
      assert ok?
      assert_equal 'application/foo', response['Content-Type']
      assert_equal 'I AM FOO', body
    end

    it 'fails when no mime type is registered for the argument provided' do
      mock_app {
        get '/foo.xml' do
          content_type :bizzle
          "I AM FOO"
        end
      }

      assert_raise(RuntimeError) { get '/foo.xml' }
    end
  end

  describe 'send_file' do
    setup do
      @file = File.dirname(__FILE__) + '/file.txt'
      File.open(@file, 'wb') { |io| io.write('Hello World') }
    end

    def teardown
      File.unlink @file
      @file = nil
    end

    def send_file_app(opts={})
      path = @file
      mock_app {
        get '/file.txt' do
          send_file path, opts
        end
      }
    end

    it "sends the contents of the file" do
      send_file_app
      get '/file.txt'
      assert ok?
      assert_equal 'Hello World', body
    end

    it 'sets the Content-Type response header if a mime-type can be located' do
      send_file_app
      get '/file.txt'
      assert_equal 'text/plain', response['Content-Type']
    end

    it 'sets the Content-Length response header' do
      send_file_app
      get '/file.txt'
      assert_equal 'Hello World'.length.to_s, response['Content-Length']
    end

    it 'sets the Last-Modified response header' do
      send_file_app
      get '/file.txt'
      assert_equal File.mtime(@file).httpdate, response['Last-Modified']
    end

    it "returns a 404 when not found" do
      mock_app {
        get '/' do
          send_file 'this-file-does-not-exist.txt'
        end
      }
      get '/'
      assert not_found?
    end

    it "does not set the Content-Disposition header by default" do
      send_file_app
      get '/file.txt'
      assert_nil response['Content-Disposition']
    end

    it "sets the Content-Disposition header when :disposition set to 'attachment'" do
      send_file_app :disposition => 'attachment'
      get '/file.txt'
      assert_equal 'attachment; filename="file.txt"', response['Content-Disposition']
    end

    it "sets the Content-Disposition header when :filename provided" do
      send_file_app :filename => 'foo.txt'
      get '/file.txt'
      assert_equal 'attachment; filename="foo.txt"', response['Content-Disposition']
    end
  end

  describe 'last_modified' do
    setup do
      now = Time.now
      mock_app {
        get '/' do
          body { 'Hello World' }
          last_modified now
          'Boo!'
        end
      }
      @now = now
    end

    it 'sets the Last-Modified header to a valid RFC 2616 date value' do
      get '/'
      assert_equal @now.httpdate, response['Last-Modified']
    end

    it 'returns a body when conditional get misses' do
      get '/'
      assert_equal 200, status
      assert_equal 'Boo!', body
    end

    it 'halts when a conditional GET matches' do
      get '/', {}, { 'HTTP_IF_MODIFIED_SINCE' => @now.httpdate }
      assert_equal 304, status
      assert_equal '', body
    end
  end

  describe 'etag' do
    setup do
      mock_app {
        get '/' do
          body { 'Hello World' }
          etag 'FOO'
          'Boo!'
        end
      }
    end

    it 'sets the ETag header' do
      get '/'
      assert_equal '"FOO"', response['ETag']
    end

    it 'returns a body when conditional get misses' do
      get '/'
      assert_equal 200, status
      assert_equal 'Boo!', body
    end

    it 'halts when a conditional GET matches' do
      get '/', {}, { 'HTTP_IF_NONE_MATCH' => '"FOO"' }
      assert_equal 304, status
      assert_equal '', body
    end

    it 'should handle multiple ETag values in If-None-Match header' do
      get '/', {}, { 'HTTP_IF_NONE_MATCH' => '"BAR", *' }
      assert_equal 304, status
      assert_equal '', body
    end

    it 'uses a weak etag with the :weak option' do
      mock_app {
        get '/' do
          etag 'FOO', :weak
          "that's weak, dude."
        end
      }
      get '/'
      assert_equal 'W/"FOO"', response['ETag']
    end
  end

  describe 'back' do
    it "makes redirecting back pretty" do
      mock_app {
        get '/foo' do
          redirect back
        end
      }

      get '/foo', {}, 'HTTP_REFERER' => 'http://github.com'
      assert redirect?
      assert_equal "http://github.com", response.location
    end
  end

  module ::HelperOne; def one; '1'; end; end
  module ::HelperTwo; def two; '2'; end; end

  describe 'Adding new helpers' do
    it 'takes a list of modules to mix into the app' do
      mock_app {
        helpers ::HelperOne, ::HelperTwo

        get '/one' do
          one
        end

        get '/two' do
          two
        end
      }

      get '/one'
      assert_equal '1', body

      get '/two'
      assert_equal '2', body
    end

    it 'takes a block to mix into the app' do
      mock_app {
        helpers do
          def foo
            'foo'
          end
        end

        get '/' do
          foo
        end
      }

      get '/'
      assert_equal 'foo', body
    end

    it 'evaluates the block in class context so that methods can be aliased' do
      mock_app {
        helpers do
          alias_method :h, :escape_html
        end

        get '/' do
          h('42 < 43')
        end
      }

      get '/'
      assert ok?
      assert_equal '42 &lt; 43', body
    end
  end
end
