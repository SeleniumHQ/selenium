require File.dirname(__FILE__) + '/helper'

describe 'Options' do
  before { @app = Class.new(Sinatra::Base) }

  it 'sets options to literal values' do
    @app.set(:foo, 'bar')
    assert @app.respond_to?(:foo)
    assert_equal 'bar', @app.foo
  end

  it 'sets options to Procs' do
    @app.set(:foo, Proc.new { 'baz' })
    assert @app.respond_to?(:foo)
    assert_equal 'baz', @app.foo
  end

  it "sets multiple options with a Hash" do
    @app.set :foo => 1234,
        :bar => 'Hello World',
        :baz => Proc.new { 'bizzle' }
    assert_equal 1234, @app.foo
    assert_equal 'Hello World', @app.bar
    assert_equal 'bizzle', @app.baz
  end

  it 'inherits option methods when subclassed' do
    @app.set :foo, 'bar'
    @app.set :biz, Proc.new { 'baz' }

    sub = Class.new(@app)
    assert sub.respond_to?(:foo)
    assert_equal 'bar', sub.foo
    assert sub.respond_to?(:biz)
    assert_equal 'baz', sub.biz
  end

  it 'overrides options in subclass' do
    @app.set :foo, 'bar'
    @app.set :biz, Proc.new { 'baz' }
    sub = Class.new(@app)
    sub.set :foo, 'bling'
    assert_equal 'bling', sub.foo
    assert_equal 'bar', @app.foo
  end

  it 'creates setter methods when first defined' do
    @app.set :foo, 'bar'
    assert @app.respond_to?('foo=')
    @app.foo = 'biz'
    assert_equal 'biz', @app.foo
  end

  it 'creates predicate methods when first defined' do
    @app.set :foo, 'hello world'
    assert @app.respond_to?(:foo?)
    assert @app.foo?
    @app.set :foo, nil
    assert !@app.foo?
  end

  it 'uses existing setter methods if detected' do
    class << @app
      def foo
        @foo
      end
      def foo=(value)
        @foo = 'oops'
      end
    end

    @app.set :foo, 'bam'
    assert_equal 'oops', @app.foo
  end

  it "sets multiple options to true with #enable" do
    @app.enable :sessions, :foo, :bar
    assert @app.sessions
    assert @app.foo
    assert @app.bar
  end

  it "sets multiple options to false with #disable" do
    @app.disable :sessions, :foo, :bar
    assert !@app.sessions
    assert !@app.foo
    assert !@app.bar
  end

  it 'enables MethodOverride middleware when :methodoverride is enabled' do
    @app.set :methodoverride, true
    @app.put('/') { 'okay' }
    post '/', {'_method'=>'PUT'}, {}
    assert_equal 200, status
    assert_equal 'okay', body
  end
end
