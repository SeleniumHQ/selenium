/*
 Licensed to the Software Freedom Conservancy (SFC) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The SFC licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

function show(proxy, section) {
	proxy.find('.tab').each(function(i) {
		var current = $(this).attr('type');
		if (current === section) {
			$(this).addClass('selected');
		} else {
			$(this).removeClass('selected');
		}
	});

	proxy.find(".content_detail").each(function(i) {
		var current = $(this).attr('type');
		if (current === section) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});

}

function showDefaults() {
	$(".proxy").each(function(i) {
		show($(this), 'browsers');
	});
}

$(document).ready(function() {
	$(".tabs li").click(function(event) {
		var currentProxy = $(this).closest('.proxy');
		var type = $(this).attr('type');
		show(currentProxy, type);
	});

	showDefaults();

});
