require File.dirname(__FILE__) + '/helper'

context "Erb" do

  setup do
    Sinatra.application = nil
  end

  context "without layouts" do

    setup do
      Sinatra.application = nil
    end

    specify "should render" do

      get '/no_layout' do
        erb '<%= 1 + 1 %>'
      end

      get_it '/no_layout'
      should.be.ok
      body.should == '2'

    end

    specify "should take an options hash with :locals set with a string" do
      get '/locals' do
        erb '<%= foo %>', :locals => {:foo => "Bar"}
      end

      get_it '/locals'
      should.be.ok
      body.should == 'Bar'
    end

    specify "should take an options hash with :locals set with a complex object" do
      get '/locals-complex' do
        erb '<%= foo[0] %>', :locals => {:foo => ["foo", "bar", "baz"]}
      end

      get_it '/locals-complex'
      should.be.ok
      body.should == 'foo'
    end
  end

  context "with layouts" do

    setup do
      Sinatra.application = nil
    end

    specify "can be inline" do

      layout do
        %Q{This is <%= yield %>!}
      end

      get '/lay' do
        erb 'Blake'
      end

      get_it '/lay'
      should.be.ok
      body.should.equal 'This is Blake!'

    end

    specify "can use named layouts" do

      layout :pretty do
        %Q{<h1><%= yield %></h1>}
      end

      get '/pretty' do
        erb 'Foo', :layout => :pretty
      end

      get '/not_pretty' do
        erb 'Bar'
      end

      get_it '/pretty'
      body.should.equal '<h1>Foo</h1>'

      get_it '/not_pretty'
      body.should.equal 'Bar'

    end

    specify "can be read from a file if they're not inlined" do

      get '/foo' do
        @title = 'Welcome to the Hello Program'
        erb 'Blake', :layout => :foo_layout,
                     :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/foo'
      body.should.equal "Welcome to the Hello Program\nHi Blake\n"

    end

  end

  context "Templates (in general)" do

    specify "are read from files if Symbols" do

      get '/from_file' do
        @name = 'Alena'
        erb :foo, :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/from_file'

      body.should.equal 'You rock Alena!'

    end

    specify "use layout.ext by default if available" do

      get '/layout_from_file' do
        erb :foo, :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/layout_from_file'
      should.be.ok
      body.should.equal "x This is foo! x \n"

    end

  end

end
