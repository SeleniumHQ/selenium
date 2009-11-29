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
