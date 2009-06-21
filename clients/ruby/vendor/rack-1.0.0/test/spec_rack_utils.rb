require 'test/spec'

require 'rack/utils'
require 'rack/lint'
require 'rack/mock'

context "Rack::Utils" do
  specify "should escape correctly" do
    Rack::Utils.escape("fo<o>bar").should.equal "fo%3Co%3Ebar"
    Rack::Utils.escape("a space").should.equal "a+space"
    Rack::Utils.escape("q1!2\"'w$5&7/z8)?\\").
      should.equal "q1%212%22%27w%245%267%2Fz8%29%3F%5C"
  end

  specify "should unescape correctly" do
    Rack::Utils.unescape("fo%3Co%3Ebar").should.equal "fo<o>bar"
    Rack::Utils.unescape("a+space").should.equal "a space"
    Rack::Utils.unescape("a%20space").should.equal "a space"
    Rack::Utils.unescape("q1%212%22%27w%245%267%2Fz8%29%3F%5C").
      should.equal "q1!2\"'w$5&7/z8)?\\"
  end

  specify "should parse query strings correctly" do
    Rack::Utils.parse_query("foo=bar").should.equal "foo" => "bar"
    Rack::Utils.parse_query("foo=bar&foo=quux").
      should.equal "foo" => ["bar", "quux"]
    Rack::Utils.parse_query("foo=1&bar=2").
      should.equal "foo" => "1", "bar" => "2"
    Rack::Utils.parse_query("my+weird+field=q1%212%22%27w%245%267%2Fz8%29%3F").
      should.equal "my weird field" => "q1!2\"'w$5&7/z8)?"
  end

  specify "should parse nested query strings correctly" do
    Rack::Utils.parse_nested_query("foo").
      should.equal "foo" => nil
    Rack::Utils.parse_nested_query("foo=").
      should.equal "foo" => ""
    Rack::Utils.parse_nested_query("foo=bar").
      should.equal "foo" => "bar"

    Rack::Utils.parse_nested_query("foo=bar&foo=quux").
      should.equal "foo" => "quux"
    Rack::Utils.parse_nested_query("foo&foo=").
      should.equal "foo" => ""
    Rack::Utils.parse_nested_query("foo=1&bar=2").
      should.equal "foo" => "1", "bar" => "2"
    Rack::Utils.parse_nested_query("&foo=1&&bar=2").
      should.equal "foo" => "1", "bar" => "2"
    Rack::Utils.parse_nested_query("foo&bar=").
      should.equal "foo" => nil, "bar" => ""
    Rack::Utils.parse_nested_query("foo=bar&baz=").
      should.equal "foo" => "bar", "baz" => ""
    Rack::Utils.parse_nested_query("my+weird+field=q1%212%22%27w%245%267%2Fz8%29%3F").
      should.equal "my weird field" => "q1!2\"'w$5&7/z8)?"

    Rack::Utils.parse_nested_query("foo[]").
      should.equal "foo" => [nil]
    Rack::Utils.parse_nested_query("foo[]=").
      should.equal "foo" => [""]
    Rack::Utils.parse_nested_query("foo[]=bar").
      should.equal "foo" => ["bar"]

    Rack::Utils.parse_nested_query("foo[]=1&foo[]=2").
      should.equal "foo" => ["1", "2"]
    Rack::Utils.parse_nested_query("foo=bar&baz[]=1&baz[]=2&baz[]=3").
      should.equal "foo" => "bar", "baz" => ["1", "2", "3"]
    Rack::Utils.parse_nested_query("foo[]=bar&baz[]=1&baz[]=2&baz[]=3").
      should.equal "foo" => ["bar"], "baz" => ["1", "2", "3"]

    Rack::Utils.parse_nested_query("x[y][z]=1").
      should.equal "x" => {"y" => {"z" => "1"}}
    Rack::Utils.parse_nested_query("x[y][z][]=1").
      should.equal "x" => {"y" => {"z" => ["1"]}}
    Rack::Utils.parse_nested_query("x[y][z]=1&x[y][z]=2").
      should.equal "x" => {"y" => {"z" => "2"}}
    Rack::Utils.parse_nested_query("x[y][z][]=1&x[y][z][]=2").
      should.equal "x" => {"y" => {"z" => ["1", "2"]}}

    Rack::Utils.parse_nested_query("x[y][][z]=1").
      should.equal "x" => {"y" => [{"z" => "1"}]}
    Rack::Utils.parse_nested_query("x[y][][z][]=1").
      should.equal "x" => {"y" => [{"z" => ["1"]}]}
    Rack::Utils.parse_nested_query("x[y][][z]=1&x[y][][w]=2").
      should.equal "x" => {"y" => [{"z" => "1", "w" => "2"}]}

    Rack::Utils.parse_nested_query("x[y][][v][w]=1").
      should.equal "x" => {"y" => [{"v" => {"w" => "1"}}]}
    Rack::Utils.parse_nested_query("x[y][][z]=1&x[y][][v][w]=2").
      should.equal "x" => {"y" => [{"z" => "1", "v" => {"w" => "2"}}]}

    Rack::Utils.parse_nested_query("x[y][][z]=1&x[y][][z]=2").
      should.equal "x" => {"y" => [{"z" => "1"}, {"z" => "2"}]}
    Rack::Utils.parse_nested_query("x[y][][z]=1&x[y][][w]=a&x[y][][z]=2&x[y][][w]=3").
      should.equal "x" => {"y" => [{"z" => "1", "w" => "a"}, {"z" => "2", "w" => "3"}]}

    lambda { Rack::Utils.parse_nested_query("x[y]=1&x[y]z=2") }.
      should.raise(TypeError).
      message.should.equal "expected Hash (got String) for param `y'"

    lambda { Rack::Utils.parse_nested_query("x[y]=1&x[]=1") }.
      should.raise(TypeError).
      message.should.equal "expected Array (got Hash) for param `x'"

    lambda { Rack::Utils.parse_nested_query("x[y]=1&x[y][][w]=2") }.
      should.raise(TypeError).
      message.should.equal "expected Array (got String) for param `y'"
  end

  specify "should build query strings correctly" do
    Rack::Utils.build_query("foo" => "bar").should.equal "foo=bar"
    Rack::Utils.build_query("foo" => ["bar", "quux"]).
      should.equal "foo=bar&foo=quux"
    Rack::Utils.build_query("foo" => "1", "bar" => "2").
      should.equal "foo=1&bar=2"
    Rack::Utils.build_query("my weird field" => "q1!2\"'w$5&7/z8)?").
      should.equal "my+weird+field=q1%212%22%27w%245%267%2Fz8%29%3F"
  end

  specify "should figure out which encodings are acceptable" do
    helper = lambda do |a, b|
      request = Rack::Request.new(Rack::MockRequest.env_for("", "HTTP_ACCEPT_ENCODING" => a))
      Rack::Utils.select_best_encoding(a, b)
    end

    helper.call(%w(), [["x", 1]]).should.equal(nil)
    helper.call(%w(identity), [["identity", 0.0]]).should.equal(nil)
    helper.call(%w(identity), [["*", 0.0]]).should.equal(nil)

    helper.call(%w(identity), [["compress", 1.0], ["gzip", 1.0]]).should.equal("identity")

    helper.call(%w(compress gzip identity), [["compress", 1.0], ["gzip", 1.0]]).should.equal("compress")
    helper.call(%w(compress gzip identity), [["compress", 0.5], ["gzip", 1.0]]).should.equal("gzip")

    helper.call(%w(foo bar identity), []).should.equal("identity")
    helper.call(%w(foo bar identity), [["*", 1.0]]).should.equal("foo")
    helper.call(%w(foo bar identity), [["*", 1.0], ["foo", 0.9]]).should.equal("bar")

    helper.call(%w(foo bar identity), [["foo", 0], ["bar", 0]]).should.equal("identity")
    helper.call(%w(foo bar baz identity), [["*", 0], ["identity", 0.1]]).should.equal("identity")
  end

  specify "should return the bytesize of String" do
    Rack::Utils.bytesize("FOO\xE2\x82\xAC").should.equal 6
  end
