#!/usr/bin/osascript
(*
Copyright 2012 Software Freedom Conservancy. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*)

(*
This script can be used to quickly re-install the SafariDriver extension
during development.

Requirements:
- The extension must be manually installed before use
- This script must be run from the trunk.
*)


-- Keep this in sync with the name of the extension in the Info.plist
set EXTENSION to "WebDriver"

tell application "System Events"
	set ui_elements_enabled to UI elements enabled
end tell

if ui_elements_enabled is false then
	tell application "System Preferences"
		activate
		set current pane to pane id "com.apple.preference.universalaccess"
		display dialog "Please \"Enable access for assistive devices\" " & ¬
			"and try again..."
		error number -128
	end tell
end if

tell application "Safari" to activate

tell application "System Events"
	tell process "Safari"
		tell menu bar 1
			-- tell menu "Develop"
			tell menu bar item 8
				tell menu 1
					-- click menu item "Show Extension Builder"
					click menu item 7
				end tell
			end tell
		end tell
		
		delay 0.2
		
		-- https://discussions.apple.com/thread/2726674?start=0&tstart=0
		-- tell UI element 1 of scroll area 1 of window "Extension Builder"
		tell UI element 1 of scroll area 1 of window 1
			set found_extension to false
			set tc to (count (groups whose its images is not {}))
			repeat with i from 1 to tc
				if exists (static text 1 of group i) then
					set t_name to name of static text 1 of group i
					if t_name is EXTENSION then
						set found_extension to true
						-- click button "Reload" of UI element ("ReloadUninstall" & t_name)
						click button 1 of UI element 4
						exit repeat
					end if
				end if
				keystroke (character id 31)
				delay 0.2
			end repeat
			
			if found_extension is false then
				display dialog "Was unable to locate the extension \"" & EXTENSION ¬
					& "\"" & return & return ¬
					& "It must be manually installed before this script may be used."
				error number -128
			end if
		end tell
	end tell
end tell

tell application "Safari" to quit
