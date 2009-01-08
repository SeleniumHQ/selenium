%% @author Brian P O'Rourke <brianorourke@gmail.com> [http://brianorourke.org]
%% @doc SeleniumRC: an Erlang Module
%%
%% Example usage:
%%   Base = "http://localhost:4444/",
%%   {ok, Pid} = selenium:get_new_browser_session("localhost", 4444, "*firefox", Base),
%%   selenium:open(Pid, "/selenium-server/tests/html/test_click_page1.html"),
%%   Links = selenium:get_all_links(Pid),
%%   selenium:stop(Pid).
%%
%% See selenium:test_acceptance() for a more complex example.

-module(selenium).
-author("Brian P O'Rourke (brianorourke@gmail.com)").
-behaviour(gen_server).

% Defines an object that runs Selenium commands.
%% 
%% ===Element Locators
%% Element Locators tell Selenium which HTML element a command refers to.
%% The format of a locator is:
%% <em>locatorType</em><b>=</b><em>argument</em>
%% We support the following strategies for locating elements:
%% 
%% *    <b>identifier</b>=<em>id</em>: 
%% Select the element with the specified @id attribute. If no match is
%% found, select the first element whose @name attribute is <em>id</em>.
%% (This is normally the default; see below.)
%% *    <b>id</b>=<em>id</em>:
%% Select the element with the specified @id attribute.
%% *    <b>name</b>=<em>name</em>:
%% Select the first element with the specified @name attribute.
%% *    username
%% *    name=username
%% 
%% The name may optionally be followed by one or more <em>element-filters</em>, separated from the name by whitespace.  If the <em>filterType</em> is not specified, <b>value</b> is assumed.
%% *    name=flavour value=chocolate
%% 
%% 
%% *    <b>dom</b>=<em>javascriptExpression</em>: 
%% 
%% Find an element by evaluating the specified string.  This allows you to traverse the HTML Document Object
%% Model using JavaScript.  Note that you must not return a value in this string; simply make it the last expression in the block.
%% *    dom=document.forms['myForm'].myDropdown
%% *    dom=document.images[56]
%% *    dom=function foo() { return document.links[1]; }; foo();
%% 
%% 
%% *    <b>xpath</b>=<em>xpathExpression</em>: 
%% Locate an element using an XPath expression.
%% *    xpath=//img[@alt='The image alt text']
%% *    xpath=//table[@id='table1']//tr[4]/td[2]
%% *    xpath=//a[contains(@href,'#id1')]
%% *    xpath=//a[contains(@href,'#id1')]/@class
%% *    xpath=(//table[@class='stylee'])//th[text()='theHeaderText']/../td
%% *    xpath=//input[@name='name2' and @value='yes']
%% *    xpath=//*[text()="right"]
%% 
%% 
%% *    <b>link</b>=<em>textPattern</em>:
%% Select the link (anchor) element which contains text matching the
%% specified <em>pattern</em>.
%% *    link=The link text
%% 
%% 
%% *    <b>css</b>=<em>cssSelectorSyntax</em>:
%% Select the element using css selectors. Please refer to CSS2 selectors, CSS3 selectors for more information. You can also check the TestCssLocators test in the selenium test suite for an example of usage, which is included in the downloaded selenium core package.
%% *    css=a[href="#id3"]
%% *    css=span#firstChild + span
%% 
%% Currently the css selector locator supports all css1, css2 and css3 selectors except namespace in css3, some pseudo classes(:nth-of-type, :nth-last-of-type, :first-of-type, :last-of-type, :only-of-type, :visited, :hover, :active, :focus, :indeterminate) and pseudo elements(::first-line, ::first-letter, ::selection, ::before, ::after). 
%% 
%% 
%% 
%% Without an explicit locator prefix, Selenium uses the following default
%% strategies:
%% 
%% *    <b>dom</b>, for locators starting with "document."
%% *    <b>xpath</b>, for locators starting with "//"
%% *    <b>identifier</b>, otherwise
%% 
%% ===Element FiltersElement filters can be used with a locator to refine a list of candidate elements.  They are currently used only in the 'name' element-locator.
%% Filters look much like locators, ie.
%% <em>filterType</em><b>=</b><em>argument</em>Supported element-filters are:
%% <b>value=</b><em>valuePattern</em>
%% 
%% Matches elements based on their values.  This is particularly useful for refining a list of similarly-named toggle-buttons.<b>index=</b><em>index</em>
%% 
%% Selects a single element based on its position in the list (offset from zero).===String-match Patterns
%% Various Pattern syntaxes are available for matching string values:
%% 
%% *    <b>glob:</b><em>pattern</em>:
%% Match a string against a "glob" (aka "wildmat") pattern. "Glob" is a
%% kind of limited regular-expression syntax typically used in command-line
%% shells. In a glob pattern, "*" represents any sequence of characters, and "?"
%% represents any single character. Glob patterns match against the entire
%% string.
%% *    <b>regexp:</b><em>regexp</em>:
%% Match a string using a regular-expression. The full power of JavaScript
%% regular-expressions is available.
%% *    <b>regexpi:</b><em>regexpi</em>:
%% Match a string using a case-insensitive regular-expression.
%% *    <b>exact:</b><em>string</em>:
%% 
%% Match a string exactly, verbatim, without any of that fancy wildcard
%% stuff.
%% 
%% 
%% If no pattern prefix is specified, Selenium assumes that it's a "glob"
%% pattern.
%% 
%% 
-export([get_new_browser_session/4,
         stop/1,
         open/2,
         click/2,
         get_all_links/1,
         get_text/2,
         wait_for_page_to_load/2,
         get_location/1,
         is_prompt_present/1,
         get_xpath_count/2,
double_click/2,
context_menu/2,
click_at/3,
double_click_at/3,
context_menu_at/3,
fire_event/3,
focus/2,
key_press/3,
shift_key_down/1,
shift_key_up/1,
meta_key_down/1,
meta_key_up/1,
alt_key_down/1,
alt_key_up/1,
control_key_down/1,
control_key_up/1,
key_down/3,
key_up/3,
mouse_over/2,
mouse_out/2,
mouse_down/2,
mouse_down_at/3,
mouse_up/2,
mouse_up_at/3,
mouse_move/2,
mouse_move_at/3,
type/3,
type_keys/3,
set_speed/2,
get_speed/1,
check/2,
uncheck/2,
select/3,
add_selection/3,
remove_selection/3,
remove_all_selections/2,
submit/2,
open_window/3,
select_window/2,
select_frame/2,
get_whether_this_frame_match_frame_expression/3,
get_whether_this_window_match_window_expression/3,
wait_for_pop_up/3,
choose_cancel_on_next_confirmation/1,
choose_ok_on_next_confirmation/1,
answer_on_next_prompt/2,
go_back/1,
refresh/1,
close/1,
is_alert_present/1,
is_confirmation_present/1,
get_alert/1,
get_confirmation/1,
get_prompt/1,
get_title/1,
get_body_text/1,
get_value/2,
highlight/2,
get_eval/2,
is_checked/2,
get_table/2,
get_selected_labels/2,
get_selected_label/2,
get_selected_values/2,
get_selected_value/2,
get_selected_indexes/2,
get_selected_index/2,
get_selected_ids/2,
get_selected_id/2,
is_something_selected/2,
get_select_options/2,
get_attribute/2,
is_text_present/2,
is_element_present/2,
is_visible/2,
is_editable/2,
get_all_buttons/1,
get_all_fields/1,
get_attribute_from_all_windows/2,
dragdrop/3,
set_mouse_speed/2,
get_mouse_speed/1,
drag_and_drop/3,
drag_and_drop_to_object/3,
window_focus/1,
window_maximize/1,
get_all_window_ids/1,
get_all_window_names/1,
get_all_window_titles/1,
get_html_source/1,
set_cursor_position/3,
get_element_index/2,
is_ordered/3,
get_element_position_left/2,
get_element_position_top/2,
get_element_width/2,
get_element_height/2,
get_cursor_position/2,
get_expression/2,
assign_id/3,
allow_native_xpath/2,
ignore_attributes_without_value/2,
wait_for_condition/3,
set_timeout/2,
wait_for_frame_to_load/3,
get_cookie/1,
get_cookie_by_name/2,
is_cookie_present/2,
create_cookie/3,
delete_cookie/3,
delete_all_visible_cookies/1,
set_browser_log_level/2,
run_script/2,
add_location_strategy/3,
set_context/2,
attach_file/3,
capture_screenshot/2,
shut_down_selenium_server/1,
key_down_native/2,
key_up_native/2,
key_press_native/2
         ]).

-export([init/1,terminate/2,handle_call/3,handle_cast/2,code_change/3,handle_info/2]).
-export([test/0]).
-define(COMMAND_PATH, "/selenium-server/driver/").
-define(NEW_SESSION, "getNewBrowserSession").
-define(SERVER, selenium).

-record(session,
  {server,
  port,
  id
  }).

-record(cmd,
  {type,
  string,
  params = []
  }).

%%%%%%%%%%%%%
%% PUBLIC API
%%%%%%%%%%%%%

%% @spec get_new_browser_session(string(), integer(), string(),
%string()) -> Result
%%       Result = {ok,Pid} | ignore | {error,Error},
%%       Pid = pid(),
%%       Error = {already_started,Pid} | term()
get_new_browser_session(Server, Port, StartCmd, Url) ->
  gen_server:start_link({local,?SERVER}, ?MODULE, {Server, Port,
StartCmd, Url}, []).
    
%% @spec stop(pid()) -> ok
stop(Pid) ->
gen_server:call(Pid, stop).


%% Clicks on a link, button, checkbox or radio button. If the click action
%% causes a new page to load (like a link usually does), call
%% waitForPageToLoad.
%%
% 'locator is an element locator
click(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="click", params=[Locator]}).


