#!/usr/bin/env ruby

require "rubygems"
require 'sinatra'

get "/" do
  "Selenium Ruby Client Sample Application"
end

post "/compute" do
  sleep 5 # Sleep  a little while to test wait_for_ajax semantics
  eval(params[:'calculator-expression']).to_s
end

get "/shutdown" do
  Process.kill('KILL', Process.pid)
end
