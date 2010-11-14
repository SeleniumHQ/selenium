# Copyright 2008-2010 WebDriver committers
# Copyright 2008-2010 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Script for generating the wire protocol wiki documentation.

This script is probably overkill, but it ensures commands are documented with
consistent formatting.

Usage:

  python trunk/wire.py > wiki/JsonWireProtocol.wiki
"""



class Resource(object):
  def __init__(self, path):
    self.path = path
    self.methods = []

  def __getattribute__(self, attr):
    try:
      return super(Resource, self).__getattribute__(attr)
    except AttributeError, e:
      if self.methods:
        return self.methods[len(self.methods) - 1].__getattribute__(attr)
      raise e

  def Post(self, summary):
    return self.AddMethod(Method(self, 'POST', summary))

  def Get(self, summary):
    return self.AddMethod(Method(self, 'GET', summary))

  def Delete(self, summary):
    return self.AddMethod(Method(self, 'DELETE', summary))

  def AddMethod(self, method):
    self.methods.append(method)
    return self

  def ToWikiString(self):
    str = '=== %s ===\n' % self.path
    for method in self.methods:
      str = '%s%s' % (str, method.ToWikiString(self.path))
    return str

  def ToWikiTableString(self):
    return ''.join(m.ToWikiTableString() for m in self.methods)
    
    
class SessionResource(Resource):
  def AddMethod(self, method):
    return (Resource.AddMethod(self, method).
            AddUrlParameter(':sessionId',
                            'ID of the session to route the command to.'))
                            
class ElementResource(SessionResource):
  def AddMethod(self, method):
    return (SessionResource.AddMethod(self, method).
            AddUrlParameter(
                ':id', 'ID of the element to route the command to.'))


class Method(object):
  def __init__(self, parent, method, summary):
    self.parent = parent
    self.method = method
    self.summary = summary
    self.url_parameters = []
    self.json_parameters = []
    self.javadoc_link = None
    self.javadoc_comment = None
    self.return_type = None

  def AddUrlParameter(self, name, description):
    self.url_parameters.append({
        'name': name,
        'desc': description})
    return self.parent

  def AddJsonParameter(self, name, type, description):
    self.json_parameters.append({
        'name': name,
        'type': type,
        'desc': description})
    return self.parent

  def SetJavadoc(self, link, comment):
    if link is None:
      self.javadoc_link = None
    else:
      self.javadoc_link = (
          'http://selenium.googlecode.com/svn/trunk/docs/api/' + link)
    self.javadoc_comment = comment
    return self.parent

  def SetReturnType(self, type, description):
    self.return_type = {
        'type': type,
        'desc': description}
    return self.parent

  def _GetUrlParametersWikiString(self):
    if not self.url_parameters:
      return ''
    return '''
<dd>
<dl>
<dt>*URL Parameters:*</dt>
%s
</dl>
</dd>''' % '\n'.join('<dd>`%s` - %s</dd>' %
                     (param['name'], param['desc'])
                     for param in self.url_parameters)

  def _GetJsonParametersWikiString(self):
    if not self.json_parameters:
      return ''
    return '''
<dd>
<dl>
<dt>*JSON Parameters:*</dt>
%s
</dl>
</dd>''' % '\n'.join('<dd>`%s` - `%s` %s</dd>' %
                     (param['name'], param['type'], param['desc'])
                     for param in self.json_parameters)

  def _GetReturnTypeWikiString(self):
    if not self.return_type:
      return ''
    type = ''
    if self.return_type['type']:
      type = '`%s` ' % self.return_type['type']
    return '''
<dd>
<dl>
<dt>*Returns:*</dt>
<dd>%s%s</dd>
</dl>
</dd>''' % (type, self.return_type['desc'])

  def ToWikiString(self, path):
    javadoc = ''
    if self.javadoc_link:
      javadoc = '''
<dd>
<dl>
<dt>*See Also:*</dt>
<dd>[%s %s]</dd>
</dl>
</dd>''' % (self.javadoc_link, self.javadoc_comment)

    return '''
<dl>
<dd>*%s %s*</dd>
<dd>
<dl>
<dd>%s</dd>%s%s%s%s
</dl>
</dd>
</dl>
''' % (self.method, path, self.summary, self._GetUrlParametersWikiString(),
       self._GetJsonParametersWikiString(),
       self._GetReturnTypeWikiString(), javadoc)

  def ToWikiTableString(self):
    javadoc = '_N/A_'
    if self.javadoc_link:
      javadoc = '[%s %s]' % (self.javadoc_link, self.javadoc_comment)
    return '|| %s || %s || %s || %s ||\n' % (
        self.method, self.parent.path,
        self.summary[:self.summary.find('.') + 1].replace('\n', '').strip(),
        javadoc)



def main():
  resources = []

  resources.append(
      Resource('/session').
      Post('''
Create a new session. The desired capabilities should be specified in a JSON
object with the following properties:

|| *Key* || *Type* || *Description* ||
|| browserName || string || The name of the browser to use; should be one of \
`{iphone|firefox|internet explorer|htmlunit|iphone|chrome}`||
|| version || string || The desired browser version. ||
|| javascriptEnabled || boolean || Whether the session should support \
!JavaScript. ||
|| platform || string || A key specifying the desired platform to launch the \
browser on. Should be one of `{WINDOWS|XP|VISTA|MAC|LINUX|UNIX|ANY}` ||

The server should attempt to create a session that most closely matches the \
desired capabilities.''').
      AddJsonParameter('desiredCapabilities',
                       '{object}',
                       'A JSON object describing the desired capabilities for '
                       'the new session.').
      SetJavadoc(None, 'n/a').
      SetReturnType(None,
                    'A `303 See Other` redirect to `/session/:sessionId`, where'
                    ' `:sessionId` is the ID of the newly created session.'))

  resources.append(
      SessionResource('/session/:sessionId').
      Get('''Retrieve the capabilities of the specified session. The session's \
capabilities
will be returned in a JSON object with the following properties:

|| *Key* || *Type* || *Description* ||
|| browserName || string || The name of the browser to use; should be one of \
`{iphone|firefox|internet explorer|htmlunit|iphone|chrome}`||
|| version || string || The desired browser version. ||
|| javascriptEnabled || boolean || Whether the session should support \
!JavaScript. ||
|| platform || string || A key specifying the desired platform to launch the \
browser on. Should be one of `{WINDOWS|XP|VISTA|MAC|LINUX|UNIX|ANY}` ||
|| nativeEvents || boolean || Whether the browser has native events enabled. ||

''').
      SetJavadoc(None, 'n/a').
      SetReturnType(
          '{object}', 'A JSON object with the session capabilities.').
      Delete('Delete the session.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#quit()',
                 'WebDriver#quit()'))
                 
  resources.append(
      SessionResource('/session/:sessionId/timeouts/implicit_wait').
      Post('''Set the amount of time the driver should wait when searching for \
elements. When
searching for a single element, the driver should poll the page until an \
element is found or
the timeout expires, whichever occurs first. When searching for multiple \
elements, the driver
should poll the page until at least one element is found or the timeout \
expires, at which point
it should return an empty list.
      
If this command is never sent, the driver should default to an implicit wait of\
 0ms.''').
      AddJsonParameter('ms', '{number}',
                       'The amount of time to wait, in milliseconds. This value'
                       ' has a lower bound of 0.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Timeouts.html#'
                 'implicitlyWait(long,%20java.util.concurrent.TimeUnit)',
                 'WebDriver.Timeouts#implicitlyWait(long, TimeUnit)'))

  resources.append(
      SessionResource('/session/:sessionId/window_handle').
      Get('Retrieve the current window handle.').
      SetReturnType('{string}', 'The current window handle.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#getWindowHandle()',
                 'WebDriver#getWindowHandle()'))

  resources.append(
      SessionResource('/session/:sessionId/window_handles').
      Get('Retrieve the list of all window handles available to the session.').
      SetReturnType('{Array.<string>}', 'A list of window handles.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#getWindowHandles()',
                 'WebDriver#getWindowHandles()'))

  resources.append(
      SessionResource('/session/:sessionId/url').
      Get('Retrieve the URL of the current page.').
      SetReturnType('{string}', 'The current URL.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#getCurrentUrl()',
                 'WebDriver#getCurrentUrl()').
      Post('Navigate to a new URL.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#get(java.lang.String)',
                 'WebDriver#get(String)').
      AddJsonParameter('url', '{string}', 'The URL to navigate to.'))

  resources.append(
      SessionResource('/session/:sessionId/forward').
      Post('Navigate forwards in the browser history, if possible.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Navigation.html#forward()',
                 'WebDriver.Navigation#forward()'))

  resources.append(
      SessionResource('/session/:sessionId/back').
      Post('Navigate backwards in the browser history, if possible.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Navigation.html#back()',
                 'WebDriver.Navigation#back()'))

  resources.append(
      SessionResource('/session/:sessionId/refresh').
      Post('Refresh the current page.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Navigation.html#refresh()',
                 'WebDriver.Navigation#refresh()'))

  resources.append(
      SessionResource('/session/:sessionId/execute').
      Post('''
Inject a snippet of !JavaScript into the page and return its result.  \
WebElements that should be
passed to the script as an argument should be specified in the arguments array \
as WebElement JSON
arguments. Likewise, any !WebElements in the script result will be returned to \
the client as
!WebElement JSON objects.''').
      AddJsonParameter('script', '{string}', 'The script to execute.').
      AddJsonParameter('args', '{Array.<*>}', 'The script arguments.').
      SetJavadoc('java/org/openqa/selenium/JavascriptExecutor.html#'
                 'executeScript(java.lang.String,%20java.lang.Object...)',
                 'JavascriptExecutor#executeScript(String, Object...)').
      SetReturnType('{*}', 'The script result.'))

  resources.append(
      SessionResource('/session/:sessionId/screenshot').
      Get('Take a screenshot of the current page.').
      SetJavadoc('java/org/openqa/selenium/TakesScreenshot.html#'
                 'getScreenshotAs(org.openqa.selenium.OutputType)',
                 'TakesScreenshot#getScreenshotAs(OutputType)').
      SetReturnType('{string}', 'The screenshot as a base64 encoded PNG.'))

  resources.append(
      SessionResource('/session/:sessionId/frame').
      Post('''Change focus to another frame on the page. If the frame ID is \
`null`, the server
should switch to the page's default content.''').
      SetJavadoc('java/org/openqa/selenium/WebDriver.TargetLocator.html#frame(java.lang.String)',
                 'WebDriver.TargetLocator#frame(String)').
      AddJsonParameter('id', '{string|number|null}',
                       'Identifier for the frame to change focus to.'))

  resources.append(
      SessionResource('/session/:sessionId/window').
      Post('''Change focus to another window. The window to change focus to \
may be specified by its
server assigned window handle, or by the value of its `name` attribute.''').
      SetJavadoc('java/org/openqa/selenium/WebDriver.TargetLocator.html#window(java.lang.String)',
                 'WebDriver.TargetLocator#window(String)').
      AddJsonParameter('name', '{string}', 'The window to change focus to.').
      Delete('''Close the current window.''').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#close()',
                 'WebDriver#close()'))

  resources.append(
      SessionResource('/session/:sessionId/speed').
      Get('''Get the current user input speed. The server should return one of
`{SLOW|MEDIUM|FAST}`. How these constants map to actual input speed is still \
browser specific and
not covered by the wire protocol.''').
      SetReturnType('{string}', 'The current input speed mapped to one of `{SLOW|MEDIUM|FAST}`.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#getSpeed()',
                 'WebDriver.Options#getSpeed()').
      Post('''Set the user input speed. The speed should be specified as one of
`{SLOW|MEDIUM|FAST}`. How these constants map to actual input speed is still \
browser specific and
not covered by the wire protocol.''').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#setSpeed(org.openqa.selenium.Speed)',
                 'WebDriver.Options#setSpeed(Speed)').
      AddJsonParameter('speed', '{string}',
                       'The new user input speed mapped to one of `{SLOW|MEDIUM|FAST}`.'))

  resources.append(
      SessionResource('/session/:sessionId/cookie').
      Get('''Retrieve all cookies visible to the current page. Each cookie \
will be returned as a
JSON object with the following properties:

|| *Key* || *Type* || *Description* ||
|| name || string || The name of the cookie. ||
|| value || string || The cookie value. ||
|| path || string || (Optional) The cookie path.^1^ ||
|| domain || string || (Optional) The domain the cookie is visible to.^1^ ||
|| secure || boolean || (Optional) Whether the cookie is a secure cookie.^1^ ||
|| expiry || number || (Optional) When the cookie expires, specified in \
seconds since midnight, January 1, 1970 UTC.^1^ ||

^1^ Field should only be omitted if the server is incapable of providing the \
information.
''').
      SetReturnType('{Array.<object>}', 'A list of cookies.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#getCookies()',
                 'WebDriver.Options#getCookies()').
      Post('''Set a cookie.  The cookie should be specified as a JSON object \
with the following
properties:

|| *Key* || *Type* || *Description* ||
|| name || string || The name of the cookie; may not be an empty string. ||
|| value || string || The cookie value; may be an empty string. ||
|| path || string || (Optional) The cookie path; defaults to `"/"`. ||
|| domain || string || (Optional) The domain the cookie is visible to; \
defaults to the domain of the current page. ||
|| secure || boolean || (Optional) Whether the cookie is a secure cookie; \
defaults to false. ||
|| expiry || number || (Optional) When the cookie expires, in seconds since \
midnight, January 1, 1970 UTC; if not provided, the cookie should be set to \
expire when the browser is closed. ||
\n''').
      AddJsonParameter('cookie', '{object}',
                       'A JSON object defining the cookie to add.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#addCookie(org.openqa.selenium.Cookie)',
                 'WebDriver.Options#addCookie(Cookie)').
      Delete('''Delete all cookies visible to the current page.''').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#deleteAllCookies()',
                 'WebDriver.Options#deleteAllCookies()'))

  resources.append(
      SessionResource('/session/:sessionId/cookie/:name').
      Delete('''Delete the cookie with the given name. This command should be \
a no-op if there is no
such cookie visible to the current page.''').
      AddUrlParameter(':name', 'The name of the cookie to delete.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.Options.html#getCookieNamed(java.lang.String)',
                 'WebDriver.Options#deleteCookieNamed(String)'))

  resources.append(
      SessionResource('/session/:sessionId/source').
      Get('Get the current page source.').
      SetReturnType('{string}', 'The current page source.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#getPageSource()',
                 'WebDriver#getPageSource()'))

  resources.append(
      SessionResource('/session/:sessionId/title').
      Get('Get the current page title.').
      SetReturnType('{string}', 'The current page title.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#getTitle()',
                 'WebDriver#getTitle()'))

  resources.append(
      SessionResource('/session/:sessionId/element').
      Post('Search for an element on the page, starting from the document root.'
           ' The located element will be returned as a WebElement JSON '
           'object.').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{ELEMENT:string}',
                    'A WebElement JSON object for the located element.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#findElement(org.openqa.selenium.By)',
                 'WebDriver.#findElement(By)'))

  resources.append(
      SessionResource('/session/:sessionId/elements').
      Post('Search for multiple elements on the page, starting from the document root. The located '
           'elements will be returned as a WebElement JSON objects.').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{Array.<{ELEMENT:string}>}',
                    'A list of WebElement JSON objects for the located elements.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.html#findElements(org.openqa.selenium.By)',
                 'WebDriver.#findElements(By)'))
  
  resources.append(
      SessionResource('/session/:sessionId/element/active').
      Post('Get the element on the page that currently has focus. The element will be returned as '
           'a WebElement JSON object.').
      SetReturnType('{ELEMENT:string}', 'A WebElement JSON object for the active element.').
      SetJavadoc('java/org/openqa/selenium/WebDriver.TargetLocator.html#activeElement()',
                 'WebDriver.TargetLocator#activeElement()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id').
      Get('''Describe the identified element.

*Note:* This command is reserved for future use; its return type is currently \
undefined.''').
      AddUrlParameter(':id', 'ID of the element to describe.'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/element').
      Post('Search for an element on the page, starting from the identified '
           'element. The located '
           'element will be returned as a WebElement JSON object.').
      AddUrlParameter(':id', 'ID of the element to search under.').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{ELEMENT:string}',
                    'A WebElement JSON object for the located element.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#findElement(org.openqa.selenium.By)',
                 'WebElement#findElement(By)'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/elements').
      Post('''Search for multiple elements on the page, starting from the
 identified element. The located elements will be returned as a WebElement
JSON objects.''').
      AddUrlParameter(':id', 'ID of the element to search under.').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{Array.<{ELEMENT:string}>}',
                    'A list of WebElement JSON objects for the located elements.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#findElements(org.openqa.selenium.By)',
                 'WebElement#findElements(By)'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/click').
      Post('Click on an element.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#click()',
                 'WebElement#click()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/submit').
      Post('Submit a `FORM` element. The submit command may also be applied to any element that is '
           'a descendant of a `FORM` element.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#submit()',
                 'WebElement#submit()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/text').
      Get('Get the `innerText` of the element.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#getText()',
                 'WebElement#getText()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/value').
      Get('Query for the value of an element, as determined by its `value` attribute.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{string|null}',
                    'The element\'s value, or `null` if it does not have a `value` attribute.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#getValue()',
                 'WebElement#getValue()').
      Post('Send a sequence of key strokes to an element.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      AddJsonParameter('value', '{Array.<string>}',
                       'The sequence of keys to type. An array must be provided. '
                       'The server should flatten the array items to a single '
                       'string to be typed.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#sendKeys(java.lang.CharSequence...)',
                 'WebElement#sendKeys(CharSequence...)'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/name').
      Get('Query for an element\'s tag name.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{string}', 'The element\'s tag name, as a lowercase string.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#getTagName()',
                 'WebElement#getTagName()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/clear').
      Post('Clear a `TEXTAREA` or `text INPUT` element\'s value.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#clear()',
                 'WebElement#clear()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/selected').
      Get('Determine if an `OPTION` element, or an `INPUT` element of type `checkbox` or '
          '`radiobutton` is currently selected.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{boolean}', 'Whether the element is selected.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#isSelected()',
                 'WebElement#isSelected()').
      Post('Select an `OPTION` element, or an `INPUT` element of type `checkbox` or `radiobutton`.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#setSelected()',
                 'WebElement#setSelected()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/toggle').
      Post('Toggle whether an `OPTION` element, or an `INPUT` element of type `checkbox` or '
           '`radiobutton` is currently selected.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetReturnType('{boolean}', 'Whether the element is selected after toggling its state.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#toggle()',
                 'WebElement#toggle()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/enabled').
      Get('Determine if an element is currently enabled.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{boolean}', 'Whether the element is enabled.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#isEnabled()',
                 'WebElement#isEnabled()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/attribute/:name').
      Get('Get the value of an element\'s attribute.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{string|null}',
                    'The value of the attribute, or null if it is not set on the element.').
      SetJavadoc('java/org/openqa/selenium/WebElement.html#getAttribute(java.lang.String)',
                 'WebElement#getAttribute(String)'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/equals/:other').
      Get('Test if two element IDs refer to the same DOM element.').
      AddUrlParameter(':id', 'First element ID to test in the pair').
      AddUrlParameter(':other', 'Second element ID to test in the pair').
      SetReturnType('{boolean}', 'Whether the two IDs refer to the same element.'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/displayed').
      Get('Determine if an element is currently displayed.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{boolean}', 'Whether the element is displayed.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#isDisplayed()',
                 'RenderedWebElement#isDisplayed()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/location').
      Get('Determine an element\'s location on the page. The point `(0, 0)` refers to the '
          'upper-left corner of the page. The element\'s coordinates are returned as a JSON object '
          'with `x` and `y` properties.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{x:number, y:number}', 'The X and Y coordinates for the element on the page.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#getLocation()',
                 'RenderedWebElement#getLocation()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/location_in_view').
      Get('''Determine an element\'s location on the screen once it has been \
scrolled into view.

*Note:* This is considered an internal command and should *only* be used to \
determine an element's
location for correctly generating native events.''').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{x:number, y:number}', 'The X and Y coordinates for the element.'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/size').
      Get('Determine an element\'s size in pixels. The size will be returned as a JSON object '
          ' with `width` and `height` properties.').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{width:number, height:number}', 'The width and height of the element, in pixels.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#getSize()',
                 'RenderedWebElement#getSize()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/css/:propertyName').
      Get('Query the value of an element\'s computed CSS property. The CSS property to query should'
          ' be specified using the CSS property name, *not* the !JavaScript property name (e.g. '
          '`background-color` instead of `backgroundColor`).').
      AddUrlParameter(':id', 'ID of the element to query.').
      SetReturnType('{string}', 'The value of the specified CSS property.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#getValueOfCssProperty(java.lang.String)',
                 'RenderedWebElement#getValueOfCssProperty(String)'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/hover').
      Post('Move the mouse over an element.').
      AddUrlParameter(':id', 'ID of the element to manipulate.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#hover()',
                 'RenderedWebElement#hover()'))

  resources.append(
      SessionResource('/session/:sessionId/element/:id/drag').
      Post('Drag and drop an element. The distance to drag an element should be specified relative '
           'to the upper-left corner of the page.').
      AddUrlParameter(':id', 'ID of the element to query.').
      AddJsonParameter('x', '{number}',
                       'The number of pixels to drag the element in the horizontal direction. '
                       'A positive value indicates the element should be dragged to the right, '
                       'while a negative value indicates that it should be dragged to the left.').
      AddJsonParameter('y', '{number}',
                       'The number of pixels to drag the element in the vertical direction. '
                       'A positive value indicates the element should be dragged down towards the '
                       'bottom of the screen, while a negative value indicates that it should be '
                       'dragged towards the top of the screen.').
      SetJavadoc('java/org/openqa/selenium/RenderedWebElement.html#dragAndDropBy(int,%20int)',
                 'RenderedWebElement#dragAndDropBy(int, int)'))
                 
  resources.append(
      SessionResource('/session/:sessionId/orientation').
      Get('Get the current browser orientation. The server should return a '
          'valid orientation value as defined in [http://selenium.googlecode.'
          'com/svn/trunk/docs/api/java/org/openqa/selenium/ScreenOrientation'
          '.html ScreenOrientation]: `{LANDSCAPE|PORTRAIT}`.').
      SetReturnType('{string}', 'The current browser orientation corresponding'
                    ' to a value defined in [http://selenium.googlecode.com/'
                    'svn/trunk/docs/api/java/org/openqa/selenium/'
                    'ScreenOrientation.html ScreenOrientation]: '
                    '`{LANDSCAPE|PORTRAIT}`.').
      SetJavadoc('java/org/openqa/selenium/Rotatable.html#getOrientation()',
                 'Rotatable#getOrientation()').
      Post('Set the browser orientation. The orientation should be specified '
           'as defined in [http://selenium.googlecode.com/svn/trunk/docs/api/'
           'java/org/openqa/selenium/ScreenOrientation.html ScreenOrientation]'
           ': `{LANDSCAPE|PORTRAIT}`.').
      AddJsonParameter('orientation', '{string}',
                       'The new browser orientation as defined in '
                       '[http://selenium.googlecode.com/svn/trunk/docs/api/'
                       'java/org/openqa/selenium/ScreenOrientation.html '
                       'ScreenOrientation]: `{LANDSCAPE|PORTRAIT}`.').
      SetJavadoc('java/org/openqa/selenium/Rotatable.html#rotate('
                 'org.openqa.selenium.ScreenOrientation)',
                 'Rotatable#rotate(ScreenOrientation)'))

  # HTML 5 commands -------------------------------------------------------
  #resources.append(
  #    Resource('/session/:sessionId/local_storage/item/:key').
  #    Get('Retrieves the value of an item stored in the `window.localStorage`.'
  #        '  This #command can only retrieve values accessible to the current '
  #        'domain.').
  #    AddUrlParameter(
  #        ':sessionId', 'ID of the session to route the command to.').
  #    AddUrlParameter(
  #        ':key', 'The key of the item in window.localStorage to retrieve.').
  #    SetReturnType('{*}', 'A JSON-compatible value, or null if there is no '
  #                         'value for the given key.'))
  # TODO(jleyba): Add Javadoc on next release.

  #resources.append(
  #    Resource('/session/:sessionId/local_storage/keys').
  #    Get('Retrieves the list of keys in `localStorage` accessible to the current domain.').
  #    AddUrlParameter(':sessionId', 'ID of the session to route the command to.').
  #    SetReturnType('{Array.<string>}', 'The list of keys accessible to the current domain.'))
  # TODO(jleyba): Add Javadoc on next release.

  # POST local_storage/item
  # DELETE local_storage/remove/:key
  # DELETE local_storage/clear
  # GET local_storage/size

  # GET session_storage/keys
  # POST session_storage/item
  # GET session_storage/item/:key
  # DELETE session_storage/item/:key
  # DELETE session_storage/clear
  # GET session_storage/size

  print '''#summary A description of the protocol used by WebDriver to \
communicate with remote instances
#labels WebDriver

<font size=6>*The !WebDriver Wire Protocol*</font>

<font size=3>*Status:* _DRAFT_</font>

<wiki:toc max_depth="3" />

= Introduction =

All implementations of WebDriver that communicate with the browser, or a \
RemoteWebDriver server shall use a common wire protocol. This wire protocol \
defines a [http://www.google.com?q=RESTful+web+service RESTful web service] \
using [http://www.json.org JSON] over HTTP.

The protocol will assume that the WebDriver API has been "flattened", but there\
 is an expectation that client implementations will take a more Object-Oriented\
 approach, as demonstrated in the existing Java API. The wire protocol is\
 implemented in request/response pairs of "commands" and "responses".

== Basic Concepts And Terms ==

<dl>
<dt>*Client*</dt>
<dd>The machine on which the WebDriver API is being used.

</dd>
<dt>*Server*</dt>
<dd>The machine running the RemoteWebDriver. This term may also refer to a \
specific browser that implements the wire protocol directly, such as the \
FirefoxDriver or IPhoneDriver.

</dd>
<dt>*Session*</dt>
<dd>The server should maintain one browser per session. Commands sent to a \
session will be directed to the corresponding browser.

</dd>
<dt>*!WebElement*</dt>
<dd>An object in the WebDriver API that represents a DOM element on the page.

</dd>
<dt>*!WebElement JSON Object*</dt>
<dd>The JSON representation of a WebElement for transmission over the wire. \
This object will have the following properties:

|| *Key* || *Type* || *Description* ||
|| ELEMENT || string || The opaque ID assigned to the element by the server. \
This ID should be used in all subsequent commands issued against the element. ||

</dd>
</dl>

= Messages =

== Commands ==

!WebDriver command messages should conform to the [http://www.w3.org/Protocols/\
rfc2616/rfc2616-sec5.html#sec5 HTTP/1.1 request specification]. Although the \
server may be extended to respond to other content-types, the wire protocol \
dictates that all commands accept a content-type of \
`application/json;charset=UTF-8`. Likewise, the message bodies for POST and PUT\
 request must use an `application/json;charset=UTF-8` content-type.

Each command in the WebDriver service will be mapped to an HTTP method at a \
specific path. Path segments prefixed with a colon (:) indicate that segment \
is a variable used to further identify the underlying resource. For example, \
consider an arbitrary resource mapped as:
{{{
GET /favorite/color/:name
}}}
Given this mapping, the server should respond to GET requests sent to \
"/favorite/color/Jack" and "/favorite/color/Jill", with the variable `:name` \
set to "Jack" and "Jill", respectively.

== Responses ==

Command responses shall be sent as \
[http://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6 HTTP/1.1 response \
messages]. If the remote server must return a 4xx response, the response body \
shall have a Content-Type of text/plain and the message body shall be a \
descriptive message of the bad request. For all other cases, if a response \
includes a message body, it must have a Content-Type of \
application/json;charset=UTF-8 and will be a JSON object with the following \
properties:

|| *Key* || *Type* || *Description* ||
|| sessionId || string|null || An opaque handle used by the server to \
determine where to route session-specific commands. This ID should be included \
in all future session-commands in place of the :sessionId path segment \
variable. ||
|| status || number || A status code summarizing the result of the command. \
A non-zero value indicates that the command failed. ||
|| value || `*` || The response JSON value. ||

=== Response Status Codes ===

The wire protocol will inherit its status codes from those used by the \
InternetExplorerDriver:

|| *Code* || *Summary* || *Detail* ||
|| 0 || Success || The command executed successfully. ||
|| 7 || No such element || An element could not be located on the page using \
the given search parameters. ||
|| 8 || No such frame || A request to switch to a frame could not be \
satisfied because the frame could not be found. ||
|| 9 || Unknown command || The requested resource could not be found, or a \
request was received using an HTTP method that is not supported by the mapped \
resource. ||
|| 10 || Stale element reference || An element command failed because the \
referenced element is no longer attached to the DOM. ||
|| 11 || Element not visible || An element command could not be completed \
because the element is not visible on the page. ||
|| 12 || Invalid element state || An element command could not be completed \
because the element is in an invalid state (e.g. attempting to click a \
disabled element). ||
|| 13 || Unknown error || An unknown server-side error occurred while \
processing the command. ||
|| 15 || Element is not selectable || An attempt was made to select an element \
that cannot be selected. ||
|| 19 || XPath look up error || An error occurred while searching for an \
element by XPath. ||
|| 23 || No such window || A request to switch to a different window could \
not be satisfied because the window could not be found. ||
|| 24 || Invalid cookie domain || An illegal attempt was made to set a cookie \
under a different domain than the current page. ||
|| 25 || Unable to set cookie || A request to set a cookie's value could not \
be satisfied. ||

The client should interpret a 404 Not Found response from the server as an \
"Unknown command" response. All other 4xx and 5xx responses from the server \
that do not define a status field should be interpreted as "Unknown error" \
responses.

== Error Handling ==

There are two levels of error handling specified by the wire protocol: invalid \
requests and failed commands.

=== Invalid Requests ===

All invalid requests should result in the server returning a 4xx HTTP \
response. The response Content-Type should be set to text/plain and the \
message body should be a descriptive error message. The categories of invalid \
requests are as follows:

<dl>
<dt>*Unknown Commands*</dt>
<dd>If the server receives a command request whose path is not mapped to a \
resource in the REST service, it should respond with a `404 Not Found` message.

</dd>
<dt>*Unimplemented Commands*</dt>
<dd>Every server implementing the WebDriver wire protocol must respond to \
every defined command. If an individual command has not been implemented on \
the server, the server should respond with a `501 Not Implemented` error \
message. Note this is the only error in the Invalid Request category that does \
not return a `4xx` status code.

</dd>
<dt>*Variable Resource Not Found*</dt>
<dd>If a request path maps to a variable resource, but that resource does not \
exist, then the server should respond with a `404 Not Found`. For example, if \
ID `my-session` is not a valid session ID on the server, and a command is sent \
to `GET /session/my-session HTTP/1.1`, then the server should gracefully \
return a `404`.

</dd>
<dt>*Invalid Command Method*</dt>
<dd>If a request path maps to a valid resource, but that resource does not \
respond to the request method, the server should respond with a `405 Method \
Not Allowed`. The response must include an Allows header with a list of the \
allowed methods for the requested resource.

</dd>
<dt>*Missing Command Parameters*</dt>
<dd>If a POST/PUT command maps to a resource that expects a set of JSON \
parameters, and the response body does not include one of those parameters, \
the server should respond with a `400 Bad Request`. The response body should \
list the missing parameters.

</dd>
</dl>

=== Failed Commands ===

If a request maps to a valid command and contains all of the expected \
parameters in the request body, yet fails to execute successfully, then the \
server should send a 500 Internal Server Error. This response should have a \
Content-Type of `application/json;charset=UTF-8` and the response body should \
be a well formed JSON response object.

The response status should be one of the defined status codes and the response \
value should be another JSON object with detailed information for the failing \
command:

|| Key || Type || Description ||
|| message || string || A descriptive message for the command failure. ||
|| screen || string || (Optional) If included, a screenshot of the current \
page as a base64 encoded string. ||
|| class || string || (Optional) If included, specifies the fully qualified \
class name for the exception that was thrown when the command failed. ||
|| stackTrace || array || (Optional) If included, specifies an array of JSON \
objects describing the stack trace for the exception that was thrown when the \
command failed. The zeroeth element of the array represents the top of the \
stack. ||

Each JSON object in the stackTrace array must contain the following properties:

|| *Key* || *Type* || *Description* ||
|| fileName || string || The name of the source file containing the line \
represented by this frame. ||
|| className || string || The fully qualified class name for the class active \
in this frame. If the class name cannot be determined, or is not applicable \
for the language the server is implemented in, then this property should be \
set to the empty string. ||
|| methodName || string || The name of the method active in this frame, or \
the empty string if unknown/not applicable. ||
|| lineNumber || number || The line number in the original source file for the \
frame, or 0 if unknown. ||

= Resource Mapping =

Resources in the WebDriver REST service are mapped to individual URL patterns. \
Each resource may respond to one or more HTTP request methods. If a resource \
responds to a GET request, then it should also respond to HEAD requests. All \
resources should respond to OPTIONS requests with an `Allow` header field, \
whose value is a list of all methods that resource responds to.

If a resource is mapped to a URL containing a variable path segment name, that \
path segment should be used to further route the request. Variable path \
segments are indicated in the resource mapping by a colon-prefix. For example, \
consider the following:
{{{
/favorite/color/:person
}}}
A resource mapped to this URL should parse the value of the `:person` path \
segment to further determine how to respond to the request. If this resource \
received a request for `/favorite/color/Jack`, then it should return Jack's \
favorite color. Likewise, the server should return Jill's favorite color for \
any requests to `/favorite/color/Jill`.

Two resources may only be mapped to the same URL pattern if one of those \
resources' patterns contains variable path segments, and the other does not. In\
 these cases, the server should always route requests to the resource whose \
path is the best match for the request. Consider the following two resource \
paths:

  # `/session/:sessionId/element/active`
  # `/session/:sessionId/element/:id`

Given these mappings, the server should always route requests whose final path \
segment is active to the first resource. All other requests should be routed to\
 second.

= Command Reference =

== Command Summary ==

|| *HTTP Method* || *Path* || *Summary* || *Java Equivalent* ||
%s

== Command Detail ==

%s''' % (''.join(r.ToWikiTableString() for r in resources),
         '\n----\n\n'.join(r.ToWikiString() for r in resources))



if __name__ == '__main__':
  main()
