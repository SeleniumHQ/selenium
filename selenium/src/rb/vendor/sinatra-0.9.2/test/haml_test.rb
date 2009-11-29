require File.dirname(__FILE__) + '/helper'
require 'haml'

class HAMLTest < Test::Unit::TestCase
  def haml_app(&block)
    mock_app {
      set :views, File.dirname(__FILE__) + '/views'
      get '/', &block
    }
    get '/'
  end

  it 'renders inline HAML strings' do
    haml_app { haml '%h1 Hiya' }
    assert ok?
    assert_equal "<h1>Hiya</h1>\n", body
  end

  it 'renders .haml files in views path' do
    haml_app { haml :hello }
    assert ok?
    assert_equal "<h1>Hello From Haml</h1>\n", body
  end

  it "renders with inline layouts" do
    mock_app {
      layout { %q(%h1= 'THIS. IS. ' + yield.upcase) }
      get('/') { haml '%em Sparta' }
    }
    get '/'
    assert ok?
    assert_equal "<h1>THIS. IS. <EM>SPARTA</EM></h1>\n", body
  end

  it "renders with file layouts" do
    haml_app {
      haml 'Hello World', :layout => :layout2
    }
    assert ok?
    assert_equal "<h1>HAML Layout!</h1>\n<p>Hello World</p>\n", body
  end

  it "raises error if template not found" do
    mock_app {
      get('/') { haml :no_such_template }
    }
    assert_raise(Errno::ENOENT) { get('/') }
  end

  it "passes HAML options to the Haml engine" do
    mock_app {
      get '/' do
        haml "!!!\n%h1 Hello World", :format => :html5
      end
    }
    get '/'
    assert ok?
    assert_equal "<!DOCTYPE html>\n<h1>Hello World</h1>\n", body
  end

  it "passes default HAML options to the Haml engine" do
    mock_app {
      set :haml, {:format => :html5}
      get '/' do
        haml "!!!\n%h1 Hello World"
      end
    }
    get '/'
    assert ok?
    assert_equal "<!DOCTYPE html>\n<h1>Hello World</h1>\n", body
  end

  it "merges the default HAML options with the overrides and passes them to the Haml engine" do
    mock_app {
      set :haml, {:format => :html5, :attr_wrapper => '"'} # default HAML attr are <tag attr='single-quoted'>
      get '/' do
        haml "!!!\n%h1{:class => :header} Hello World"
      end
      get '/html4' do
        haml "!!!\n%h1{:class => 'header'} Hello World", :format => :html4
      end
    }
    get '/'
    assert ok?
    assert_equal "<!DOCTYPE html>\n<h1 class=\"header\">Hello World</h1>\n", body
    get '/html4'
    assert ok?
    assert_match(/^<!DOCTYPE html PUBLIC (.*) HTML 4.01/, body)
  end
end
