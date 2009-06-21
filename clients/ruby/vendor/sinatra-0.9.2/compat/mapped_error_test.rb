require File.dirname(__FILE__) + '/helper'

class FooError < RuntimeError; end

context "Mapped errors" do

  setup do
    Sinatra.application = nil
    Sinatra.application.options.raise_errors = false
  end

  specify "are rescued and run in context" do

    error FooError do
      'MAPPED ERROR!'
    end

    get '/' do
      raise FooError
    end

    get_it '/'

    should.be.server_error
    body.should.equal 'MAPPED ERROR!'

  end

  specify "renders empty if no each method on result" do

    error FooError do
      nil
    end

    get '/' do
      raise FooError
    end

    get_it '/'

    should.be.server_error
    body.should.be.empty

  end

  specify "doesn't override status if set" do

    error FooError do
      status(200)
    end

    get '/' do
      raise FooError
    end

    get_it '/'

    should.be.ok

  end

  specify "raises errors when the raise_errors option is set" do
    Sinatra.application.options.raise_errors = true
    error FooError do
    end
    get '/' do
      raise FooError
    end
    assert_raises(FooError) { get_it('/') }
  end

end
