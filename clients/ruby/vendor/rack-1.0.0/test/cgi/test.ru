#!/usr/bin/env ../../bin/rackup
#\ -E deployment -I ../../lib
# -*- ruby -*-

require '../testrequest'

run TestRequest.new
