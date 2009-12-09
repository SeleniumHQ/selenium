require 'test/spec'
require 'set'

require 'rack/response'

context "Rack::Response" do
  specify "has sensible default values" do
    response = Rack::Response.new
    status, header, body = response.finish
    status.should.equal 200
    header.should.equal "Content-Type" => "text/html"
    body.each { |part|
      part.should.equal ""
    }

    response = Rack::Response.new
    status, header, body = *response
    status.should.equal 200
    header.should.equal "Content-Type" => "text/html"
    body.each { |part|
      part.should.equal ""
    }
  end

  specify "can be written to" do
    response = Rack::Response.new

    status, header, body = response.finish do
      response.write "foo"
      response.write "bar"
      response.write "baz"
    end
    
    parts = []
    body.each { |part| parts << part }
    
    parts.should.equal ["foo", "bar", "baz"]
  end

  specify "can set and read headers" do
    response = Rack::Response.new
    response["Content-Type"].should.equal "text/html"
    response["Content-Type"] = "text/plain"
    response["Content-Type"].should.equal "text/plain"
  end

  specify "can set cookies" do
    response = Rack::Response.new
    
    response.set_cookie "foo", "bar"
    response["Set-Cookie"].should.equal "foo=bar"
    response.set_cookie "foo2", "bar2"
    response["Set-Cookie"].should.equal ["foo=bar", "foo2=bar2"]
    response.set_cookie "foo3", "bar3"
    response["Set-Cookie"].should.equal ["foo=bar", "foo2=bar2", "foo3=bar3"]
  end

  specify "formats the Cookie expiration date accordingly to RFC 2109" do
    response = Rack::Response.new
    
    response.set_cookie "foo", {:value => "bar", :expires => Time.now+10}
    response["Set-Cookie"].should.match(
      /expires=..., \d\d-...-\d\d\d\d \d\d:\d\d:\d\d .../)
  end

  specify "can set secure cookies" do
    response = Rack::Response.new
    response.set_cookie "foo", {:value => "bar", :secure => true}
    response["Set-Cookie"].should.equal "foo=bar; secure"
  end

  specify "can set http only cookies" do
    response = Rack::Response.new
    response.set_cookie "foo", {:value => "bar", :httponly => true}
    response["Set-Cookie"].should.equal "foo=bar; HttpOnly"
  end

  specify "can delete cookies" do
    response = Rack::Response.new
    response.set_cookie "foo", "bar"
    response.set_cookie "foo2", "bar2"
    response.delete_cookie "foo"
    response["Set-Cookie"].should.equal ["foo2=bar2",
                                  "foo=; expires=Thu, 01-Jan-1970 00:00:00 GMT"]
  end

  specify "can do redirects" do
    response = Rack::Response.new
    response.redirect "/foo"
    status, header, body = response.finish

    status.should.equal 302
    header["Location"].should.equal "/foo"

    response = Rack::Response.new
    response.redirect "/foo", 307
    status, header, body = response.finish

    status.should.equal 307
  end

  specify "has a useful constructor" do
    r = Rack::Response.new("foo")
    status, header, body = r.finish
    str = ""; body.each { |part| str << part }
    str.should.equal "foo"

    r = Rack::Response.new(["foo", "bar"])
    status, header, body = r.finish
    str = ""; body.each { |part| str << part }
    str.should.equal "foobar"

    r = Rack::Response.new(["foo", "bar"].to_set)
    r.write "foo"
    status, header, body = r.finish
    str = ""; body.each { |part| str << part }
    str.should.equal "foobarfoo"

    r = Rack::Response.new([], 500)
    r.status.should.equal 500
  end

  specify "has a constructor that can take a block" do
    r = Rack::Response.new { |res|
      res.status = 404
      res.write "foo"
    }
    status, header, body = r.finish
    str = ""; body.each { |part| str << part }
    str.should.equal "foo"
    status.should.equal 404
  end
 
  specify "doesn't return invalid responses" do
    r = Rack::Response.new(["foo", "bar"], 204)
    status, header, body = r.finish
    str = ""; body.each { |part| str << part }
    str.should.be.empty
    header["Content-Type"].should.equal nil

    lambda {
      Rack::Response.new(Object.new)
    }.should.raise(TypeError).
      message.should =~ /stringable or iterable required/
  end

  specify "knows if it's empty" do
    r = Rack::Response.new
    r.should.be.empty
    r.write "foo"
    r.should.not.be.empty

    r = Rack::Response.new
    r.should.be.empty
    r.finish
    r.should.be.empty

    r = Rack::Response.new
    r.should.be.empty
    r.finish { }
    r.should.not.be.empty
  end

  specify "should provide access to the HTTP status" do
    res = Rack::Response.new
    res.status = 200
    res.should.be.successful
    res.should.be.ok

    res.status = 404
    res.should.not.be.successful
    res.should.be.client_error
    res.should.be.not_found

    res.status = 501
    res.should.not.be.successful
    res.should.be.server_error

    res.status = 307
    res.should.be.redirect
  end

  specify "should provide access to the HTTP headers" do
    res = Rack::Response.new
    res["Content-Type"] = "text/yaml"

    res.should.include "Content-Type"
    res.headers["Content-Type"].should.equal "text/yaml"
    res["Content-Type"].should.equal "text/yaml"
    res.content_type.should.equal "text/yaml"
    res.content_length.should.be.nil
    res.location.should.be.nil
  end

  specify "does not add or change Content-Length when #finish()ing" do
    res = Rack::Response.new
    res.status = 200
    res.finish
    res.headers["Content-Length"].should.be.nil

    res = Rack::Response.new
    res.status = 200
    res.headers["Content-Length"] = "10"
    res.finish
    res.headers["Content-Length"].should.equal "10"
  end

  specify "updates Content-Length when body appended to using #write" do
    res = Rack::Response.new
    res.status = 200
    res.headers["Content-Length"].should.be.nil
    res.write "Hi"
    res.headers["Content-Length"].should.equal "2"
    res.write " there"
    res.headers["Content-Length"].should.equal "8"
  end

end
