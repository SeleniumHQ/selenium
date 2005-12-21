require 'uri'

class SeleneseController < ApplicationController
  EXCLUDED = ['driverhost', 'driverport', 'action', 'controller']

  def driver  
    host = params[:driverhost]
    port = params[:driverport]
    
    if host.nil? or port.nil?
    	raise "Selenium: driverhost and/or driverport not specified!"
    end

    pure_params = params.keys.reject{ |key| EXCLUDED.include? key }
    safe_pairs = pure_params.map {|key| URI.escape("#{key}=#{params[key]}") }
    query_string = safe_pairs.join('&')

    result = nil          
    Net::HTTP.start(host, port) do |http|
      result = http.get("/selenium-driver/driver?#{query_string}").body
    end

    response.headers["Cache-control"] = "no-cache"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "-1"
    
    render :text => result
  end
  
end
