require 'test/spec'

require 'rack/mock'
require 'rack/deflater'
require 'stringio'
require 'time'  # for Time#httpdate

context "Rack::Deflater" do
  def build_response(status, body, accept_encoding, headers = {})
    app = lambda { |env| [status, {}, body] }
    request = Rack::MockRequest.env_for("", headers.merge("HTTP_ACCEPT_ENCODING" => accept_encoding))
    response = Rack::Deflater.new(app).call(request)

    return response
  end

  specify "should be able to deflate bodies that respond to each" do
    body = Object.new
    class << body; def each; yield("foo"); yield("bar"); end; end

    response = build_response(200, body, "deflate")

    response[0].should.equal(200)
    response[1].should.equal({ "Content-Encoding" => "deflate", "Vary" => "Accept-Encoding" })
    response[2].to_s.should.equal("K\313\317OJ,\002\000")
  end

  # TODO: This is really just a special case of the above...
  specify "should be able to deflate String bodies" do
    response = build_response(200, "Hello world!", "deflate")

    response[0].should.equal(200)
    response[1].should.equal({ "Content-Encoding" => "deflate", "Vary" => "Accept-Encoding" })
    response[2].to_s.should.equal("\363H\315\311\311W(\317/\312IQ\004\000")
  end

  specify "should be able to gzip bodies that respond to each" do
    body = Object.new
    class << body; def each; yield("foo"); yield("bar"); end; end

    response = build_response(200, body, "gzip")

    response[0].should.equal(200)
    response[1].should.equal({ "Content-Encoding" => "gzip", "Vary" => "Accept-Encoding" })

    io = StringIO.new(response[2].to_s)
    gz = Zlib::GzipReader.new(io)
    gz.read.should.equal("foobar")
    gz.close
  end

  specify "should be able to fallback to no deflation" do
    response = build_response(200, "Hello world!", "superzip")

    response[0].should.equal(200)
    response[1].should.equal({ "Vary" => "Accept-Encoding" })
    response[2].should.equal("Hello world!")
  end

  specify "should be able to skip when there is no response entity body" do
    response = build_response(304, [], "gzip")

    response[0].should.equal(304)
    response[1].should.equal({})
    response[2].should.equal([])
  end

  specify "should handle the lack of an acceptable encoding" do
    response1 = build_response(200, "Hello world!", "identity;q=0", "PATH_INFO" => "/")
    response1[0].should.equal(406)
    response1[1].should.equal({"Content-Type" => "text/plain"})
    response1[2].should.equal(["An acceptable encoding for the requested resource / could not be found."])

    response2 = build_response(200, "Hello world!", "identity;q=0", "SCRIPT_NAME" => "/foo", "PATH_INFO" => "/bar")
    response2[0].should.equal(406)
    response2[1].should.equal({"Content-Type" => "text/plain"})
    response2[2].should.equal(["An acceptable encoding for the requested resource /foo/bar could not be found."])
  end

  specify "should handle gzip response with Last-Modified header" do
    last_modified = Time.now.httpdate

    app = lambda { |env| [200, { "Last-Modified" => last_modified }, "Hello World!"] }
    request = Rack::MockRequest.env_for("", "HTTP_ACCEPT_ENCODING" => "gzip")
    response = Rack::Deflater.new(app).call(request)

    response[0].should.equal(200)
    response[1].should.equal({ "Content-Encoding" => "gzip", "Vary" => "Accept-Encoding", "Last-Modified" => last_modified })

    io = StringIO.new(response[2].to_s)
    gz = Zlib::GzipReader.new(io)
    gz.read.should.equal("Hello World!")
    gz.close
  end

  specify "should do nothing when no-transform Cache-Control directive present" do
    app = lambda { |env| [200, {'Cache-Control' => 'no-transform'}, ['Hello World!']] }
    request = Rack::MockRequest.env_for("", "HTTP_ACCEPT_ENCODING" => "gzip")
    response = Rack::Deflater.new(app).call(request)

    response[0].should.equal(200)
    response[1].should.not.include "Content-Encoding"
    response[2].join.should.equal("Hello World!")
  end
end
