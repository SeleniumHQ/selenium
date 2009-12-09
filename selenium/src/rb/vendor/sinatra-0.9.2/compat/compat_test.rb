require File.dirname(__FILE__) + '/helper'

context "Compat" do
  setup do
    Sinatra.application = nil
    @app = Sinatra.application
  end

  specify "makes EventContext available" do
    assert_same Sinatra::Default, Sinatra::EventContext
  end
end
