require File.dirname(__FILE__) + '/helper'

context "Rendering in file templates" do

  setup do
    Sinatra.application = nil
    use_in_file_templates!
  end

  specify "should set template" do
    assert Sinatra.application.templates[:foo]
  end

  specify "should set layout" do
    assert Sinatra.application.templates[:layout]
  end

  specify "should render without layout if specified" do
    get '/' do
      haml :foo, :layout => false
    end

    get_it '/'
    assert_equal "this is foo\n", body
  end

  specify "should render with layout if specified" do
    get '/' do
      haml :foo
    end

    get_it '/'
    assert_equal "X\nthis is foo\nX\n", body
  end

end

__END__

@@ foo
this is foo

@@ layout
X
= yield
X

