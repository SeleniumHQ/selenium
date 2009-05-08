require File.dirname(__FILE__) + '/helper'

context "Sass" do

  setup do
    Sinatra.application = nil
  end

  context "Templates (in general)" do

    setup do
      Sinatra.application = nil
    end

    specify "are read from files if Symbols" do

      get '/from_file' do
        sass :foo, :views_directory => File.dirname(__FILE__) + "/views"
      end

      get_it '/from_file'
      should.be.ok
      body.should.equal "#sass {\n  background_color: #FFF; }\n"

    end

    specify "raise an error if template not found" do
      get '/' do
        sass :not_found
      end

      lambda { get_it '/' }.should.raise(Errno::ENOENT)
    end

    specify "ignore default layout file with .sass extension" do
      get '/' do
        sass :foo, :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/'
      should.be.ok
      body.should.equal "#sass {\n  background_color: #FFF; }\n"
    end

    specify "ignore explicitly specified layout file" do
      get '/' do
        sass :foo, :layout => :layout, :views_directory => File.dirname(__FILE__) + "/views/layout_test"
      end

      get_it '/'
      should.be.ok
      body.should.equal "#sass {\n  background_color: #FFF; }\n"
    end

  end

end
