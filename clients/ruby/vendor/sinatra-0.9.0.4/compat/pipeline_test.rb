require File.dirname(__FILE__) + '/helper'

class UpcaseMiddleware
  def initialize(app, *args, &block)
    @app = app
    @args = args
    @block = block
  end
  def call(env)
    env['PATH_INFO'] = env['PATH_INFO'].to_s.upcase
    @app.call(env)
  end
end

context "Middleware Pipelines" do

  setup do
    Sinatra.application = nil
    @app = Sinatra.application
  end

  teardown do
    Sinatra.application = nil
  end

  # Sessions and logging are tested elsewhere. This is a bad test because it
  # asserts things about the implementation and not the effect.
  xspecify "includes default middleware with options set" do
    @app.set_options :sessions => true, :logging => true
    @app.send(:optional_middleware).should.include([Rack::Session::Cookie, [], nil])
    @app.send(:optional_middleware).should.include([Rack::CommonLogger, [], nil])
  end

  # Bad test.
  xspecify "does not include default middleware with options unset" do
    @app.set_options :sessions => false, :logging => false
    @app.send(:optional_middleware).should.not.include([Rack::Session::Cookie, [], nil])
    @app.send(:optional_middleware).should.not.include([Rack::CommonLogger, [], nil])
  end

  # Bad test.
  xspecify "includes only optional middleware when no explicit middleware added" do
    @app.set_options :sessions => true, :logging => true
    @app.send(:middleware).should.equal @app.send(:optional_middleware)
  end

  # Bad test.
  xspecify "should clear middleware before reload" do
    @app.clearables.should.include(@app.send(:explicit_middleware))
  end

  specify "should add middleware with use" do
    block = Proc.new { |env| }
    @app.use UpcaseMiddleware
    @app.use UpcaseMiddleware, "foo", "bar"
    @app.use UpcaseMiddleware, "foo", "bar", &block
    @app.send(:middleware).should.include([UpcaseMiddleware, [], nil])
    @app.send(:middleware).should.include([UpcaseMiddleware, ["foo", "bar"], nil])
    @app.send(:middleware).should.include([UpcaseMiddleware, ["foo", "bar"], block])
  end

  specify "should run middleware added with use" do
    get('/foo') { "FAIL!" }
    get('/FOO') { "PASS!" }
    use UpcaseMiddleware
    get_it '/foo'
    should.be.ok
    body.should.equal "PASS!"
  end

end
