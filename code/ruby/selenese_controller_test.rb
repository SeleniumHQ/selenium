require File.dirname(__FILE__) + '/../test_helper'
require 'selenese_controller'
require 'webrick'
require 'thread'

# Re-raise errors caught by the controller.
class SeleniumController; def rescue_action(e) raise e end; end

class SeleneseControllerTest < Test::Unit::TestCase
  def setup
    @controller = SeleneseController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_non_default_port
  	port = 8765
  
  	# simulate the selenium driver opening up
	selenium = WEBrick::HTTPServer.new(
		:ServerType => Thread,
        	:Port => port)

	command = nil
	selenium.mount_proc("/selenium-driver/driver") do |req, res|
		command = req.query['testCommand']
	end
        selenium.start
  
  	get :driver, :driverhost => 'localhost', :driverport => port, :testCommand => "foo"
  	assert_response :success
  	assert_equal "foo", command
  end
end