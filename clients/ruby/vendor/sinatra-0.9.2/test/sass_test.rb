require File.dirname(__FILE__) + '/helper'
require 'sass'

class SassTest < Test::Unit::TestCase
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

  it "passes SASS options to the Sass engine" do
    sass_app {
      sass "#sass\n  :background-color #FFF\n  :color #000\n", :style => :compact
    }
    assert ok?
    assert_equal "#sass { background-color: #FFF; color: #000; }\n", body
  end

  it "passes default SASS options to the Sass engine" do
    mock_app {
      set :sass, {:style => :compact} # default Sass style is :nested
      get '/' do
        sass "#sass\n  :background-color #FFF\n  :color #000\n"
      end
    }
    get '/'
    assert ok?
    assert_equal "#sass { background-color: #FFF; color: #000; }\n", body
  end

  it "merges the default SASS options with the overrides and passes them to the Sass engine" do
    mock_app {
      set :sass, {:style => :compact, :attribute_syntax => :alternate } # default Sass attribute_syntax is :normal (with : in front)
      get '/' do
        sass "#sass\n  background-color: #FFF\n  color: #000\n"
      end
      get '/raised' do
        sass "#sass\n  :background-color #FFF\n  :color #000\n", :style => :expanded # retains global attribute_syntax settings
      end
      get '/expanded_normal' do
        sass "#sass\n  :background-color #FFF\n  :color #000\n", :style => :expanded, :attribute_syntax => :normal
      end
    }
    get '/'
    assert ok?
    assert_equal "#sass { background-color: #FFF; color: #000; }\n", body
    assert_raise(Sass::SyntaxError) { get('/raised') }
    get '/expanded_normal'
    assert ok?
    assert_equal "#sass {\n  background-color: #FFF;\n  color: #000;\n}\n", body
  end
end