%% Double clicks on a link, button, checkbox or radio button. If the double click action
%% causes a new page to load (like a link usually does), call
%% waitForPageToLoad.
%%
% 'locator is an element locator
double_click(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="doubleClick", params=[Locator]}).


%% Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
%%
% 'locator is an element locator
context_menu(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="contextMenu", params=[Locator]}).


%% Clicks on a link, button, checkbox or radio button. If the click action
%% causes a new page to load (like a link usually does), call
%% waitForPageToLoad.
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
click_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="clickAt", params=[Locator,CoordString]}).


%% Doubleclicks on a link, button, checkbox or radio button. If the action
%% causes a new page to load (like a link usually does), call
%% waitForPageToLoad.
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
double_click_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="doubleClickAt", params=[Locator,CoordString]}).


%% Simulates opening the context menu for the specified element (as might happen if the user "right-clicked" on the element).
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
context_menu_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="contextMenuAt", params=[Locator,CoordString]}).


%% Explicitly simulate an event, to trigger the corresponding "on<em>event</em>"
%% handler.
%%
% 'locator is an element locator
% 'eventName is the event name, e.g. "focus" or "blur"
fire_event(Pid,Locator,EventName) ->
            gen_server:call(Pid, #cmd{type=exec, string="fireEvent", params=[Locator,EventName]}).


%% Move the focus to the specified element; for example, if the element is an input field, move the cursor to that field.
%%
% 'locator is an element locator
focus(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="focus", params=[Locator]}).


%% Simulates a user pressing and releasing a key.
%%
% 'locator is an element locator
% 'keySequence is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
key_press(Pid,Locator,KeySequence) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyPress", params=[Locator,KeySequence]}).


%% Press the shift key and hold it down until doShiftUp() is called or a new page is loaded.
%%
shift_key_down(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="shiftKeyDown", params=[]}).


%% Release the shift key.
%%
shift_key_up(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="shiftKeyUp", params=[]}).


%% Press the meta key and hold it down until doMetaUp() is called or a new page is loaded.
%%
meta_key_down(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="metaKeyDown", params=[]}).


%% Release the meta key.
%%
meta_key_up(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="metaKeyUp", params=[]}).


%% Press the alt key and hold it down until doAltUp() is called or a new page is loaded.
%%
alt_key_down(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="altKeyDown", params=[]}).


%% Release the alt key.
%%
alt_key_up(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="altKeyUp", params=[]}).


%% Press the control key and hold it down until doControlUp() is called or a new page is loaded.
%%
control_key_down(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="controlKeyDown", params=[]}).


%% Release the control key.
%%
control_key_up(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="controlKeyUp", params=[]}).


%% Simulates a user pressing a key (without releasing it yet).
%%
% 'locator is an element locator
% 'keySequence is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
key_down(Pid,Locator,KeySequence) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyDown", params=[Locator,KeySequence]}).


%% Simulates a user releasing a key.
%%
% 'locator is an element locator
% 'keySequence is Either be a string("\" followed by the numeric keycode  of the key to be pressed, normally the ASCII value of that key), or a single  character. For example: "w", "\119".
key_up(Pid,Locator,KeySequence) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyUp", params=[Locator,KeySequence]}).


