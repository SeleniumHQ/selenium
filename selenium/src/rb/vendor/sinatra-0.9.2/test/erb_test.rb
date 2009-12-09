require File.dirname(__FILE__) + '/helper'

class ERBTest < Test::Unit::TestCase
  def erb_app(&block)
    mock_app {
      set :views, File.dirname(__FILE__) + '/views'
      get '/', &block
    }
    get '/'
  end

  it 'renders inline ERB strings' do
    erb_app { erb '<%= 1 + 1 %>' }
    assert ok?
    assert_equal '2', body
  end

  it 'renders .erb files in views path' do
    erb_app { erb :hello }
    assert ok?
    assert_equal "Hello World\n", body
  end

  it 'takes a :locals option' do
    erb_app {
      locals = {:foo => 'Bar'}
      erb '<%= foo %>', :locals => locals
    }
    assert ok?
    assert_equal 'Bar', body
  end

  it "renders with inline layouts" do
    mock_app {
      layout { 'THIS. IS. <%= yield.upcase %>!' }
      get('/') { erb 'Sparta' }
    }
    get '/'
    assert ok?
    assert_equal 'THIS. IS. SPARTA!', body
  end

  it "renders with file layouts" do
    erb_app {
      erb 'Hello World', :layout => :layout2
    }
    assert ok?
    assert_equal "ERB Layout!\nHello World\n", body
  end

  it "renders erb with blocks" do
    mock_app {
      def container
        @_out_buf << "THIS."
        yield
        @_out_buf << "SPARTA!"
      end
      def is; "IS." end
      get '/' do
        erb '<% container do %> <%= is %> <% end %>'
      end
    }
    get '/'
    assert ok?
    assert_equal 'THIS. IS. SPARTA!', body
  end

  it "can be used in a nested fashion for partials and whatnot" do
    mock_app {
      template(:inner) { "<inner><%= 'hi' %></inner>" }
      template(:outer) { "<outer><%= erb :inner %></outer>" }
      get '/' do
        erb :outer
      end
    }

    get '/'
    assert ok?
    assert_equal '<outer><inner>hi</inner></outer>', body
  end
end
