#!/usr/bin/env ruby

# Copyright 2006 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Backward Compatible API" do

  it "provides generated driver methods" do
    @selenium.start
		@selenium.open("/selenium-server/tests/html/test_click_page1.html")
		assert(@selenium.get_text("link").index("Click here for next page") != nil, "link 'link' doesn't contain expected text")
		links = @selenium.get_all_links()
		assert(links.length > 3)
		assert_equal("linkToAnchorOnThisPage", links[3])
		@selenium.click("link")
		@selenium.wait_for_page_to_load(5000)
		assert(@selenium.get_location =~ %r"/selenium-server/tests/html/test_click_page2.html")
		@selenium.click("previousPage")
		@selenium.wait_for_page_to_load(5000)
		assert(@selenium.get_location =~ %r"/selenium-server/tests/html/test_click_page1.html")
  end
  
end