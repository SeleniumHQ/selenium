require File.dirname(__FILE__) + '/helper'

describe "Sass Templates" do
  def sass_app(&block)
    mock_app {
      set :views, File.dirname(__FILE__) + '/views'
      get '/', &block
    }
    get '/'
  end

  it 'renders inline Sass strings' do
    sass_app { sass "#sass\n  :background-color #FFF\n" }
    assert ok?
    assert_equal "#sass {\n  background-color: #FFF; }\n", body
  end

  it 'renders .sass files in views path' do
    sass_app { sass :hello }
    assert ok?
    assert_equal "#sass {\n  background-color: #FFF; }\n", body
  end

  it 'ignores the layout option' do
    sass_app { sass :hello, :layout => :layout2 }
    assert ok?
    assert_equal "#sass {\n  background-color: #FFF; }\n", body
  end

  it "raises error if template not found" do
    mock_app {
      get('/') { sass :no_such_template }
    }
    assert_raise(Errno::ENOENT) { get('/') }
  end
end
