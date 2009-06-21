require File.dirname(__FILE__) + '/helper'

context "Simple Events" do
  def simple_request_hash(method, path)
    Rack::Request.new({
      'REQUEST_METHOD' => method.to_s.upcase,
      'PATH_INFO' => path
    })
  end

  class MockResult < Struct.new(:block, :params)
  end

  def invoke_simple(path, request_path, &b)
    params = nil
    get path do
      params = self.params
      b.call if b
    end
    get_it request_path
    MockResult.new(b, params)
  end

  setup { Sinatra.application = nil }

  specify "return last value" do
    block = Proc.new { 'Simple' }
    result = invoke_simple('/', '/', &block)
    result.should.not.be.nil
    result.block.should.be block
    result.params.should.equal Hash.new
  end

  specify "takes params in path" do
    result = invoke_simple('/:foo/:bar', '/a/b')
    result.should.not.be.nil
    result.params.should.equal "foo" => 'a', "bar" => 'b'

    # unscapes
    Sinatra.application = nil
    result = invoke_simple('/:foo/:bar', '/a/blake%20mizerany')
    result.should.not.be.nil
    result.params.should.equal "foo" => 'a', "bar" => 'blake mizerany'
  end

  specify "takes optional params in path" do
    result = invoke_simple('/?:foo?/?:bar?', '/a/b')
    result.should.not.be.nil
    result.params.should.equal "foo" => 'a', "bar" => 'b'

    Sinatra.application = nil
    result = invoke_simple('/?:foo?/?:bar?', '/a/')
    result.should.not.be.nil
    result.params.should.equal "foo" => 'a', "bar" => nil

    Sinatra.application = nil
    result = invoke_simple('/?:foo?/?:bar?', '/a')
    result.should.not.be.nil
    result.params.should.equal "foo" => 'a', "bar" => nil

    Sinatra.application = nil
    result = invoke_simple('/:foo?/?:bar?', '/')
    result.should.not.be.nil
    result.params.should.equal "foo" => nil, "bar" => nil
  end

  specify "ignores to many /'s" do
    result = invoke_simple('/x/y', '/x//y')
    result.should.not.be.nil
  end

  specify "understands splat" do
    invoke_simple('/foo/*', '/foo/bar').should.not.be.nil
    invoke_simple('/foo/*', '/foo/bar/baz').should.not.be.nil
    invoke_simple('/foo/*', '/foo/baz').should.not.be.nil
  end

end
