require 'test/spec'

begin
  require 'rack/session/memcache'
  require 'rack/mock'
  require 'rack/response'
  require 'thread'

  context "Rack::Session::Memcache" do
    incrementor = lambda { |env|
      env["rack.session"]["counter"] ||= 0
      env["rack.session"]["counter"] += 1
      Rack::Response.new(env["rack.session"].inspect).to_a
    }

    # Keep this first.
    specify "startup" do
      $pid = fork {
        exec "memcached"
      }
      sleep 1
    end

    specify "faults on no connection" do
      lambda do
        Rack::Session::Memcache.new(incrementor, :memcache_server => '')
      end.should.raise
    end

    specify "creates a new cookie" do
      cache = Rack::Session::Memcache.new(incrementor)
      res = Rack::MockRequest.new(cache).get("/")
      res["Set-Cookie"].should.match("rack.session=")
      res.body.should.equal '{"counter"=>1}'
    end

    specify "determines session from a cookie" do
      cache = Rack::Session::Memcache.new(incrementor)
      res = Rack::MockRequest.new(cache).get("/")
      cookie = res["Set-Cookie"]
      res = Rack::MockRequest.new(cache).get("/", "HTTP_COOKIE" => cookie)
      res.body.should.equal '{"counter"=>2}'
      res = Rack::MockRequest.new(cache).get("/", "HTTP_COOKIE" => cookie)
      res.body.should.equal '{"counter"=>3}'
    end

    specify "survives broken cookies" do
      cache = Rack::Session::Memcache.new(incrementor)
      res = Rack::MockRequest.new(cache).
        get("/", "HTTP_COOKIE" => "rack.session=blarghfasel")
      res.body.should.equal '{"counter"=>1}'
    end

    specify "maintains freshness" do
      cache = Rack::Session::Memcache.new(incrementor, :expire_after => 3)
      res = Rack::MockRequest.new(cache).get('/')
      res.body.should.include '"counter"=>1'
      cookie = res["Set-Cookie"]
      res = Rack::MockRequest.new(cache).get('/', "HTTP_COOKIE" => cookie)
      res["Set-Cookie"].should.equal cookie
      res.body.should.include '"counter"=>2'
      puts 'Sleeping to expire session' if $DEBUG
      sleep 4
      res = Rack::MockRequest.new(cache).get('/', "HTTP_COOKIE" => cookie)
      res["Set-Cookie"].should.not.equal cookie
      res.body.should.include '"counter"=>1'
    end

    specify "multithread: should cleanly merge sessions" do
      cache = Rack::Session::Memcache.new(incrementor)
      drop_counter = Rack::Session::Memcache.new(proc do |env|
        env['rack.session'].delete 'counter'
        env['rack.session']['foo'] = 'bar'
        [200, {'Content-Type'=>'text/plain'}, env['rack.session'].inspect]
      end)

      res = Rack::MockRequest.new(cache).get('/')
      res.body.should.equal '{"counter"=>1}'
      cookie = res["Set-Cookie"]
      sess_id = cookie[/#{cache.key}=([^,;]+)/, 1]

      res = Rack::MockRequest.new(cache).get('/', "HTTP_COOKIE" => cookie)
      res.body.should.equal '{"counter"=>2}'

      r = Array.new(rand(7).to_i+2) do |i|
        app = proc do |env|
          env['rack.session'][i]  = Time.now
          sleep 2
          env['rack.session']     = env['rack.session'].dup
          env['rack.session'][i] -= Time.now
          incrementor.call(env)
        end
        Thread.new(cache.context(app)) do |run|
          Rack::MockRequest.new(run).
            get('/', "HTTP_COOKIE" => cookie, 'rack.multithread' => true)
        end
      end

      r.reverse!

      r.map! do |t|
        p t if $DEBUG
        t.join.value
      end

      r.each do |res|
        res['Set-Cookie'].should.equal cookie
        res.body.should.include '"counter"=>3'
      end

      session = cache.pool[sess_id]
      session.size.should.be r.size+1
      session['counter'].should.be 3

      res = Rack::MockRequest.new(drop_counter).get('/', "HTTP_COOKIE" => cookie)
      res.body.should.include '"foo"=>"bar"'

      session = cache.pool[sess_id]
      session.size.should.be r.size+1
      session['counter'].should.be.nil?
      session['foo'].should.equal 'bar'
    end

    # Keep this last.
    specify "shutdown" do
      Process.kill 15, $pid
      Process.wait($pid).should.equal $pid
    end
  end
rescue LoadError
  $stderr.puts "Skipping Rack::Session::Memcache tests (Memcache is required). `gem install memcache-client` and try again."
end
