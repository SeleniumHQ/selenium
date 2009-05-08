require File.dirname(__FILE__) + '/helper'

context "Custom Errors" do

  setup do
    Sinatra.application = nil
  end

  specify "override the default 404" do

    get_it '/'
    should.be.not_found
    body.should.equal '<h1>Not Found</h1>'

    error Sinatra::NotFound do
      'Custom 404'
    end

    get_it '/'
    should.be.not_found
    body.should.equal 'Custom 404'

  end

  specify "override the default 500" do
    Sinatra.application.options.raise_errors = false

    get '/' do
      raise 'asdf'
    end

    get_it '/'
    status.should.equal 500
    body.should.equal '<h1>Internal Server Error</h1>'


    error do
      'Custom 500 for ' + request.env['sinatra.error'].message
    end

    get_it '/'

    get_it '/'
    status.should.equal 500
    body.should.equal 'Custom 500 for asdf'

    Sinatra.application.options.raise_errors = true
  end

  class UnmappedError < RuntimeError; end

  specify "should bring unmapped error back to the top" do
    get '/' do
      raise UnmappedError, 'test'
    end

    assert_raises(UnmappedError) do
      get_it '/'
    end
  end

end