end

context "Rack::Utils::HeaderHash" do
  specify "should retain header case" do
    h = Rack::Utils::HeaderHash.new("Content-MD5" => "d5ff4e2a0 ...")
    h['ETag'] = 'Boo!'
    h.to_hash.should.equal "Content-MD5" => "d5ff4e2a0 ...", "ETag" => 'Boo!'
  end

  specify "should check existence of keys case insensitively" do
    h = Rack::Utils::HeaderHash.new("Content-MD5" => "d5ff4e2a0 ...")
    h.should.include 'content-md5'
    h.should.not.include 'ETag'
  end

  specify "should merge case-insensitively" do
    h = Rack::Utils::HeaderHash.new("ETag" => 'HELLO', "content-length" => '123')
    merged = h.merge("Etag" => 'WORLD', 'Content-Length' => '321', "Foo" => 'BAR')
    merged.should.equal "Etag"=>'WORLD', "Content-Length"=>'321', "Foo"=>'BAR'
  end

  specify "should overwrite case insensitively and assume the new key's case" do
    h = Rack::Utils::HeaderHash.new("Foo-Bar" => "baz")
    h["foo-bar"] = "bizzle"
    h["FOO-BAR"].should.equal "bizzle"
    h.length.should.equal 1
    h.to_hash.should.equal "foo-bar" => "bizzle"
  end

  specify "should be converted to real Hash" do
    h = Rack::Utils::HeaderHash.new("foo" => "bar")
    h.to_hash.should.be.instance_of Hash
  end

  specify "should convert Array values to Strings when converting to Hash" do
    h = Rack::Utils::HeaderHash.new("foo" => ["bar", "baz"])
    h.to_hash.should.equal({ "foo" => "bar\nbaz" })
  end
