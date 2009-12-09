require File.dirname(__FILE__) + '/helper'

context "Haml" do

  setup do
    Sinatra.application = nil
  end

  context "without layouts" do

    setup do
      Sinatra.application = nil
    end

    specify "should render" do

      get '/no_layout' do
        haml '== #{1+1}'
      end

      get_it '/no_layout'
      should.be.ok
      body.should == "2\n"

    end
  end

  context "with layouts" do

    setup do
      Sinatra.application = nil
    end

    specify "can be inline" do

      layout do
        '== This is #{yield}!'
      end

      get '/lay' do
        haml 'Blake'
      end

      get_it '/lay'
      should.be.ok
      body.should.equal "This is Blake\n!\n"

    end

    specify "can use named layouts" do

      layout :pretty do
        '%h1== #{yield}'
      end

      get '/pretty' do
        haml 'Foo', :layout => :pretty
      end

      get '/not_pretty' do
        haml 'Bar'
      end

      get_it '/pretty'
      body.should.equal "<h1>Foo</h1>\n"

      get_it '/not_pretty'
      body.should.equal "Bar\n"

    end

    specify "can be read from a file if they're not inlined" do

      get '/foo' do
        @title = 'Welcome to the Hello Program'
        haml 'Blake', :layout => :foo_layout,
                      :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/foo'
      body.should.equal "Welcome to the Hello Program\nHi Blake\n"

    end

    specify "can be read from file and layout from text" do
      get '/foo' do
        haml 'Test', :layout => '== Foo #{yield}'
      end

      get_it '/foo'

      body.should.equal "Foo Test\n"
    end

  end

  context "Templates (in general)" do

    setup do
      Sinatra.application = nil
    end

    specify "are read from files if Symbols" do

      get '/from_file' do
        @name = 'Alena'
        haml :foo, :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/from_file'

      body.should.equal "You rock Alena!\n"

    end

    specify "use layout.ext by default if available" do

      get '/' do
        haml :foo, :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/'
      should.be.ok
      body.should.equal "x This is foo!\n x\n"

    end

    specify "renders without layout" do

      get '/' do
        haml :no_layout, :views_directory => File.dirname(__FILE__) + "/views/no_layout"
      end

      get_it '/'
      should.be.ok
      body.should.equal "<h1>No Layout!</h1>\n"

    end

    specify "can render with no layout" do
      layout do
        "X\n= yield\nX"
      end

      get '/' do
        haml 'blake', :layout => false
      end

      get_it '/'

      body.should.equal "blake\n"
    end

    specify "raises error if template not found" do
      get '/' do
        haml :not_found
      end

      lambda { get_it '/' }.should.raise(Errno::ENOENT)
    end

    specify "use layout.ext by default if available" do

      template :foo do
        'asdf'
      end

      get '/' do
        haml :foo, :layout => false,
                   :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/'
      should.be.ok
      body.should.equal "asdf\n"

    end

  end

  describe 'Options passed to the HAML interpreter' do
    setup do
      Sinatra.application = nil
    end

    specify 'default to filename and line of caller' do

      get '/' do
        haml 'foo'
      end

      Haml::Engine.expects(:new).with('foo', {:filename => __FILE__,
        :line => (__LINE__-4)}).returns(stub(:render => 'foo'))

      get_it '/'
      should.be.ok

    end

    specify 'can be configured by passing :options to haml' do

      get '/' do
        haml 'foo', :options => {:format => :html4}
      end

      Haml::Engine.expects(:new).with('foo', {:filename => __FILE__,
        :line => (__LINE__-4), :format => :html4}).returns(stub(:render => 'foo'))

      get_it '/'
      should.be.ok

    end

    specify 'can be configured using set_option :haml' do

      configure do
        set_option :haml, :format       => :html4,
                          :escape_html  => true
      end

      get '/' do
        haml 'foo'
      end

      Haml::Engine.expects(:new).with('foo', {:filename => __FILE__,
        :line => (__LINE__-4), :format => :html4,
        :escape_html => true}).returns(stub(:render => 'foo'))

      get_it '/'
      should.be.ok

    end

  end

end
