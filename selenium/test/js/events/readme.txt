This directory contains tests for browser event emulation when driven by the
Selenium javascript engine. There are subtle differences in the eventing
for different browsers, which Selenium attempts to emulate when driving
the app with Javascript.

Current Implementation:
-----------------------
Currently, only the focus, select, click, change and blur events are supported for elements of
types INPUT-TEXT, INPUT-RADIO, INPUT-CHECKBOX, INPUT-BUTTON and SELECT.

The focus event is not supported for the "window" object.

Other HTML events, together with all keyboard and mouse events are not currently emulated.

Key Browser differences:
----------------
1) Firefox PR1 has a bug which allows "focus" and "blur" events to bubble when
the target element is a CHECKBOX, RADIO, BUTTON or SELECT.
(see http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-eventgroupings-htmlevents)
*** SeleniumA does _not_ currently emulate this behaviour.

2) Internet explorer has a bug whereby "select" and "change" events do not bubble up from
target elements to enclosing elements.
*** SeleniumA does currently emulate this behaviour.

3) The window.onfocus event is not supported.
