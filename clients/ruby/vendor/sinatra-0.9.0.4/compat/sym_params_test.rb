require File.dirname(__FILE__) + '/helper'

context "Symbol Params" do

  setup do
    Sinatra.application = nil
  end

  specify "should be accessable as Strings or Symbols" do
    get '/' do
      params[:foo] + params['foo']
    end

    get_it '/', :foo => "X"
    assert_equal('XX', body)
  end

end

