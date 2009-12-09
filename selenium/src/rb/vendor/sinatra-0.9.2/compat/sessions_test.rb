require File.dirname(__FILE__) + '/helper'

context "Sessions" do

  setup { Sinatra.application = nil }

  specify "should be off by default" do
    get '/asdf' do
      session[:test] = true
      "asdf"
    end

    get '/test' do
      session[:test] == true ? "true" : "false"
    end

    get_it '/asdf', {}, 'HTTP_HOST' => 'foo.sinatrarb.com'
    assert ok?
    assert !include?('Set-Cookie')
  end

  specify "should be able to store data accross requests" do
    set_option :sessions, true
    set_option :environment, :not_test # necessary because sessions are disabled

    get '/foo' do
      session[:test] = true
      "asdf"
    end

    get '/bar' do
      session[:test] == true ? "true" : "false"
    end

    get_it '/foo', :env => { :host => 'foo.sinatrarb.com' }
    assert ok?
    assert include?('Set-Cookie')

    set_option :environment, :test
  end

end
