require File.dirname(__FILE__) + '/helper'

context "Templates" do

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
