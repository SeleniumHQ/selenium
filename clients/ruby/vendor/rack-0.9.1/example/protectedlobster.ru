require 'rack/lobster'

use Rack::ShowExceptions
use Rack::Auth::Basic do |username, password|
  'secret' == password
end

run Rack::Lobster.new