end

context "Rack::Utils::Context" do
  class ContextTest
    attr_reader :app
    def initialize app; @app=app; end
    def call env; context env; end
    def context env, app=@app; app.call(env); end
  end
  test_target1 = proc{|e| e.to_s+' world' }
  test_target2 = proc{|e| e.to_i+2 }
  test_target3 = proc{|e| nil }
  test_target4 = proc{|e| [200,{'Content-Type'=>'text/plain', 'Content-Length'=>'0'},['']] }
  test_app = ContextTest.new test_target4

  specify "should set context correctly" do
    test_app.app.should.equal test_target4
    c1 = Rack::Utils::Context.new(test_app, test_target1)
    c1.for.should.equal test_app
    c1.app.should.equal test_target1
    c2 = Rack::Utils::Context.new(test_app, test_target2)
    c2.for.should.equal test_app
    c2.app.should.equal test_target2
  end

  specify "should alter app on recontexting" do
    c1 = Rack::Utils::Context.new(test_app, test_target1)
    c2 = c1.recontext(test_target2)
    c2.for.should.equal test_app
    c2.app.should.equal test_target2
    c3 = c2.recontext(test_target3)
    c3.for.should.equal test_app
    c3.app.should.equal test_target3
  end

  specify "should run different apps" do
    c1 = Rack::Utils::Context.new test_app, test_target1
    c2 = c1.recontext test_target2
    c3 = c2.recontext test_target3
    c4 = c3.recontext test_target4
    a4 = Rack::Lint.new c4
    a5 = Rack::Lint.new test_app
    r1 = c1.call('hello')
    r1.should.equal 'hello world'
    r2 = c2.call(2)
    r2.should.equal 4
    r3 = c3.call(:misc_symbol)
    r3.should.be.nil
    r4 = Rack::MockRequest.new(a4).get('/')
    r4.status.should.be 200
    r5 = Rack::MockRequest.new(a5).get('/')
    r5.status.should.be 200
    r4.body.should.equal r5.body
  end
end