%% Simulates a user hovering a mouse over the specified element.
%%
% 'locator is an element locator
mouse_over(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseOver", params=[Locator]}).


%% Simulates a user moving the mouse pointer away from the specified element.
%%
% 'locator is an element locator
mouse_out(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseOut", params=[Locator]}).


%% Simulates a user pressing the mouse button (without releasing it yet) on
%% the specified element.
%%
% 'locator is an element locator
mouse_down(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseDown", params=[Locator]}).


%% Simulates a user pressing the mouse button (without releasing it yet) at
%% the specified location.
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
mouse_down_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseDownAt", params=[Locator,CoordString]}).


%% Simulates the event that occurs when the user releases the mouse button (i.e., stops
%% holding the button down) on the specified element.
%%
% 'locator is an element locator
mouse_up(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseUp", params=[Locator]}).


%% Simulates the event that occurs when the user releases the mouse button (i.e., stops
%% holding the button down) at the specified location.
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
mouse_up_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseUpAt", params=[Locator,CoordString]}).


%% Simulates a user pressing the mouse button (without releasing it yet) on
%% the specified element.
%%
% 'locator is an element locator
mouse_move(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseMove", params=[Locator]}).


%% Simulates a user pressing the mouse button (without releasing it yet) on
%% the specified element.
%%
% 'locator is an element locator
% 'coordString is specifies the x,y position (i.e. - 10,20) of the mouse      event relative to the element returned by the locator.
mouse_move_at(Pid,Locator,CoordString) ->
            gen_server:call(Pid, #cmd{type=exec, string="mouseMoveAt", params=[Locator,CoordString]}).


%% Sets the value of an input field, as though you typed it in.
%% 
%% Can also be used to set the value of combo boxes, check boxes, etc. In these cases,
%% value should be the value of the option selected, not the visible text.
%% 
%%
% 'locator is an element locator
% 'value is the value to type
type(Pid,Locator,Value) ->
            gen_server:call(Pid, #cmd{type=exec, string="type", params=[Locator,Value]}).


%% Simulates keystroke events on the specified element, as though you typed the value key-by-key.
%% 
%% This is a convenience method for calling keyDown, keyUp, keyPress for every character in the specified string;
%% this is useful for dynamic UI widgets (like auto-completing combo boxes) that require explicit key events.
%% Unlike the simple "type" command, which forces the specified value into the page directly, this command
%% may or may not have any visible effect, even in cases where typing keys would normally have a visible effect.
%% For example, if you use "typeKeys" on a form element, you may or may not see the results of what you typed in
%% the field.
%% In some cases, you may need to use the simple "type" command to set the value of the field and then the "typeKeys" command to
%% send the keystroke events corresponding to what you just typed.
%% 
%%
% 'locator is an element locator
% 'value is the value to type
type_keys(Pid,Locator,Value) ->
            gen_server:call(Pid, #cmd{type=exec, string="typeKeys", params=[Locator,Value]}).


%% Set execution speed (i.e., set the millisecond length of a delay which will follow each selenium operation).  By default, there is no such delay, i.e.,
%% the delay is 0 milliseconds.
%%
% 'value is the number of milliseconds to pause after operation
set_speed(Pid,Value) ->
            gen_server:call(Pid, #cmd{type=exec, string="setSpeed", params=[Value]}).


%% Get execution speed (i.e., get the millisecond length of the delay following each selenium operation).  By default, there is no such delay, i.e.,
%% the delay is 0 milliseconds.
%% 
%% See also setSpeed.
%%
get_speed(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="getSpeed", params=[]}).


%% Check a toggle-button (checkbox/radio)
%%
% 'locator is an element locator
check(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="check", params=[Locator]}).


%% Uncheck a toggle-button (checkbox/radio)
%%
% 'locator is an element locator
uncheck(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="uncheck", params=[Locator]}).


%% Select an option from a drop-down using an option locator.
%% 
%% 
%% Option locators provide different ways of specifying options of an HTML
%% Select element (e.g. for selecting a specific option, or for asserting
%% that the selected option satisfies a specification). There are several
%% forms of Select Option Locator.
%% 
%% *    <b>label</b>=<em>labelPattern</em>:
%% matches options based on their labels, i.e. the visible text. (This
%% is the default.)
%% *    label=regexp:^[Oo]ther
%% 
%% 
%% *    <b>value</b>=<em>valuePattern</em>:
%% matches options based on their values.
%% *    value=other
%% 
%% 
%% *    <b>id</b>=<em>id</em>:
%% 
%% matches options based on their ids.
%% *    id=option1
%% 
%% 
%% *    <b>index</b>=<em>index</em>:
%% matches an option based on its index (offset from zero).
%% *    index=2
%% 
%% 
%% 
%% 
%% If no option locator prefix is provided, the default behaviour is to match on <b>label</b>.
%% 
%% 
%%
% 'selectLocator is an element locator identifying a drop-down menu
% 'optionLocator is an option locator (a label by default)
select(Pid,SelectLocator,OptionLocator) ->
            gen_server:call(Pid, #cmd{type=exec, string="select", params=[SelectLocator,OptionLocator]}).


%% Add a selection to the set of selected options in a multi-select element using an option locator.
%% 
%% @see #doSelect for details of option locators
%%
% 'locator is an element locator identifying a multi-select box
% 'optionLocator is an option locator (a label by default)
add_selection(Pid,Locator,OptionLocator) ->
            gen_server:call(Pid, #cmd{type=exec, string="addSelection", params=[Locator,OptionLocator]}).


%% Remove a selection from the set of selected options in a multi-select element using an option locator.
%% 
%% @see #doSelect for details of option locators
%%
% 'locator is an element locator identifying a multi-select box
% 'optionLocator is an option locator (a label by default)
remove_selection(Pid,Locator,OptionLocator) ->
            gen_server:call(Pid, #cmd{type=exec, string="removeSelection", params=[Locator,OptionLocator]}).


%% Unselects all of the selected options in a multi-select element.
%%
% 'locator is an element locator identifying a multi-select box
remove_all_selections(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="removeAllSelections", params=[Locator]}).


%% Submit the specified form. This is particularly useful for forms without
%% submit buttons, e.g. single-input "Search" forms.
%%
% 'formLocator is an element locator for the form you want to submit
submit(Pid,FormLocator) ->
            gen_server:call(Pid, #cmd{type=exec, string="submit", params=[FormLocator]}).


%% Opens an URL in the test frame. This accepts both relative and absolute
%% URLs.
%% 
%% The "open" command waits for the page to load before proceeding,
%% ie. the "AndWait" suffix is implicit.
%% 
%% <em>Note</em>: The URL must be on the same domain as the runner HTML
%% due to security restrictions in the browser (Same Origin Policy). If you
%% need to open an URL on another domain, use the Selenium Server to start a
%% new browser session on that domain.
%%
% 'url is the URL to open; may be relative or absolute
open(Pid,Url) ->
            gen_server:call(Pid, #cmd{type=exec, string="open", params=[Url]}).


%% Opens a popup window (if a window with that ID isn't already open).
%% After opening the window, you'll need to select it using the selectWindow
%% command.
%% 
%% This command can also be a useful workaround for bug SEL-339.  In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
%% In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
%% an empty (blank) url, like this: openWindow("", "myFunnyWindow").
%% 
%%
% 'url is the URL to open, which can be blank
% 'windowID is the JavaScript window ID of the window to select
open_window(Pid,Url,WindowID) ->
            gen_server:call(Pid, #cmd{type=exec, string="openWindow", params=[Url,WindowID]}).


%% Selects a popup window; once a popup window has been selected, all
%% commands go to that window. To select the main window again, use null
%% as the target.
%% 
%% Note that there is a big difference between a window's internal JavaScript "name" property
%% and the "title" of a given window's document (which is normally what you actually see, as an end user,
%% in the title bar of the window).  The "name" is normally invisible to the end-user; it's the second 
%% parameter "windowName" passed to the JavaScript method window.open(url, windowName, windowFeatures, replaceFlag)
%% (which selenium intercepts).
%% Selenium has several strategies for finding the window object referred to by the "windowID" parameter.
%% 1.) if windowID is null, (or the string "null") then it is assumed the user is referring to the original window instantiated by the browser).
%% 2.) if the value of the "windowID" parameter is a JavaScript variable name in the current application window, then it is assumed
%% that this variable contains the return value from a call to the JavaScript window.open() method.
%% 3.) Otherwise, selenium looks in a hash it maintains that maps string names to window "names".
%% 4.) If <em>that</em> fails, we'll try looping over all of the known windows to try to find the appropriate "title".
%% Since "title" is not necessarily unique, this may have unexpected behavior.
%% If you're having trouble figuring out what is the name of a window that you want to manipulate, look at the selenium log messages
%% which identify the names of windows created via window.open (and therefore intercepted by selenium).  You will see messages
%% like the following for each window as it is opened:
%% <tt>debug: window.open call intercepted; window ID (which you can use with selectWindow()) is "myNewWindow"</tt>
%% In some cases, Selenium will be unable to intercept a call to window.open (if the call occurs during or before the "onLoad" event, for example).
%% (This is bug SEL-339.)  In those cases, you can force Selenium to notice the open window's name by using the Selenium openWindow command, using
%% an empty (blank) url, like this: openWindow("", "myFunnyWindow").
%% 
%%
% 'windowID is the JavaScript window ID of the window to select
select_window(Pid,WindowID) ->
            gen_server:call(Pid, #cmd{type=exec, string="selectWindow", params=[WindowID]}).


%% Selects a frame within the current window.  (You may invoke this command
%% multiple times to select nested frames.)  To select the parent frame, use
%% "relative=parent" as a locator; to select the top frame, use "relative=top".
%% You can also select a frame by its 0-based index number; select the first frame with
%% "index=0", or the third frame with "index=2".
%% 
%% You may also use a DOM expression to identify the frame you want directly,
%% like this: <tt>dom=frames["main"].frames["subframe"]</tt>
%% 
%%
% 'locator is an element locator identifying a frame or iframe
select_frame(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="selectFrame", params=[Locator]}).


%% Determine whether current/locator identify the frame containing this running code.
%% 
%% This is useful in proxy injection mode, where this code runs in every
%% browser frame and window, and sometimes the selenium server needs to identify
%% the "current" frame.  In this case, when the test calls selectFrame, this
%% routine is called for each frame to figure out which one has been selected.
%% The selected frame will return true, while all others will return false.
%% 
%%
% 'currentFrameString is starting frame
% 'target is new frame (which might be relative to the current one)
get_whether_this_frame_match_frame_expression(Pid,CurrentFrameString,Target) ->
            gen_server:call(Pid, #cmd{type=boolean, string="getWhetherThisFrameMatchFrameExpression", params=[CurrentFrameString,Target]}).


%% Determine whether currentWindowString plus target identify the window containing this running code.
%% 
%% This is useful in proxy injection mode, where this code runs in every
%% browser frame and window, and sometimes the selenium server needs to identify
%% the "current" window.  In this case, when the test calls selectWindow, this
%% routine is called for each window to figure out which one has been selected.
%% The selected window will return true, while all others will return false.
%% 
%%
% 'currentWindowString is starting window
% 'target is new window (which might be relative to the current one, e.g., "_parent")
get_whether_this_window_match_window_expression(Pid,CurrentWindowString,Target) ->
            gen_server:call(Pid, #cmd{type=boolean, string="getWhetherThisWindowMatchWindowExpression", params=[CurrentWindowString,Target]}).


%% Waits for a popup window to appear and load up.
%%
% 'windowID is the JavaScript window ID of the window that will appear
% 'timeout is a timeout in milliseconds, after which the action will return with an error
wait_for_pop_up(Pid,WindowID,Timeout) ->
            gen_server:call(Pid, #cmd{type=exec, string="waitForPopUp", params=[WindowID,Timeout]}).


%% By default, Selenium's overridden window.confirm() function will
%% return true, as if the user had manually clicked OK; after running
%% this command, the next call to confirm() will return false, as if
%% the user had clicked Cancel.  Selenium will then resume using the
%% default behavior for future confirmations, automatically returning 
%% true (OK) unless/until you explicitly call this command for each
%% confirmation.
%%
choose_cancel_on_next_confirmation(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="chooseCancelOnNextConfirmation", params=[]}).


%% Undo the effect of calling chooseCancelOnNextConfirmation.  Note
%% that Selenium's overridden window.confirm() function will normally automatically
%% return true, as if the user had manually clicked OK, so you shouldn't
%% need to use this command unless for some reason you need to change
%% your mind prior to the next confirmation.  After any confirmation, Selenium will resume using the
%% default behavior for future confirmations, automatically returning 
%% true (OK) unless/until you explicitly call chooseCancelOnNextConfirmation for each
%% confirmation.
%%
choose_ok_on_next_confirmation(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="chooseOkOnNextConfirmation", params=[]}).


%% Instructs Selenium to return the specified answer string in response to
%% the next JavaScript prompt [window.prompt()].
%%
% 'answer is the answer to give in response to the prompt pop-up
answer_on_next_prompt(Pid,Answer) ->
            gen_server:call(Pid, #cmd{type=exec, string="answerOnNextPrompt", params=[Answer]}).


%% Simulates the user clicking the "back" button on their browser.
%%
go_back(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="goBack", params=[]}).


%% Simulates the user clicking the "Refresh" button on their browser.
%%
refresh(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="refresh", params=[]}).


%% Simulates the user clicking the "close" button in the titlebar of a popup
%% window or tab.
%%
close(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="close", params=[]}).


%% Has an alert occurred?
%% 
%% 
%% This function never throws an exception
%% 
%% 
%%
is_alert_present(Pid) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isAlertPresent", params=[]}).


%% Has a prompt occurred?
%% 
%% 
%% This function never throws an exception
%% 
%% 
%%
is_prompt_present(Pid) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isPromptPresent", params=[]}).


%% Has confirm() been called?
%% 
%% 
%% This function never throws an exception
%% 
%% 
%%
is_confirmation_present(Pid) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isConfirmationPresent", params=[]}).


%% Retrieves the message of a JavaScript alert generated during the previous action, or fail if there were no alerts.
%% 
%% Getting an alert has the same effect as manually clicking OK. If an
%% alert is generated but you do not get/verify it, the next Selenium action
%% will fail.
%% NOTE: under Selenium, JavaScript alerts will NOT pop up a visible alert
%% dialog.
%% NOTE: Selenium does NOT support JavaScript alerts that are generated in a
%% page's onload() event handler. In this case a visible dialog WILL be
%% generated and Selenium will hang until someone manually clicks OK.
%% 
%%
get_alert(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getAlert", params=[]}).


%% Retrieves the message of a JavaScript confirmation dialog generated during
%% the previous action.
%% 
%% 
%% By default, the confirm function will return true, having the same effect
%% as manually clicking OK. This can be changed by prior execution of the
%% chooseCancelOnNextConfirmation command. If an confirmation is generated
%% but you do not get/verify it, the next Selenium action will fail.
%% 
%% 
%% NOTE: under Selenium, JavaScript confirmations will NOT pop up a visible
%% dialog.
%% 
%% 
%% NOTE: Selenium does NOT support JavaScript confirmations that are
%% generated in a page's onload() event handler. In this case a visible
%% dialog WILL be generated and Selenium will hang until you manually click
%% OK.
%% 
%% 
%%
get_confirmation(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getConfirmation", params=[]}).


%% Retrieves the message of a JavaScript question prompt dialog generated during
%% the previous action.
%% 
%% Successful handling of the prompt requires prior execution of the
%% answerOnNextPrompt command. If a prompt is generated but you
%% do not get/verify it, the next Selenium action will fail.
%% NOTE: under Selenium, JavaScript prompts will NOT pop up a visible
%% dialog.
%% NOTE: Selenium does NOT support JavaScript prompts that are generated in a
%% page's onload() event handler. In this case a visible dialog WILL be
%% generated and Selenium will hang until someone manually clicks OK.
%% 
%%
get_prompt(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getPrompt", params=[]}).


%% Gets the absolute URL of the current page.
%%
get_location(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getLocation", params=[]}).


%% Gets the title of the current page.
%%
get_title(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getTitle", params=[]}).


%% Gets the entire text of the page.
%%
get_body_text(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getBodyText", params=[]}).


%% Gets the (whitespace-trimmed) value of an input field (or anything else with a value parameter).
%% For checkbox/radio elements, the value will be "on" or "off" depending on
%% whether the element is checked or not.
%%
% 'locator is an element locator
get_value(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=string, string="getValue", params=[Locator]}).


%% Gets the text of an element. This works for any element that contains
%% text. This command uses either the textContent (Mozilla-like browsers) or
%% the innerText (IE-like browsers) of the element, which is the rendered
%% text shown to the user.
%%
% 'locator is an element locator
get_text(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=string, string="getText", params=[Locator]}).


%% Briefly changes the backgroundColor of the specified element yellow.  Useful for debugging.
%%
% 'locator is an element locator
highlight(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=exec, string="highlight", params=[Locator]}).


%% Gets the result of evaluating the specified JavaScript snippet.  The snippet may
%% have multiple lines, but only the result of the last line will be returned.
%% 
%% Note that, by default, the snippet will run in the context of the "selenium"
%% object itself, so <tt>this</tt> will refer to the Selenium object.  Use <tt>window</tt> to
%% refer to the window of your application, e.g. <tt>window.document.getElementById('foo')</tt>
%% If you need to use
%% a locator to refer to a single element in your application page, you can
%% use <tt>this.browserbot.findElement("id=foo")</tt> where "id=foo" is your locator.
%% 
%%
% 'script is the JavaScript snippet to run
get_eval(Pid,Script) ->
            gen_server:call(Pid, #cmd{type=string, string="getEval", params=[Script]}).


%% Gets whether a toggle-button (checkbox/radio) is checked.  Fails if the specified element doesn't exist or isn't a toggle-button.
%%
% 'locator is an element locator pointing to a checkbox or radio button
is_checked(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isChecked", params=[Locator]}).


%% Gets the text from a cell of a table. The cellAddress syntax
%% tableLocator.row.column, where row and column start at 0.
%%
% 'tableCellAddress is a cell address, e.g. "foo.1.4"
get_table(Pid,TableCellAddress) ->
            gen_server:call(Pid, #cmd{type=string, string="getTable", params=[TableCellAddress]}).


%% Gets all option labels (visible text) for selected options in the specified select or multi-select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_labels(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getSelectedLabels", params=[SelectLocator]}).


%% Gets option label (visible text) for selected option in the specified select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_label(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string, string="getSelectedLabel", params=[SelectLocator]}).


%% Gets all option values (value attributes) for selected options in the specified select or multi-select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_values(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getSelectedValues", params=[SelectLocator]}).


%% Gets option value (value attribute) for selected option in the specified select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_value(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string, string="getSelectedValue", params=[SelectLocator]}).


%% Gets all option indexes (option number, starting at 0) for selected options in the specified select or multi-select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_indexes(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getSelectedIndexes", params=[SelectLocator]}).


%% Gets option index (option number, starting at 0) for selected option in the specified select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_index(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string, string="getSelectedIndex", params=[SelectLocator]}).


%% Gets all option element IDs for selected options in the specified select or multi-select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_ids(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getSelectedIds", params=[SelectLocator]}).


%% Gets option element ID for selected option in the specified select element.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_selected_id(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string, string="getSelectedId", params=[SelectLocator]}).


%% Determines whether some option in a drop-down menu is selected.
%%
% 'selectLocator is an element locator identifying a drop-down menu
is_something_selected(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isSomethingSelected", params=[SelectLocator]}).


%% Gets all option labels in the specified select drop-down.
%%
% 'selectLocator is an element locator identifying a drop-down menu
get_select_options(Pid,SelectLocator) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getSelectOptions", params=[SelectLocator]}).


%% Gets the value of an element attribute.
%%
% 'attributeLocator is an element locator followed by an @ sign and then the name of the attribute, e.g. "foo@bar"
get_attribute(Pid,AttributeLocator) ->
            gen_server:call(Pid, #cmd{type=string, string="getAttribute", params=[AttributeLocator]}).


%% Verifies that the specified text pattern appears somewhere on the rendered page shown to the user.
%%
% 'pattern is a pattern to match with the text of the page
is_text_present(Pid,Pattern) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isTextPresent", params=[Pattern]}).


%% Verifies that the specified element is somewhere on the page.
%%
% 'locator is an element locator
is_element_present(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isElementPresent", params=[Locator]}).


%% Determines if the specified element is visible. An
%% element can be rendered invisible by setting the CSS "visibility"
%% property to "hidden", or the "display" property to "none", either for the
%% element itself or one if its ancestors.  This method will fail if
%% the element is not present.
%%
% 'locator is an element locator
is_visible(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isVisible", params=[Locator]}).


%% Determines whether the specified input element is editable, ie hasn't been disabled.
%% This method will fail if the specified element isn't an input element.
%%
% 'locator is an element locator
is_editable(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isEditable", params=[Locator]}).


%% Returns the IDs of all buttons on the page.
%% 
%% If a given button has no ID, it will appear as "" in this array.
%% 
%%
get_all_buttons(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllButtons", params=[]}).


%% Returns the IDs of all links on the page.
%% 
%% If a given link has no ID, it will appear as "" in this array.
%% 
%%
get_all_links(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllLinks", params=[]}).


%% Returns the IDs of all input fields on the page.
%% 
%% If a given field has no ID, it will appear as "" in this array.
%% 
%%
get_all_fields(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllFields", params=[]}).


%% Returns every instance of some attribute from all known windows.
%%
% 'attributeName is name of an attribute on the windows
get_attribute_from_all_windows(Pid,AttributeName) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAttributeFromAllWindows", params=[AttributeName]}).


%% deprecated - use dragAndDrop instead
%%
% 'locator is an element locator
% 'movementsString is offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
dragdrop(Pid,Locator,MovementsString) ->
            gen_server:call(Pid, #cmd{type=exec, string="dragdrop", params=[Locator,MovementsString]}).


%% Configure the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
%% Setting this value to 0 means that we'll send a "mousemove" event to every single pixel
%% in between the start location and the end location; that can be very slow, and may
%% cause some browsers to force the JavaScript to timeout.
%% If the mouse speed is greater than the distance between the two dragged objects, we'll
%% just send one "mousemove" at the start location and then one final one at the end location.
%% 
%%
% 'pixels is the number of pixels between "mousemove" events
set_mouse_speed(Pid,Pixels) ->
            gen_server:call(Pid, #cmd{type=exec, string="setMouseSpeed", params=[Pixels]}).


%% Returns the number of pixels between "mousemove" events during dragAndDrop commands (default=10).
%%
get_mouse_speed(Pid) ->
            gen_server:call(Pid, #cmd{type=num, string="getMouseSpeed", params=[]}).


%% Drags an element a certain distance and then drops it
%%
% 'locator is an element locator
% 'movementsString is offset in pixels from the current location to which the element should be moved, e.g., "+70,-300"
drag_and_drop(Pid,Locator,MovementsString) ->
            gen_server:call(Pid, #cmd{type=exec, string="dragAndDrop", params=[Locator,MovementsString]}).


%% Drags an element and drops it on another element
%%
% 'locatorOfObjectToBeDragged is an element to be dragged
% 'locatorOfDragDestinationObject is an element whose location (i.e., whose center-most pixel) will be the point where locatorOfObjectToBeDragged  is dropped
drag_and_drop_to_object(Pid,LocatorOfObjectToBeDragged,LocatorOfDragDestinationObject) ->
            gen_server:call(Pid, #cmd{type=exec, string="dragAndDropToObject", params=[LocatorOfObjectToBeDragged,LocatorOfDragDestinationObject]}).


%% Gives focus to the currently selected window
%%
window_focus(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="windowFocus", params=[]}).


%% Resize currently selected window to take up the entire screen
%%
window_maximize(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="windowMaximize", params=[]}).


%% Returns the IDs of all windows that the browser knows about.
%%
get_all_window_ids(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllWindowIds", params=[]}).


%% Returns the names of all windows that the browser knows about.
%%
get_all_window_names(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllWindowNames", params=[]}).


%% Returns the titles of all windows that the browser knows about.
%%
get_all_window_titles(Pid) ->
            gen_server:call(Pid, #cmd{type=string_array, string="getAllWindowTitles", params=[]}).


%% Returns the entire HTML source between the opening and
%% closing "html" tags.
%%
get_html_source(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getHtmlSource", params=[]}).


%% Moves the text cursor to the specified position in the given input element or textarea.
%% This method will fail if the specified element isn't an input element or textarea.
%%
% 'locator is an element locator pointing to an input element or textarea
% 'position is the numerical position of the cursor in the field; position should be 0 to move the position to the beginning of the field.  You can also set the cursor to -1 to move it to the end of the field.
set_cursor_position(Pid,Locator,Position) ->
            gen_server:call(Pid, #cmd{type=exec, string="setCursorPosition", params=[Locator,Position]}).


%% Get the relative index of an element to its parent (starting from 0). The comment node and empty text node
%% will be ignored.
%%
% 'locator is an element locator pointing to an element
get_element_index(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getElementIndex", params=[Locator]}).


%% Check if these two elements have same parent and are ordered siblings in the DOM. Two same elements will
%% not be considered ordered.
%%
% 'locator1 is an element locator pointing to the first element
% 'locator2 is an element locator pointing to the second element
is_ordered(Pid,Locator1,Locator2) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isOrdered", params=[Locator1,Locator2]}).


%% Retrieves the horizontal position of an element
%%
% 'locator is an element locator pointing to an element OR an element itself
get_element_position_left(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getElementPositionLeft", params=[Locator]}).


%% Retrieves the vertical position of an element
%%
% 'locator is an element locator pointing to an element OR an element itself
get_element_position_top(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getElementPositionTop", params=[Locator]}).


%% Retrieves the width of an element
%%
% 'locator is an element locator pointing to an element
get_element_width(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getElementWidth", params=[Locator]}).


%% Retrieves the height of an element
%%
% 'locator is an element locator pointing to an element
get_element_height(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getElementHeight", params=[Locator]}).


%% Retrieves the text cursor position in the given input element or textarea; beware, this may not work perfectly on all browsers.
%% 
%% Specifically, if the cursor/selection has been cleared by JavaScript, this command will tend to
%% return the position of the last location of the cursor, even though the cursor is now gone from the page.  This is filed as SEL-243.
%% 
%% This method will fail if the specified element isn't an input element or textarea, or there is no cursor in the element.
%%
% 'locator is an element locator pointing to an input element or textarea
get_cursor_position(Pid,Locator) ->
            gen_server:call(Pid, #cmd{type=num, string="getCursorPosition", params=[Locator]}).


%% Returns the specified expression.
%% 
%% This is useful because of JavaScript preprocessing.
%% It is used to generate commands like assertExpression and waitForExpression.
%% 
%%
% 'expression is the value to return
get_expression(Pid,Expression) ->
            gen_server:call(Pid, #cmd{type=string, string="getExpression", params=[Expression]}).


%% Returns the number of nodes that match the specified xpath, eg. "//table" would give
%% the number of tables.
%%
% 'xpath is the xpath expression to evaluate. do NOT wrap this expression in a 'count()' function; we will do that for you.
get_xpath_count(Pid,Xpath) ->
            gen_server:call(Pid, #cmd{type=num, string="getXpathCount", params=[Xpath]}).


%% Temporarily sets the "id" attribute of the specified element, so you can locate it in the future
%% using its ID rather than a slow/complicated XPath.  This ID will disappear once the page is
%% reloaded.
%%
% 'locator is an element locator pointing to an element
% 'identifier is a string to be used as the ID of the specified element
assign_id(Pid,Locator,Identifier) ->
            gen_server:call(Pid, #cmd{type=exec, string="assignId", params=[Locator,Identifier]}).


%% Specifies whether Selenium should use the native in-browser implementation
%% of XPath (if any native version is available); if you pass "false" to
%% this function, we will always use our pure-JavaScript xpath library.
%% Using the pure-JS xpath library can improve the consistency of xpath
%% element locators between different browser vendors, but the pure-JS
%% version is much slower than the native implementations.
%%
% 'allow is boolean, true means we'll prefer to use native XPath; false means we'll only use JS XPath
allow_native_xpath(Pid,Allow) ->
            gen_server:call(Pid, #cmd{type=exec, string="allowNativeXpath", params=[Allow]}).


%% Specifies whether Selenium will ignore xpath attributes that have no
%% value, i.e. are the empty string, when using the non-native xpath
%% evaluation engine. You'd want to do this for performance reasons in IE.
%% However, this could break certain xpaths, for example an xpath that looks
%% for an attribute whose value is NOT the empty string.
%% 
%% The hope is that such xpaths are relatively rare, but the user should
%% have the option of using them. Note that this only influences xpath
%% evaluation when using the ajaxslt engine (i.e. not "javascript-xpath").
%%
% 'ignore is boolean, true means we'll ignore attributes without value                        at the expense of xpath "correctness"; false means                        we'll sacrifice speed for correctness.
ignore_attributes_without_value(Pid,Ignore) ->
            gen_server:call(Pid, #cmd{type=exec, string="ignoreAttributesWithoutValue", params=[Ignore]}).


%% Runs the specified JavaScript snippet repeatedly until it evaluates to "true".
%% The snippet may have multiple lines, but only the result of the last line
%% will be considered.
%% 
%% Note that, by default, the snippet will be run in the runner's test window, not in the window
%% of your application.  To get the window of your application, you can use
%% the JavaScript snippet <tt>selenium.browserbot.getCurrentWindow()</tt>, and then
%% run your JavaScript in there
%% 
%%
% 'script is the JavaScript snippet to run
% 'timeout is a timeout in milliseconds, after which this command will return with an error
wait_for_condition(Pid,Script,Timeout) ->
            gen_server:call(Pid, #cmd{type=exec, string="waitForCondition", params=[Script,Timeout]}).


%% Specifies the amount of time that Selenium will wait for actions to complete.
%% 
%% Actions that require waiting include "open" and the "waitFor*" actions.
%% 
%% The default timeout is 30 seconds.
%%
% 'timeout is a timeout in milliseconds, after which the action will return with an error
set_timeout(Pid,Timeout) ->
            gen_server:call(Pid, #cmd{type=exec, string="setTimeout", params=[Timeout]}).


%% Waits for a new page to load.
%% 
%% You can use this command instead of the "AndWait" suffixes, "clickAndWait", "selectAndWait", "typeAndWait" etc.
%% (which are only available in the JS API).
%% Selenium constantly keeps track of new pages loading, and sets a "newPageLoaded"
%% flag when it first notices a page load.  Running any other Selenium command after
%% turns the flag to false.  Hence, if you want to wait for a page to load, you must
%% wait immediately after a Selenium command that caused a page-load.
%% 
%%
% 'timeout is a timeout in milliseconds, after which this command will return with an error
wait_for_page_to_load(Pid,Timeout) ->
            gen_server:call(Pid, #cmd{type=exec, string="waitForPageToLoad", params=[Timeout]}).


%% Waits for a new frame to load.
%% 
%% Selenium constantly keeps track of new pages and frames loading, 
%% and sets a "newPageLoaded" flag when it first notices a page load.
%% 
%% 
%% See waitForPageToLoad for more information.
%%
% 'frameAddress is FrameAddress from the server side
% 'timeout is a timeout in milliseconds, after which this command will return with an error
wait_for_frame_to_load(Pid,FrameAddress,Timeout) ->
            gen_server:call(Pid, #cmd{type=exec, string="waitForFrameToLoad", params=[FrameAddress,Timeout]}).


%% Return all cookies of the current page under test.
%%
get_cookie(Pid) ->
            gen_server:call(Pid, #cmd{type=string, string="getCookie", params=[]}).


%% Returns the value of the cookie with the specified name, or throws an error if the cookie is not present.
%%
% 'name is the name of the cookie
get_cookie_by_name(Pid,Name) ->
            gen_server:call(Pid, #cmd{type=string, string="getCookieByName", params=[Name]}).


%% Returns true if a cookie with the specified name is present, or false otherwise.
%%
% 'name is the name of the cookie
is_cookie_present(Pid,Name) ->
            gen_server:call(Pid, #cmd{type=boolean, string="isCookiePresent", params=[Name]}).


%% Create a new cookie whose path and domain are same with those of current page
%% under test, unless you specified a path for this cookie explicitly.
%%
% 'nameValuePair is name and value of the cookie in a format "name=value"
% 'optionsString is options for the cookie. Currently supported options include 'path', 'max_age' and 'domain'.      the optionsString's format is "path=/path/, max_age=60, domain=.foo.com". The order of options are irrelevant, the unit      of the value of 'max_age' is second.  Note that specifying a domain that isn't a subset of the current domain will      usually fail.
create_cookie(Pid,NameValuePair,OptionsString) ->
            gen_server:call(Pid, #cmd{type=exec, string="createCookie", params=[NameValuePair,OptionsString]}).


%% Delete a named cookie with specified path and domain.  Be careful; to delete a cookie, you
%% need to delete it using the exact same path and domain that were used to create the cookie.
%% If the path is wrong, or the domain is wrong, the cookie simply won't be deleted.  Also
%% note that specifying a domain that isn't a subset of the current domain will usually fail.
%% 
%% Since there's no way to discover at runtime the original path and domain of a given cookie,
%% we've added an option called 'recurse' to try all sub-domains of the current domain with
%% all paths that are a subset of the current path.  Beware; this option can be slow.  In
%% big-O notation, it operates in O(n*m) time, where n is the number of dots in the domain
%% name and m is the number of slashes in the path.
%%
% 'name is the name of the cookie to be deleted
% 'optionsString is options for the cookie. Currently supported options include 'path', 'domain'      and 'recurse.' The optionsString's format is "path=/path/, domain=.foo.com, recurse=true".      The order of options are irrelevant. Note that specifying a domain that isn't a subset of      the current domain will usually fail.
delete_cookie(Pid,Name,OptionsString) ->
            gen_server:call(Pid, #cmd{type=exec, string="deleteCookie", params=[Name,OptionsString]}).


%% Calls deleteCookie with recurse=true on all cookies visible to the current page.
%% As noted on the documentation for deleteCookie, recurse=true can be much slower
%% than simply deleting the cookies using a known domain/path.
%%
delete_all_visible_cookies(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="deleteAllVisibleCookies", params=[]}).


%% Sets the threshold for browser-side logging messages; log messages beneath this threshold will be discarded.
%% Valid logLevel strings are: "debug", "info", "warn", "error" or "off".
%% To see the browser logs, you need to
%% either show the log window in GUI mode, or enable browser-side logging in Selenium RC.
%%
% 'logLevel is one of the following: "debug", "info", "warn", "error" or "off"
set_browser_log_level(Pid,LogLevel) ->
            gen_server:call(Pid, #cmd{type=exec, string="setBrowserLogLevel", params=[LogLevel]}).


%% Creates a new "script" tag in the body of the current test window, and 
%% adds the specified text into the body of the command.  Scripts run in
%% this way can often be debugged more easily than scripts executed using
%% Selenium's "getEval" command.  Beware that JS exceptions thrown in these script
%% tags aren't managed by Selenium, so you should probably wrap your script
%% in try/catch blocks if there is any chance that the script will throw
%% an exception.
%%
% 'script is the JavaScript snippet to run
run_script(Pid,Script) ->
            gen_server:call(Pid, #cmd{type=exec, string="runScript", params=[Script]}).


%% Defines a new function for Selenium to locate elements on the page.
%% For example,
%% if you define the strategy "foo", and someone runs click("foo=blah"), we'll
%% run your function, passing you the string "blah", and click on the element 
%% that your function
%% returns, or throw an "Element not found" error if your function returns null.
%% 
%% We'll pass three arguments to your function:
%% *    locator: the string the user passed in
%% *    inWindow: the currently selected window
%% *    inDocument: the currently selected document
%% 
%% 
%% The function must return null if the element can't be found.
%%
% 'strategyName is the name of the strategy to define; this should use only   letters [a-zA-Z] with no spaces or other punctuation.
% 'functionDefinition is a string defining the body of a function in JavaScript.   For example: <tt>return inDocument.getElementById(locator);</tt>
add_location_strategy(Pid,StrategyName,FunctionDefinition) ->
            gen_server:call(Pid, #cmd{type=exec, string="addLocationStrategy", params=[StrategyName,FunctionDefinition]}).


%% Writes a message to the status bar and adds a note to the browser-side
%% log.
%%
% 'context is the message to be sent to the browser
set_context(Pid,Context) ->
            gen_server:call(Pid, #cmd{type=exec, string="setContext", params=[Context]}).


%% Sets a file input (upload) field to the file listed in fileLocator
%%
% 'fieldLocator is an element locator
% 'fileLocator is a URL pointing to the specified file. Before the file  can be set in the input field (fieldLocator), Selenium RC may need to transfer the file    to the local machine before attaching the file in a web page form. This is common in selenium  grid configurations where the RC server driving the browser is not the same  machine that started the test.   Supported Browsers: Firefox ("*chrome") only.
attach_file(Pid,FieldLocator,FileLocator) ->
            gen_server:call(Pid, #cmd{type=exec, string="attachFile", params=[FieldLocator,FileLocator]}).


%% Captures a PNG screenshot to the specified file.
%%
% 'filename is the absolute path to the file to be written, e.g. "c:\blah\screenshot.png"
capture_screenshot(Pid,Filename) ->
            gen_server:call(Pid, #cmd{type=exec, string="captureScreenshot", params=[Filename]}).


%% Kills the running Selenium Server and all browser sessions.  After you run this command, you will no longer be able to send
%% commands to the server; you can't remotely start the server once it has been stopped.  Normally
%% you should prefer to run the "stop" command, which terminates the current browser session, rather than 
%% shutting down the entire server.
%%
shut_down_selenium_server(Pid) ->
            gen_server:call(Pid, #cmd{type=exec, string="shutDownSeleniumServer", params=[]}).


%% Simulates a user pressing a key (without releasing it yet) by sending a native operating system keystroke.
%% This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
%% a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
%% metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
%% element, focus on the element first before running this command.
%%
% 'keycode is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
key_down_native(Pid,Keycode) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyDownNative", params=[Keycode]}).


%% Simulates a user releasing a key by sending a native operating system keystroke.
%% This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
%% a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
%% metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
%% element, focus on the element first before running this command.
%%
% 'keycode is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
key_up_native(Pid,Keycode) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyUpNative", params=[Keycode]}).


%% Simulates a user pressing and releasing a key by sending a native operating system keystroke.
%% This function uses the java.awt.Robot class to send a keystroke; this more accurately simulates typing
%% a key on the keyboard.  It does not honor settings from the shiftKeyDown, controlKeyDown, altKeyDown and
%% metaKeyDown commands, and does not target any particular HTML element.  To send a keystroke to a particular
%% element, focus on the element first before running this command.
%%
% 'keycode is an integer keycode number corresponding to a java.awt.event.KeyEvent; note that Java keycodes are NOT the same thing as JavaScript keycodes!
key_press_native(Pid,Keycode) ->
            gen_server:call(Pid, #cmd{type=exec, string="keyPressNative", params=[Keycode]}).


%%%%%%%%%%%%%%%%%%%%
%% PRIVATE FUNCTIONS
%%%%%%%%%%%%%%%%%%%%

%% @spec ordinal_args([Value]) -> [{integer(), Value}]
%% @doc Turns each list item into a tuple of {Index, Item}
%%      Start index is 1
ordinal_args(Args) -> 
  {Results, _} = lists:foldl( fun (Item, {Acc, X}) ->
                                        {[{X,Item} | Acc], X+1}
                              end, {[],1}, Args),
  lists:reverse(Results).

%% @spec get_command([{Key,Value}]) -> string()
%% @doc composes a complete Selenium request string from a set of query parameters
get_command(Args) ->
  ?COMMAND_PATH ++ "?" ++ mochiweb_util:urlencode(Args).

%% @spec selenium_call(Session, string(), string()) -> RawSeleniumBody | SeleniumError
selenium_call(Session, Verb, Args) ->
  ArgsWithSession = [{"sessionId", Session#session.id} | ordinal_args(Args)],
  Command = get_command([{"cmd", Verb} | ArgsWithSession]),
  selenium_call(Session, Command).

%% @spec selenium_call(Session, string()) -> RawSeleniumBody | SeleniumError
%%       Session = { Server, Port, SessionId }
%%       RawSeleniumBody = string()
%%       SeleniumError = {selenium_error, RawSeleniumBody}
selenium_call(S, Command) ->
  Url = lists:concat(["http://", S#session.server, ":", S#session.port, Command]),
  {ok, {_, _, Body}} = http:request(Url),
  % this is what HTTP response codes are for. but looks like we're
  % reproducing the functionality for some reason...
  {Code,_Response} = lists:split(2, Body),
  case Code of
    "OK"   -> {ok, Body};
    _Else  -> {selenium_error, Body}
  end.

%% @spec strip_prefix(string()) -> string()
%% @doc strips the "OK," from the front of a response.
strip_prefix(Body) ->
  {_Code,Response} = lists:split(3, Body),
  Response.

%% @spec parse_string_array(string()) -> [string()]
%% @doc simple CSV parse of a Selenium response body
parse_string_array(Body) ->
  String = strip_prefix(Body),
  parse_array(String,[],[]).
parse_array([H|T], Current, Results) ->
  case H of
    $,  -> NewString = lists:reverse(Current),
           parse_array(T, [], [NewString|Results]);
    $\\ -> [H2|T2] = T,
           parse_array(T2, [H2|Current], Results);
    _   -> parse_array(T, [H|Current], Results)
  end;
parse_array([],Current,Result) ->
  lists:reverse([lists:reverse(Current)|Result]).

parse_boolean(Body) ->
  list_to_atom( strip_prefix( Body ) ).
parse_boolean_array(Body) ->
  lists:map( lists_to_atom, parse_string_array( Body ) ).
parse_num(Body) ->
  list_to_integer( strip_prefix( Body ) ).
parse_num_array(Body) ->
  lists:map( list_to_integer, parse_string_array(Body) ).

%%%%%%%%%%%%%%%%%%%%%
%% GEN_SERVER SUPPORT
%%%%%%%%%%%%%%%%%%%%%
init({Server, Port, StartCmd, Url}) -> 
  inets:start(),
  Command = get_command([{"cmd", ?NEW_SESSION} | ordinal_args([StartCmd, Url])]),
  {ok, Response} = selenium_call( #session{server = Server, port = Port}, Command ),
  SessionId = strip_prefix(Response),
  {ok, #session{server=Server, port=Port, id=SessionId}}.

handle_call(#cmd{} = Cmd, _, Session) ->
  case selenium_call(Session, Cmd#cmd.string, Cmd#cmd.params) of
    {ok, Response} -> parse_cmd_response(Cmd#cmd.type, Response, Session);
    {selenium_error, Response} -> {reply, {selenium_error, Response}, Session}
  end;
handle_call(stop, _, Session) ->
  selenium_call(Session, "testComplete", []),
  {stop, normal, ok, Session}.

% @spec parse_cmd_response(Type, Response, Session) -> Reply
%       Type = exec | string | string_array | boolean | boolean_array
%              | num | num_array
%       Response = string()
%       Reply = {reply, ReturnVal, Session}
%       Response = term()
% @doc Parses a Selenium response according to its specified return
%      type.
parse_cmd_response(Type, Response, Session) ->
  case Type of
    exec          -> {reply, ok, Session};
    string        -> {reply, strip_prefix(Response), Session};
    string_array  -> {reply, parse_string_array(Response), Session};
    boolean       -> {reply, parse_boolean(Response), Session};
    boolean_array -> {reply, parse_boolean_array(Response), Session};
    num           -> {reply, parse_num(Response), Session};
    num_array     -> {reply, parse_num_array(Response), Session}
  end.

handle_cast(_Request, State) -> {noreply, State}.
terminate(_Reason, _Session) -> ok.
code_change(_OldVsn, Session, _Extra) -> {ok, Session}.
handle_info(_Info, Session) -> {noreply, Session}.

%%%%%%%%%%%%%%%
%% TESTS
%%%%%%%%%%%%%%%
test() ->
  test_args(),
  test_command(),
  test_strip_prefix(),
  test_parse_string_array(),
  test_acceptance(),
  ok.

test_args() ->
  List = ordinal_args(["foo","bar","baz"]),
  [{1,"foo"}|Rest1] = List,
  [{2,"bar"}|Rest2] = Rest1,
  [{3,"baz"}|_] = Rest2.

test_command() ->
  Results = get_command([{"cmd","foo \r\n"},{"param","bar"}]),
  "/selenium-server/driver/?cmd=foo+%0D%0A&param=bar" = Results,
  ok.

test_strip_prefix() ->
  "foo" = strip_prefix("OK,foo"),
  "_REQ" = strip_prefix("BAD_REQ"),
  ok.

test_parse_string_array() ->
  TestString = "OK,veni\\, vidi\\, vici,c:\\\\foo\\\\bar,c:\\\\I came\\, I \\\\saw\\\\\\, I conquered",
  Expected = ["veni, vidi, vici", "c:\\foo\\bar", "c:\\I came, I \\saw\\, I conquered"],
  Expected = parse_string_array(TestString),
  ok.

test_acceptance() ->
  Base = "http://localhost:4444/",
  {ok, Pid} = get_new_browser_session("localhost", 4444, "*firefox", Base),
  open(Pid, "/selenium-server/tests/html/test_click_page1.html"),
  "Click here for next page" = get_text(Pid, "link"),
  Links = get_all_links(Pid),
  6 = length(Links),
  "linkToAnchorOnThisPage" = lists:nth(4, Links),
  click(Pid, "link"),
  wait_for_page_to_load(Pid, 5000),
  "http://localhost:4444/selenium-server/tests/html/test_click_page2.html" = get_location(Pid), 
  click(Pid, "previousPage"),
  wait_for_page_to_load(Pid, 5000),
  "http://localhost:4444/selenium-server/tests/html/test_click_page1.html" = get_location(Pid),
  false = is_prompt_present(Pid),
  0 = get_xpath_count(Pid, "//sandwich"),
  stop(Pid),
  ok.
