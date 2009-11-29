require File.dirname(__FILE__) + '/helper'

class TemplatesTest < Test::Unit::TestCase
  def render_app(&block)
    mock_app {
      def render_test(template, data, options, locals, &block)
        inner = block ? block.call : ''
        data + inner
      end
      set :views, File.dirname(__FILE__) + '/views'
      get '/', &block
      template(:layout3) { "Layout 3!\n" }
    }
    get '/'
  end

  def with_default_layout
    layout = File.dirname(__FILE__) + '/views/layout.test'
    File.open(layout, 'wb') { |io| io.write "Layout!\n" }
    yield
  ensure
    File.unlink(layout) rescue nil
  end

  it 'renders String templates directly' do
    render_app { render :test, 'Hello World' }
    assert ok?
    assert_equal 'Hello World', body
  end

  it 'renders Proc templates using the call result' do
    render_app { render :test, Proc.new {'Hello World'} }
    assert ok?
    assert_equal 'Hello World', body
  end

  it 'looks up Symbol templates in views directory' do
    render_app { render :test, :hello }
    assert ok?
    assert_equal "Hello World!\n", body
  end

  it 'uses the default layout template if not explicitly overridden' do
    with_default_layout do
      render_app { render :test, :hello }
      assert ok?
      assert_equal "Layout!\nHello World!\n", body
    end
  end

  it 'uses the default layout template if not really overriden' do
    with_default_layout do
      render_app { render :test, :hello, :layout => true }
      assert ok?
      assert_equal "Layout!\nHello World!\n", body
    end
  end

  it 'uses the layout template specified' do
    render_app { render :test, :hello, :layout => :layout2 }
    assert ok?
    assert_equal "Layout 2!\nHello World!\n", body
  end

  it 'uses layout templates defined with the #template method' do
    render_app { render :test, :hello, :layout => :layout3 }
    assert ok?
    assert_equal "Layout 3!\nHello World!\n", body
  end

  it 'loads templates from source file with use_in_file_templates!' do
    mock_app {
      use_in_file_templates!
    }
    assert_equal "this is foo\n\n", @app.templates[:foo][:template]
    assert_equal "X\n= yield\nX\n", @app.templates[:layout][:template]
  end

  test 'use_in_file_templates simply ignores IO errors' do
    assert_nothing_raised {
      mock_app {
        use_in_file_templates!('/foo/bar')
      }
    }

    assert @app.templates.empty?
  end
end

# __END__ : this is not the real end of the script.

__END__

@@ foo
this is foo

@@ layout
X
= yield
X
