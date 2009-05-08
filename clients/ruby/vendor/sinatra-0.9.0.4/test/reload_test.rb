require File.dirname(__FILE__) + '/helper'

$reload_count = 0
$reload_app = nil

describe "Reloading" do
  before {
    @app = mock_app(Sinatra::Default)
    $reload_app = @app
  }

  after {
    $reload_app = nil
  }

  it 'is enabled by default when in development and the app_file is set' do
    @app.set :app_file, __FILE__
    @app.set :environment, :development
    assert_same true, @app.reload
    assert_same true, @app.reload?
  end

  it 'is disabled by default when running in non-development environment' do
    @app.set :app_file, __FILE__
    @app.set :environment, :test
    assert !@app.reload
    assert_same false, @app.reload?
  end

  it 'is disabled by default when no app_file is available' do
    @app.set :app_file, nil
    @app.set :environment, :development
    assert !@app.reload
    assert_same false, @app.reload?
  end

  it 'can be turned off explicitly' do
    @app.set :app_file, __FILE__
    @app.set :environment, :development
    assert_same true, @app.reload
    @app.set :reload, false
    assert_same false, @app.reload
    assert_same false, @app.reload?
  end

  it 'reloads the app_file each time a request is made' do
    @app.set :app_file, File.dirname(__FILE__) + '/data/reload_app_file.rb'
    @app.set :reload, true
    @app.get('/') { 'Hello World' }

    get '/'
    assert_equal 200, status
    assert_equal 'Hello from reload file', body
    assert_equal 1, $reload_count

    get '/'
    assert_equal 200, status
    assert_equal 'Hello from reload file', body
    assert_equal 2, $reload_count
  end
end