context "Rack::Utils::Multipart" do
  specify "should return nil if content type is not multipart" do
    env = Rack::MockRequest.env_for("/",
            "CONTENT_TYPE" => 'application/x-www-form-urlencoded')
    Rack::Utils::Multipart.parse_multipart(env).should.equal nil
  end

  specify "should parse multipart upload with text file" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:text))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["submit-name"].should.equal "Larry"
    params["files"][:type].should.equal "text/plain"
    params["files"][:filename].should.equal "file1.txt"
    params["files"][:head].should.equal "Content-Disposition: form-data; " +
      "name=\"files\"; filename=\"file1.txt\"\r\n" +
      "Content-Type: text/plain\r\n"
    params["files"][:name].should.equal "files"
    params["files"][:tempfile].read.should.equal "contents"
  end

  specify "should parse multipart upload with nested parameters" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:nested))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["foo"]["submit-name"].should.equal "Larry"
    params["foo"]["files"][:type].should.equal "text/plain"
    params["foo"]["files"][:filename].should.equal "file1.txt"
    params["foo"]["files"][:head].should.equal "Content-Disposition: form-data; " +
      "name=\"foo[files]\"; filename=\"file1.txt\"\r\n" +
      "Content-Type: text/plain\r\n"
    params["foo"]["files"][:name].should.equal "foo[files]"
    params["foo"]["files"][:tempfile].read.should.equal "contents"
  end

  specify "should parse multipart upload with binary file" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:binary))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["submit-name"].should.equal "Larry"
    params["files"][:type].should.equal "image/png"
    params["files"][:filename].should.equal "rack-logo.png"
    params["files"][:head].should.equal "Content-Disposition: form-data; " +
      "name=\"files\"; filename=\"rack-logo.png\"\r\n" +
      "Content-Type: image/png\r\n"
    params["files"][:name].should.equal "files"
    params["files"][:tempfile].read.length.should.equal 26473
  end

  specify "should parse multipart upload with empty file" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:empty))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["submit-name"].should.equal "Larry"
    params["files"][:type].should.equal "text/plain"
    params["files"][:filename].should.equal "file1.txt"
    params["files"][:head].should.equal "Content-Disposition: form-data; " +
      "name=\"files\"; filename=\"file1.txt\"\r\n" +
      "Content-Type: text/plain\r\n"
    params["files"][:name].should.equal "files"
    params["files"][:tempfile].read.should.equal ""
  end

  specify "should not include file params if no file was selected" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:none))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["submit-name"].should.equal "Larry"
    params["files"].should.equal nil
    params.keys.should.not.include "files"
  end

  specify "should parse IE multipart upload and clean up filename" do
    env = Rack::MockRequest.env_for("/", multipart_fixture(:ie))
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["files"][:type].should.equal "text/plain"
    params["files"][:filename].should.equal "file1.txt"
    params["files"][:head].should.equal "Content-Disposition: form-data; " +
      "name=\"files\"; " +
      'filename="C:\Documents and Settings\Administrator\Desktop\file1.txt"' +
      "\r\nContent-Type: text/plain\r\n"
    params["files"][:name].should.equal "files"
    params["files"][:tempfile].read.should.equal "contents"
  end

  specify "rewinds input after parsing upload" do
    options = multipart_fixture(:text)
    input = options[:input]
    env = Rack::MockRequest.env_for("/", options)
    params = Rack::Utils::Multipart.parse_multipart(env)
    params["submit-name"].should.equal "Larry"
    params["files"][:filename].should.equal "file1.txt"
    input.read.length.should.equal 197
  end

  private
    def multipart_fixture(name)
      file = File.join(File.dirname(__FILE__), "multipart", name.to_s)
      data = File.open(file, 'rb') { |io| io.read }

      type = "multipart/form-data; boundary=AaB03x"
      length = data.respond_to?(:bytesize) ? data.bytesize : data.size

      { "CONTENT_TYPE" => type,
        "CONTENT_LENGTH" => length.to_s,
        :input => StringIO.new(data) }
    end
end
