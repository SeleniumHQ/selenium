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
end

context "Rack::Utils::Context" do
  test_app1 = Object.new
  def test_app1.context app
    Rack::Utils::Context.new self, app do |env|
      app.call env
    end
  end
  test_app2 = Object.new
  def test_app2.context env; end
  test_app3 = Object.new
  test_target1 = proc{|e| e.to_s+' world' }
  test_target2 = proc{|e| e.to_i+2 }
  test_target3 = proc{|e| nil }
  test_target4 = proc{|e| [200,{'Content-Type'=>'text/plain', 'Content-Length'=>'0'},['']] }
  test_target5 = Object.new

  specify "should perform checks on both arguments" do
    lambda { Rack::Utils::Context.new(nil, nil){} }.should.raise
    lambda { Rack::Utils::Context.new(test_app1, nil){} }.should.raise
    lambda { Rack::Utils::Context.new(nil, test_target1){} }.should.raise
    lambda { Rack::Utils::Context.new(test_app1, test_target1){} }.should.not.raise
    lambda { Rack::Utils::Context.new(test_app3, test_target1){} }.should.raise
    lambda { Rack::Utils::Context.new(test_app1, test_target5){} }.should.raise
    lambda { test_app1.context(nil){} }.should.raise
    lambda { test_app1.context(test_target1){} }.should.not.raise
    lambda { test_app1.context(test_target5){} }.should.raise
  end

  specify "should set context correctly" do
    c1 = Rack::Utils::Context.new(test_app1, test_target1){}
    c1.for.should.equal test_app1
    c1.app.should.equal test_target1
    c2 = Rack::Utils::Context.new(test_app1, test_target2){}
    c2.for.should.equal test_app1
    c2.app.should.equal test_target2
    c3 = Rack::Utils::Context.new(test_app2, test_target3){}
    c3.for.should.equal test_app2
    c3.app.should.equal test_target3
    c4 = Rack::Utils::Context.new(test_app2, test_target4){}
    c4.for.should.equal test_app2
    c4.app.should.equal test_target4
  end

  specify "should alter app on recontexting" do
    c1 = Rack::Utils::Context.new(test_app1, test_target1){}
    c1.for.should.equal test_app1
    c1.app.should.equal test_target1
    c2 = c1.context(test_target2)
    c2.for.should.equal test_app1
    c2.app.should.not.equal test_target1
    c2.app.should.equal test_target2
    c3 = c2.context(test_target3)
    c3.for.should.equal test_app1
    c3.app.should.not.equal test_target2
    c3.app.should.equal test_target3
    c4 = c3.context(test_target4)
    c4.for.should.equal test_app1
    c4.app.should.not.equal test_target3
    c4.app.should.equal test_target4
  end

  specify "should run different apps" do
    c1 = test_app1.context(test_target1)
    c2 = c1.context test_target2
    c3 = c2.context test_target3
    c4 = c3.context test_target4
    a4 = Rack::Lint.new c4
    r1 = c1.call('hello')
    r1.should.equal 'hello world'
    r2 = c2.call(2)
    r2.should.equal 4
    r3 = c3.call(:misc_symbol)
    r3.should.be.nil
    r4 = Rack::MockRequest.new(a4).get('/')
    r4.status.should.be 200
  end
end
