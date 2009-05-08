require File.dirname(__FILE__) + '/helper'

describe 'Sinatra::Request' do
  it 'responds to #user_agent' do
    request = Sinatra::Request.new({'HTTP_USER_AGENT' => 'Test'})
    assert request.respond_to?(:user_agent)
    assert_equal 'Test', request.user_agent
  end

  it 'parses POST params when Content-Type is form-dataish' do
    request = Sinatra::Request.new(
      'REQUEST_METHOD' => 'PUT',
      'CONTENT_TYPE' => 'application/x-www-form-urlencoded',
      'rack.input' => StringIO.new('foo=bar')
    )
    assert_equal 'bar', request.params['foo']
  end
end
