require File.dirname(__FILE__) + '/helper'
require 'builder'

class BuilderTest < Test::Unit::TestCase
  def builder_app(&block)
    mock_app {
      set :views, File.dirname(__FILE__) + '/views'
      get '/', &block
    }
    get '/'
  end

  it 'renders inline Builder strings' do
    builder_app { builder 'xml.instruct!' }
    assert ok?
    assert_equal %{<?xml version="1.0" encoding="UTF-8"?>\n}, body
  end

  it 'renders inline blocks' do
    builder_app {
      @name = "Frank & Mary"
      builder do |xml|
        xml.couple @name
      end
    }
    assert ok?
    assert_equal "<couple>Frank &amp; Mary</couple>\n", body
  end

  it 'renders .builder files in views path' do
    builder_app {
      @name = "Blue"
      builder :hello
    }
    assert ok?
    assert_equal %(<exclaim>You're my boy, Blue!</exclaim>\n), body
  end

  it "renders with inline layouts" do
    mock_app {
      layout do
        %(xml.layout { xml << yield })
      end
      get('/') { builder %(xml.em 'Hello World') }
    }
    get '/'
    assert ok?
    assert_equal "<layout>\n<em>Hello World</em>\n</layout>\n", body
  end

  it "renders with file layouts" do
    builder_app {
      builder %(xml.em 'Hello World'), :layout => :layout2
    }
    assert ok?
    assert_equal "<layout>\n<em>Hello World</em>\n</layout>\n", body
  end

  it "raises error if template not found" do
    mock_app {
      get('/') { builder :no_such_template }
    }
    assert_raise(Errno::ENOENT) { get('/') }
  end
end
