require File.dirname(__FILE__) + '/helper'

context "Builder" do

  setup do
    Sinatra.application = nil
  end

  context "without layouts" do

    setup do
      Sinatra.application = nil
    end

    specify "should render" do

      get '/no_layout' do
        builder 'xml.instruct!'
      end

      get_it '/no_layout'
      should.be.ok
      body.should == %(<?xml version="1.0" encoding="UTF-8"?>\n)

    end

    specify "should render inline block" do

      get '/no_layout_and_inlined' do
        @name = "Frank & Mary"
        builder do |xml|
          xml.couple @name
        end
      end

      get_it '/no_layout_and_inlined'
      should.be.ok
      body.should == %(<couple>Frank &amp; Mary</couple>\n)

    end

  end



  context "Templates (in general)" do

    setup do
      Sinatra.application = nil
    end

    specify "are read from files if Symbols" do

      get '/from_file' do
        @name = 'Blue'
        builder :foo, :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/from_file'
      should.be.ok
      body.should.equal %(<exclaim>You rock Blue!</exclaim>\n)

    end

    specify "use layout.ext by default if available" do

      get '/' do
        builder :foo, :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/'
      should.be.ok
      body.should.equal "<layout>\n<this>is foo!</this>\n</layout>\n"

    end

    specify "renders without layout" do

      get '/' do
        builder :no_layout, :views_directory => File.dirname(__FILE__) + "/views/no_layout"
      end

      get_it '/'
      should.be.ok
      body.should.equal "<foo>No Layout!</foo>\n"

    end

    specify "raises error if template not found" do

      get '/' do
        builder :not_found
      end

      lambda { get_it '/' }.should.raise(Errno::ENOENT)

    end

  end

end
