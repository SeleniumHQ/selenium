require File.dirname(__FILE__) + '/helper'

require 'sass/error'

class RenderBacktraceTest < Test::Unit::TestCase
  VIEWS = File.dirname(__FILE__) + '/views'

  def assert_raise_at(filename, line, exception = RuntimeError)
    f, l = nil
    assert_raise(exception) do
      begin
        get('/')
      rescue => e
        f, l = e.backtrace.first.split(':')
        raise
      end
    end
    assert_equal(filename, f, "expected #{exception.name} in #{filename}, was #{f}")
    assert_equal(line, l.to_i, "expected #{exception.name} in #{filename} at line #{line}, was at line #{l}")
  end

  def backtrace_app(&block)
    mock_app {
      use_in_file_templates!
      set :views, RenderBacktraceTest::VIEWS
      template :builder_template do
        'raise "error"'
      end
      template :erb_template do
        '<% raise "error" %>'
      end
      template :haml_template do
        '%h1= raise "error"'
      end
      template :sass_template do
        '+syntax-error'
      end
      get '/', &block
    }
  end

  it "provides backtrace for Builder template" do
    backtrace_app { builder :error }
    assert_raise_at(File.join(VIEWS,'error.builder'), 2)
  end

  it "provides backtrace for ERB template" do
    backtrace_app { erb :error }
    assert_raise_at(File.join(VIEWS,'error.erb'), 2)
  end

  it "provides backtrace for HAML template" do
    backtrace_app { haml :error }
    assert_raise_at(File.join(VIEWS,'error.haml'), 2)
  end

  it "provides backtrace for Sass template" do
    backtrace_app { sass :error }
    assert_raise_at(File.join(VIEWS,'error.sass'), 2, Sass::SyntaxError)
  end

  it "provides backtrace for ERB template with locals" do
    backtrace_app { erb :error, {}, :french => true }
    assert_raise_at(File.join(VIEWS,'error.erb'), 3)
  end

  it "provides backtrace for HAML template with locals" do
    backtrace_app { haml :error, {}, :french => true }
    assert_raise_at(File.join(VIEWS,'error.haml'), 3)
  end

  it "provides backtrace for inline Builder string" do
    backtrace_app { builder "raise 'Ack! Thbbbt!'"}
    assert_raise_at(__FILE__, (__LINE__-1))
  end

  it "provides backtrace for inline ERB string" do
    backtrace_app { erb "<% raise 'bidi-bidi-bidi' %>" }
    assert_raise_at(__FILE__, (__LINE__-1))
  end

  it "provides backtrace for inline HAML string" do
    backtrace_app { haml "%h1= raise 'Lions and tigers and bears! Oh, my!'" }
    assert_raise_at(__FILE__, (__LINE__-1))
  end

  # it "provides backtrace for inline Sass string" do
  #   backtrace_app { sass '+buh-bye' }
  #   assert_raise_at(__FILE__, (__LINE__-1), Sass::SyntaxError)
  # end

  it "provides backtrace for named Builder template" do
    backtrace_app { builder :builder_template }
    assert_raise_at(__FILE__, (__LINE__-68))
  end

  it "provides backtrace for named ERB template" do
    backtrace_app { erb :erb_template }
    assert_raise_at(__FILE__, (__LINE__-70))
  end

  it "provides backtrace for named HAML template" do
    backtrace_app { haml :haml_template }
    assert_raise_at(__FILE__, (__LINE__-72))
  end

  # it "provides backtrace for named Sass template" do
  #   backtrace_app { sass :sass_template }
  #   assert_raise_at(__FILE__, (__LINE__-74), Sass::SyntaxError)
  # end

  it "provides backtrace for in file Builder template" do
    backtrace_app { builder :builder_in_file }
    assert_raise_at(__FILE__, (__LINE__+22))
  end

  it "provides backtrace for in file ERB template" do
    backtrace_app { erb :erb_in_file }
    assert_raise_at(__FILE__, (__LINE__+20))
  end

  it "provides backtrace for in file HAML template" do
    backtrace_app { haml :haml_in_file }
    assert_raise_at(__FILE__, (__LINE__+18))
  end

  # it "provides backtrace for in file Sass template" do
  #   backtrace_app { sass :sass_in_file }
  #   assert_raise_at(__FILE__, (__LINE__+16), Sass::SyntaxError)
  # end
end

__END__

@@ builder_in_file
raise "bif"

@@ erb_in_file
<% raise "bam" %>

@@ haml_in_file
%h1= raise "pow"

@@ sass_in_file
+blam
