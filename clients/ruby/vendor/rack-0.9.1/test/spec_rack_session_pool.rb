require 'test/spec'

require 'rack/session/pool'
require 'rack/mock'
require 'rack/response'
require 'thread'

context "Rack::Session::Pool" do
  incrementor = lambda { |env|
    env["rack.session"]["counter"] ||= 0
    env["rack.session"]["counter"] += 1
    Rack::Response.new(env["rack.session"].inspect).to_a
  }

  specify "creates a new cookie" do
    pool = Rack::Session::Pool.new(incrementor)
    res = Rack::MockRequest.new(pool).get("/")
    res["Set-Cookie"].should.match("rack.session=")
    res.body.should.equal '{"counter"=>1}'
  end

  specify "determines session from a cookie" do
    pool = Rack::Session::Pool.new(incrementor)
    res = Rack::MockRequest.new(pool).get("/")
    cookie = res["Set-Cookie"]
    res = Rack::MockRequest.new(pool).get("/", "HTTP_COOKIE" => cookie)
    res.body.should.equal '{"counter"=>2}'
    res = Rack::MockRequest.new(pool).get("/", "HTTP_COOKIE" => cookie)
    res.body.should.equal '{"counter"=>3}'
  end

  specify "survives broken cookies" do
    pool = Rack::Session::Pool.new(incrementor)
    res = Rack::MockRequest.new(pool).
      get("/", "HTTP_COOKIE" => "rack.session=blarghfasel")
    res.body.should.equal '{"counter"=>1}'
  end

  specify "maintains freshness" do
    pool = Rack::Session::Pool.new(incrementor, :expire_after => 3)
    res = Rack::MockRequest.new(pool).get('/')
    res.body.should.include '"counter"=>1'
    cookie = res["Set-Cookie"]
    res = Rack::MockRequest.new(pool).get('/', "HTTP_COOKIE" => cookie)
    res["Set-Cookie"].should.equal cookie
    res.body.should.include '"counter"=>2'
    sleep 4
    res = Rack::MockRequest.new(pool).get('/', "HTTP_COOKIE" => cookie)
    res["Set-Cookie"].should.not.equal cookie
    res.body.should.include '"counter"=>1'
  end

  specify "multithread: should merge sessions" do
    delta_incrementor = lambda do |env|
      # emulate disconjoinment of threading
      env['rack.session'] = env['rack.session'].dup
      Thread.stop
      env['rack.session'][(Time.now.usec*rand).to_i] = true
      incrementor.call(env)
    end
    pool = Rack::Session::Pool.new(incrementor)
    res = Rack::MockRequest.new(pool).get('/')
    res.body.should.equal '{"counter"=>1}'
    cookie = res["Set-Cookie"]
    sess_id = cookie[/#{pool.key}=([^,;]+)/,1]

    pool = pool.context(delta_incrementor)
    r = Array.new(rand(7).to_i+3).
      map! do
        Thread.new do
          Rack::MockRequest.new(pool).get('/', "HTTP_COOKIE" => cookie)
        end
      end.
      reverse!.
      map!{|t| t.run.join.value }
    session = pool.for.pool[sess_id] # for is needed by Utils::Context
    session.size.should.be r.size+1 # counter
    session['counter'].should.be 2 # meeeh
    r.each do |res|
      res['Set-Cookie'].should.equal cookie
      res.body.should.include '"counter"=>2'
    end
  end
end
