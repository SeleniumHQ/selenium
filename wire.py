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

  python trunk/wire.py --help
"""

import logging
import optparse
import os
import re
import sys


DEFAULT_WIKI_PATH = os.path.join('..', 'wiki', 'JsonWireProtocol.wiki')


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
            AddUrlParameter(':id',
                            'ID of the element to route the command to.').
            AddError('StaleElementReference',
                     'If the element referenced by `:id` is no longer attached '
                     'to the page\'s DOM.'))

  def RequiresVisibility(self):
    return self.AddError('ElementNotVisible',
                         'If the referenced element is not visible on the page '
                         '(either is hidden by CSS, has 0-width, or has 0-height)')

  def RequiresEnabledState(self):
    return self.AddError('InvalidElementState',
                         'If the referenced element is disabled.')


class Method(object):
  def __init__(self, parent, method, summary):
    self.parent = parent
    self.method = method
    self.summary = summary
    self.url_parameters = []
    self.json_parameters = []
    self.return_type = None
    self.errors = {}

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

  def AddError(self, type, summary):
    self.errors[type] = {'type': type, 'summary': summary}
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

  def _GetErrorWikiString(self):
    if not self.errors.values():
      return ''
    return '''
<dd>
<dl>
<dt>*Potential Errors:*</dt>
%s
</dl>
</dd>''' % '\n'.join('<dd>`%s` - %s</dd>' %
                     (error['type'], error['summary'])
                     for error in self.errors.values())

  def ToWikiString(self, path):
    return '''
<dl>
<dd>
==== %s %s ====
</dd>
<dd>
<dl>
<dd>%s</dd>%s%s%s%s
</dl>
</dd>
</dl>
''' % (self.method, path, self.summary,
       self._GetUrlParametersWikiString(),
       self._GetJsonParametersWikiString(),
       self._GetReturnTypeWikiString(),
       self._GetErrorWikiString())

  def ToWikiTableString(self):
    return '|| %s || [#%s_%s %s] || %s ||\n' % (
        self.method, self.method, self.parent.path, self.parent.path,
        self.summary[:self.summary.find('.') + 1].replace('\n', '').strip())


class ErrorCode(object):
  def __init__(self, code, summary, detail):
    self.code = code
    self.summary = summary
    self.detail = detail

  def ToWikiTableString(self):
    return '|| %d || `%s` || %s ||' % (self.code, self.summary, self.detail)


class AbstractErrorCodeGatherer(object):
  def __init__(self, name, path_to_error_codes, regex):
    self.name = name
    self.path_to_error_codes = path_to_error_codes
    self.regex = regex

  def __str__(self):
    return self.name

  def get_error_codes(self):
    error_codes = {}
    error_codes_file = open(self.path_to_error_codes, 'r')
    try:
      for line in error_codes_file:
        match = self.regex.match(line)
        if match is not None:
          name, code = self.extract_from_match(match)
          error_codes[code] = name
    finally:
      error_codes_file.close()
    return error_codes

  def extract_from_match(self, match):
    raise NotImplementedError


class JavaErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes):
    super(JavaErrorCodeGatherer, self).__init__( \
      'Java',
      path_to_error_codes, \
      re.compile('^\s*public static final int ([A-Z_]+) = (\d+);$'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(2))


class JavascriptErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes, name):
    super(JavascriptErrorCodeGatherer, self).__init__( \
      name,
      path_to_error_codes, \
      re.compile('^\s*([A-Z_]+): (\d+)'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(2))


class RubyErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes):
    super(RubyErrorCodeGatherer, self).__init__( \
      'Ruby',
      path_to_error_codes, \
      re.compile('^\s*(([A-Z][a-z]*)+),?\s*# (\d+)$'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(len(match.groups())))


class PythonErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes):
    super(PythonErrorCodeGatherer, self).__init__( \
      'Python',
      path_to_error_codes, \
      re.compile('^\s*([A-Z_]+) = (\d+)$'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(2))


class CErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes):
    super(CErrorCodeGatherer, self).__init__( \
      'C',
      path_to_error_codes, \
      re.compile('^#define ([A-Z]+)\s+(\d+)$'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(2))


class CSharpErrorCodeGatherer(AbstractErrorCodeGatherer):
  def __init__(self, path_to_error_codes):
    super(CSharpErrorCodeGatherer, self).__init__( \
      'C#',
      path_to_error_codes, \
      re.compile('^\s*(([A-Z][a-z]*)+) = (\d+)'))

  def extract_from_match(self, match):
    return match.group(1), int(match.group(len(match.groups())))


class ErrorCodeChecker(object):
  def __init__(self):
    self.gatherers = []
    self.inconsistencies = {}

  def using(self, gatherer):
    self.gatherers.append(gatherer)
    return self

  def check_error_codes_are_consistent(self, json_error_codes):
    logging.info('Checking error codes are consistent across languages and \
browsers')

    num_missing = 0
    for gatherer in self.gatherers:
      if not os.path.exists(gatherer.path_to_error_codes):
        logging.warn('    Unable to locate error codes for %s (//%s)',
                     gatherer, gatherer.path_to_error_codes)
        num_missing += 1
      else:
        self.compare(gatherer, json_error_codes)

    if not num_missing and not self.inconsistencies:
      logging.info('All error codes are consistent')
      return False

    for code,(present,missing) in self.inconsistencies.items():
      logging.error('Error code %d was present in %s but not %s',
                    code, present, missing)
    return True

  def add_inconsistency(self, code, present_in, missing_from):
    if self.inconsistencies.has_key(code):
      already_present, already_missing = self.inconsistencies[code]
      already_present.add(present_in)
      already_missing.add(missing_from)
    else:
      self.inconsistencies[code] = (set([present_in]), set([missing_from]))

  def compare(self, gatherer, raw_json_error_codes):
    logging.info('Checking %s (%s)' % (gatherer, gatherer.path_to_error_codes))
    gathered_error_codes = gatherer.get_error_codes()
    json_error_codes = map(lambda code: code.code, raw_json_error_codes)
    for json_error_code in json_error_codes:
      if not gathered_error_codes.has_key(json_error_code):
        self.add_inconsistency(json_error_code, 'JSON', str(gatherer))
    for gathered_code,_ in gathered_error_codes.items():
      if not gathered_code in json_error_codes:
        self.add_inconsistency(gathered_code, str(gatherer), 'JSON')


def GetDefaultWikiPath():
  dirname = os.path.dirname(__file__)
  if not dirname:
    return DEFAULT_WIKI_PATH
  return os.path.join('.', dirname, DEFAULT_WIKI_PATH)


def ChangeToTrunk():
  dirname = os.path.dirname(__file__)
  if dirname:
    logging.info('Changing to %s', os.path.abspath(dirname))
    os.chdir(dirname)


def main():
  logging.basicConfig(format='[ %(filename)s ] %(message)s',
                      level=logging.INFO)

  default_path = GetDefaultWikiPath()

  parser = optparse.OptionParser('Usage: %prog [options]')
  parser.add_option('-c', '--check_error_codes', dest='check_errors',
                    default=False,
                    help='Whether to abort if error codes are inconsistent.')
  parser.add_option('-w', '--wiki', dest='wiki', metavar='FILE',
                    default=default_path,
                    help='Which file to write to. Defaults to %default')
  (options, args) = parser.parse_args()

  wiki_path = options.wiki
  if wiki_path is not default_path:
    wiki_path = os.path.abspath(wiki_path)

  if not os.path.exists(wiki_path):
    logging.error('Unable to locate wiki file: %s', wiki_path)
    parser.print_help()
    sys.exit(2)

  wiki_path = os.path.abspath(wiki_path)
  ChangeToTrunk()

  error_codes = [
      ErrorCode(0, 'Success', 'The command executed successfully.'),
#      ErrorCode(1, 'IndexOutOfBounds', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
#      ErrorCode(2, 'NoCollection', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
#      ErrorCode(3, 'NoString', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
#      ErrorCode(4, 'NoStringLength', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
#      ErrorCode(5, 'NoStringWrapper', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
#      ErrorCode(6, 'NoSuchDriver', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(7, 'NoSuchElement', 'An element could not be located on the \
page using the given search parameters.'),
      ErrorCode(8, 'NoSuchFrame', 'A request to switch to a frame could not be \
satisfied because the frame could not be found.'),
      ErrorCode(9, 'UnknownCommand', 'The requested resource could not be \
found, or a request was received using an HTTP method that is not supported \
by the mapped resource.'),
      ErrorCode(10, 'StaleElementReference', 'An element command failed \
because the referenced element is no longer attached to the DOM.'),
      ErrorCode(11, 'ElementNotVisible', 'An element command could not \
be completed because the element is not visible on the page.'),
      ErrorCode(12, 'InvalidElementState', 'An element command could not be \
completed because the element is in an invalid state (e.g. attempting to \
click a disabled element).'),
      ErrorCode(13, 'UnknownError', 'An unknown server-side error occurred \
while processing the command.'),
#      ErrorCode(14, 'ExpectedError', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(15, 'ElementIsNotSelectable', 'An attempt was made to select \
an element that cannot be selected.'),
#      ErrorCode(16, 'NoSuchDocument', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(17, 'JavaScriptError', 'An error occurred while executing user \
supplied !JavaScript.'),
#      ErrorCode(18, 'NoScriptResult', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(19, 'XPathLookupError', 'An error occurred while searching for \
an element by XPath.'),
#      ErrorCode(20, 'NoSuchCollection', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(21, 'Timeout', 'An operation did not complete before its \
timeout expired.'),
#      ErrorCode(22, 'NullPointer', 'This is probably an unused \
#implementation detail of an old version of the IEDriver.'),
      ErrorCode(23, 'NoSuchWindow', 'A request to switch to a different window \
could not be satisfied because the window could not be found.'),
      ErrorCode(24, 'InvalidCookieDomain', 'An illegal attempt was made to set \
a cookie under a different domain than the current page.'),
      ErrorCode(25, 'UnableToSetCookie', 'A request to set a cookie\'s value \
could not be satisfied.'),
      ErrorCode(26, 'UnexpectedAlertOpen', 'A modal dialog was open, blocking \
this operation'),
      ErrorCode(27, 'NoAlertOpenError', 'An attempt was made to operate on a \
modal dialog when one was not open.'),
      ErrorCode(28, 'ScriptTimeout', 'A script did not complete before its \
timeout expired.'),
      ErrorCode(29, 'InvalidElementCoordinates', 'The coordinates provided to \
an interactions operation are invalid.'),
      ErrorCode(30, 'IMENotAvailable', 'IME was not available.'),
      ErrorCode(31, 'IMEEngineActivationFailed', 'An IME engine could not be \
started.'),
      ErrorCode(32, 'InvalidSelector', 'Argument was an invalid selector \
(e.g. XPath/CSS).')
  ]

  error_checker = ErrorCodeChecker() \
  .using(JavaErrorCodeGatherer('java/client/src/org/openqa/selenium/remote/ErrorCodes.java')) \
  .using(JavascriptErrorCodeGatherer('javascript/atoms/error.js', 'Javascript atoms')) \
  .using(JavascriptErrorCodeGatherer('javascript/firefox-driver/js/errorcode.js', 'Javascript firefox driver')) \
  .using(RubyErrorCodeGatherer('rb/lib/selenium/webdriver/common/error.rb')) \
  .using(PythonErrorCodeGatherer('py/selenium/webdriver/remote/errorhandler.py')) \
  .using(CErrorCodeGatherer('cpp/webdriver-interactions/errorcodes.h')) \
  .using(CSharpErrorCodeGatherer('dotnet/src/WebDriver/WebDriverResult.cs'))

  if (not error_checker.check_error_codes_are_consistent(error_codes)
      and options.check_errors):
    sys.exit(1)

  resources = []

  resources.append(Resource('/status').
      Get('''
Query the server\'s current status.  The server should respond with a general \
"HTTP 200 OK" response if it is alive and accepting commands. The response \
body should be a JSON object describing the state of the server. All server \
implementations should return two basic objects describing the server's \
current platform and when the server was built. All fields are optional; \
if omitted, the client should assume the value is uknown. Furthermore, \
server implementations may include additional fields not listed here.

|| *Key* || *Type* || *Description* ||
|| build || object || ||
|| build.version || string || A generic release label (i.e. "2.0rc3") ||
|| build.revision || string || The revision of the local source control client \
from which the server was built ||
|| build.time || string || A timestamp from when the server was built. ||
|| os || object || ||
|| os.arch || string || The current system architecture. ||
|| os.name || string || The name of the operating system the server is \
currently running on: "windows", "linux", etc. ||
|| os.version || string || The operating system version. ||

''').
      SetReturnType('{object}',
                    'An object describing the general status of the server.'))

  resources.append(
      Resource('/session').
      Post('''
Create a new session. The server should attempt to create a session that most \
closely matches the desired capabilities.''').
      AddJsonParameter('desiredCapabilities',
                       '{object}',
                       'An object describing the session\'s '
                       '[#Desired_Capabilities desired capabilities].').
      SetReturnType(None,
                    'A `303 See Other` redirect to `/session/:sessionId`, where'
                    ' `:sessionId` is the ID of the newly created session.'))

  resources.append(
      Resource('/sessions').
      Get('''
Returns a list of the currently active sessions. Each session will be \
returned as a list of JSON objects with the following keys:

|| *Key* || *Type* || *Description ||
|| id || string || The session ID. ||
|| capabilities || object || An object describing the session's \
[#Actual_Capabilities capabilities]. ||

''').
      SetReturnType('{Array.<Object>}',
                    'A list of the currently active sessions.'))

  resources.append(
      SessionResource('/session/:sessionId').
      Get('Retrieve the capabilities of the specified session.').
      SetReturnType('{object}',
                    'An object describing the session\'s '
                    '[#Actual_Capabilities capabilities].').
      Delete('Delete the session.'))

  resources.append(
      SessionResource('/session/:sessionId/timeouts').
      Post('''
Configure the amount of time that a particular type of operation can execute \
for before they are aborted and a |Timeout| error is returned to the \
client.''').
      AddJsonParameter('type', '{string}',
					   'The type of operation to set the timeout for. Valid \
values are: "script" for script timeouts and "implicit" for modifying the \
implicit wait timeout.').
      AddJsonParameter('ms', '{number}',
                       'The amount of time, in milliseconds, that time-limited'
                       ' commands are permitted to run.'))

  resources.append(
      SessionResource('/session/:sessionId/timeouts/async_script').
      Post('''Set the amount of time, in milliseconds, that asynchronous \
scripts executed by `/session/:sessionId/execute_async` are permitted to run \
before they are aborted and a |Timeout| error is returned to the client.''').
      AddJsonParameter('ms', '{number}',
                       'The amount of time, in milliseconds, that time-limited'
                       ' commands are permitted to run.'))

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
                       ' has a lower bound of 0.'))

  resources.append(
      SessionResource('/session/:sessionId/window_handle').
      Get('Retrieve the current window handle.').
      SetReturnType('{string}', 'The current window handle.'))

  resources.append(
      SessionResource('/session/:sessionId/window_handles').
      Get('Retrieve the list of all window handles available to the session.').
      SetReturnType('{Array.<string>}', 'A list of window handles.'))

  resources.append(
      SessionResource('/session/:sessionId/url').
      Get('Retrieve the URL of the current page.').
      SetReturnType('{string}', 'The current URL.').
      Post('Navigate to a new URL.').
      AddJsonParameter('url', '{string}', 'The URL to navigate to.'))

  resources.append(
      SessionResource('/session/:sessionId/forward').
      Post('Navigate forwards in the browser history, if possible.'))

  resources.append(
      SessionResource('/session/:sessionId/back').
      Post('Navigate backwards in the browser history, if possible.'))

  resources.append(
      SessionResource('/session/:sessionId/refresh').
      Post('Refresh the current page.'))

  resources.append(
      SessionResource('/session/:sessionId/execute').
      Post('''
Inject a snippet of !JavaScript into the page for execution in the context of \
the currently selected frame. The executed script is assumed to be \
synchronous and the result of evaluating the script is returned to the client.

The `script` argument defines the script to execute in the form of a \
function body.  The value returned by that function will be returned to the \
client.  The function will be invoked with the provided `args` array and the \
values may be accessed via the `arguments` object in the order specified.

Arguments may be any JSON-primitive, array, or JSON object.  JSON objects that \
define a [#WebElement_JSON_Object WebElement reference] will be converted to \
the corresponding DOM element. Likewise, any !WebElements in the script result \
will be returned to the client as [#WebElement_JSON_Object WebElement \
JSON objects].''').
      AddJsonParameter('script', '{string}', 'The script to execute.').
      AddJsonParameter('args', '{Array.<*>}', 'The script arguments.').
      AddError('JavaScriptError', 'If the script throws an Error.').
      AddError('StaleElementReference',
               'If one of the script arguments is a !WebElement that is not '
               'attached to the page\'s DOM.').
      SetReturnType('{*}', 'The script result.'))

  resources.append(
      SessionResource('/session/:sessionId/execute_async').
      Post('''
Inject a snippet of !JavaScript into the page for execution in the context of \
the currently selected frame. The executed script is assumed to be \
asynchronous and must signal that is done by invoking the provided callback, \
which is always provided as the final argument to the function.  The value \
to this callback will be returned to the client.

Asynchronous script commands may not span page loads.  If an `unload` event is \
fired while waiting for a script result, an error should be returned to the \
client.

The `script` argument defines the script to execute in teh form of a function \
body.  The function will be invoked with the provided `args` array and the \
values may be accessed via the `arguments` object in the order specified. The \
final argument will always be a callback function that must be invoked to \
signal that the script has finished.

Arguments may be any JSON-primitive, array, or JSON object.  JSON objects that \
define a [#WebElement_JSON_Object WebElement reference] will be converted to \
the corresponding DOM element. Likewise, any !WebElements in the script result \
will be returned to the client as [#WebElement_JSON_Object WebElement \
JSON objects].''').
      AddJsonParameter('script', '{string}', 'The script to execute.').
      AddJsonParameter('args', '{Array.<*>}', 'The script arguments.').
      AddError('JavaScriptError',
               'If the script throws an Error or if an `unload` event is '
               'fired while waiting for the script to finish.').
      AddError('StaleElementReference',
               'If one of the script arguments is a !WebElement that is not '
               'attached to the page\'s DOM.').
      AddError('Timeout',
               'If the script callback is not invoked before the timout '
               'expires. Timeouts are controlled by the '
               '`/session/:sessionId/timeout/async_script` command.').
      SetReturnType('{*}', 'The script result.'))

  resources.append(
      SessionResource('/session/:sessionId/screenshot').
      Get('Take a screenshot of the current page.').
      SetReturnType('{string}', 'The screenshot as a base64 encoded PNG.'))

  resources.append(
      SessionResource('/session/:sessionId/ime/available_engines').
      Get('List all available engines on the machine. To use an engine, it has to be present in this list.').
      AddError('ImeNotAvailableException', 'If the host does not support IME').
      SetReturnType('{Array.<string>}', 'A list of available engines'))

  resources.append(
      SessionResource('/session/:sessionId/ime/active_engine').
      Get('Get the name of the active IME engine. The name string is platform specific.').
      AddError('ImeNotAvailableException', 'If the host does not support IME').
      SetReturnType('{string}', 'The name of the active IME engine.'))

  resources.append(
      SessionResource('/session/:sessionId/ime/activated').
      Get('Indicates whether IME input is active at the moment (not if it\'s available.').
      AddError('ImeNotAvailableException', 'If the host does not support IME').
      SetReturnType('{boolean}',
                    'true if IME input is available and currently active, false otherwise'))

  resources.append(
      SessionResource('/session/:sessionId/ime/deactivate').
      Post('De-activates the currently-active IME engine.').
      AddError('ImeNotAvailableException', 'If the host does not support IME'))

  resources.append(
      SessionResource('/session/:sessionId/ime/activate').
      Post('''Make an engines that is available (appears on the list
returned by getAvailableEngines) active. After this call, the engine will
be added to the list of engines loaded in the IME daemon and the input sent
using sendKeys will be converted by the active engine.
Note that this is a platform-independent method of activating IME
(the platform-specific way being using keyboard shortcuts''').
      AddJsonParameter('engine', '{string}',
                       'Name of the engine to activate.').
      AddError('ImeActivationFailedException',
               'If the engine is not available or if the activation fails for other reasons.').
      AddError('ImeNotAvailableException', 'If the host does not support IME'))

  resources.append(
      SessionResource('/session/:sessionId/frame').
      Post('''Change focus to another frame on the page. If the frame ID is \
`null`, the server
should switch to the page's default content.''').
      AddJsonParameter('id', '{string|number|null}',
                       'Identifier for the frame to change focus to.').
      AddError('NoSuchFrame', 'If the frame specified by `id` cannot be found.'))

  resources.append(
      SessionResource('/session/:sessionId/window').
      Post('''Change focus to another window. The window to change focus to \
may be specified by its
server assigned window handle, or by the value of its `name` attribute.''').
      AddJsonParameter('name', '{string}', 'The window to change focus to.').
      Delete('''Close the current window.''').
      AddError('NoSuchWindow', 'If the window specified by `name` cannot be found.'))

  resources.append(
      SessionResource('/session/:sessionId/window/:windowHandle/size').
      Post('''Change the size of the specified window. If the :windowHandle URL \
parameter is "current", the currently active window will be resized.''').
      AddJsonParameter('width', '{number}', 'The new window width.').
      AddJsonParameter('height', '{number}', 'The new window height.').
      Get('''Get the size of the specified window. If the :windowHandle URL \
parameter is "current", the size of the currently active window will be returned.''').
      SetReturnType('{width: number, height: number}', 'The size of the window.').
      AddError('NoSuchWindow', 'If the specified window cannot be found.'))

  resources.append(
      SessionResource('/session/:sessionId/window/:windowHandle/position').
      Post('''Change the position of the specified window. If the :windowHandle URL \
parameter is "current", the currently active window will be moved.''').
      AddJsonParameter('x', '{number}', 'The X coordinate to position the window at, \
relative to the upper left corner of the screen.').
      AddJsonParameter('y', '{number}', 'The Y coordinate to position the window at, \
relative to the upper left corner of the screen.').
      Get('''Get the position of the specified window. If the :windowHandle URL \
      parameter is "current", the position of the currently active window will be returned.''').
      SetReturnType('{x: number, y: number}', 'The X and Y coordinates for the window, \
relative to the upper left corner of the screen.').
      AddError('NoSuchWindow', 'If the specified window cannot be found.'))

  resources.append(
      SessionResource('/session/:sessionId/cookie').
      Get('Retrieve all cookies visible to the current page.').
      SetReturnType('{Array.<object>}', 'A list of [#Cookie_JSON_Object cookies].').
      Post('''Set a cookie. If the [#Cookie_JSON_Object cookie] path is not \
specified, it should be set to `"/"`. Likewise, if the domain is omitted, it \
should default to the current page's domain.''').
      AddJsonParameter('cookie', '{object}',
                       'A [#Cookie_JSON_Object JSON object] defining the '
                       'cookie to add.').
      Delete('''Delete all cookies visible to the current page.''').
      AddError('InvalidCookieDomain',
               'If the cookie\'s `domain` is not visible from the current page.').
      AddError('UnableToSetCookie',
               'If attempting to set a cookie on a page that does not support '
               'cookies (e.g. pages with mime-type `text/plain`).'))

  resources.append(
      SessionResource('/session/:sessionId/cookie/:name').
      Delete('''Delete the cookie with the given name. This command should be \
a no-op if there is no
such cookie visible to the current page.''').
      AddUrlParameter(':name', 'The name of the cookie to delete.'))

  resources.append(
      SessionResource('/session/:sessionId/source').
      Get('Get the current page source.').
      SetReturnType('{string}', 'The current page source.'))

  resources.append(
      SessionResource('/session/:sessionId/title').
      Get('Get the current page title.').
      SetReturnType('{string}', 'The current page title.'))

  resources.append(
      SessionResource('/session/:sessionId/element').
      Post('''Search for an element on the page, starting from the document \
root. The located element will be returned as a WebElement JSON object. \
The table below lists the locator strategies that each server should support. \
Each locator must return the first matching element located in the DOM.

|| *Strategy* || *Description* ||
|| class name || Returns an element whose class name contains the search \
value; compound class names are not permitted. ||
|| css selector || Returns an element matching a CSS selector. ||
|| id || Returns an element whose ID attribute matches the search value. ||
|| name || Returns an element whose NAME attribute matches the search value. ||
|| link text || Returns an anchor element whose visible text matches the \
search value. ||
|| partial link text || Returns an anchor element whose visible text \
partially matches the search value. ||
|| tag name || Returns an element whose tag name matches the search value. ||
|| xpath || Returns an element matching an XPath expression. ||

''').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{ELEMENT:string}',
                    'A WebElement JSON object for the located element.').
      AddError('XPathLookupError', 'If using XPath and the input expression is invalid.').
      AddError('NoSuchElement', 'If the element cannot be found.'))

  resources.append(
      SessionResource('/session/:sessionId/elements').
      Post('''Search for multiple elements on the page, starting from the \
document root. The located elements will be returned as a WebElement JSON \
objects. The table below lists the locator strategies that each server should \
support. Elements should be returned in the order located in the DOM.

|| *Strategy* || *Description* ||
|| class name || Returns all elements whose class name contains the search \
value; compound class names are not permitted. ||
|| css selector || Returns all elements matching a CSS selector. ||
|| id || Returns all elements whose ID attribute matches the search value. ||
|| name || Returns all elements whose NAME attribute matches the search value. ||
|| link text || Returns all anchor elements whose visible text matches the \
search value. ||
|| partial link text || Returns all anchor elements whose visible text \
partially matches the search value. ||
|| tag name || Returns all elements whose tag name matches the search value. ||
|| xpath || Returns all elements matching an XPath expression. ||

''').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{Array.<{ELEMENT:string}>}',
                    'A list of WebElement JSON objects for the located elements.').
      AddError('XPathLookupError', 'If using XPath and the input expression is invalid.'))

  resources.append(
      SessionResource('/session/:sessionId/element/active').
      Post('Get the element on the page that currently has focus. The element will be returned as '
           'a WebElement JSON object.').
      SetReturnType('{ELEMENT:string}', 'A WebElement JSON object for the active element.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id').
      Get('''Describe the identified element.

*Note:* This command is reserved for future use; its return type is currently \
undefined.'''))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/element').
      Post('''Search for an element on the page, starting from the identified \
element. The located element will be returned as a WebElement JSON object. \
The table below lists the locator strategies that each server should support. \
Each locator must return the first matching element located in the DOM.

|| *Strategy* || *Description* ||
|| class name || Returns an element whose class name contains the search \
value; compound class names are not permitted. ||
|| css selector || Returns an element matching a CSS selector. ||
|| id || Returns an element whose ID attribute matches the search value. ||
|| name || Returns an element whose NAME attribute matches the search value. ||
|| link text || Returns an anchor element whose visible text matches the \
search value. ||
|| partial link text || Returns an anchor element whose visible text \
partially matches the search value. ||
|| tag name || Returns an element whose tag name matches the search value. ||
|| xpath || Returns an element matching an XPath expression. The provided \
XPath expression must be applied to the server "as is"; if the expression is \
not relative to the element root, the server should not modify it. \
Consequently, an XPath query may return elements not contained in the root \
element's subtree. ||

''').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{ELEMENT:string}',
                    'A WebElement JSON object for the located element.').
      AddError('NoSuchElement', 'If the element cannot be found.').
      AddError('XPathLookupError', 'If using XPath and the input expression is invalid.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/elements').
      Post('''Search for multiple elements on the page, starting from the \
identified element. The located elements will be returned as a WebElement \
JSON objects. The table below lists the locator strategies that each server \
should support. Elements should be returned in the order located in the DOM.

|| *Strategy* || *Description* ||
|| class name || Returns all elements whose class name contains the search \
value; compound class names are not permitted. ||
|| css selector || Returns all elements matching a CSS selector. ||
|| id || Returns all elements whose ID attribute matches the search value. ||
|| name || Returns all elements whose NAME attribute matches the search value. ||
|| link text || Returns all anchor elements whose visible text matches the \
search value. ||
|| partial link text || Returns all anchor elements whose visible text \
partially matches the search value. ||
|| tag name || Returns all elements whose tag name matches the search value. ||
|| xpath || Returns all elements matching an XPath expression. The provided \
XPath expression must be applied to the server "as is"; if the expression is \
not relative to the element root, the server should not modify it. \
Consequently, an XPath query may return elements not contained in the root \
element's subtree. ||

''').
      AddJsonParameter('using', '{string}', 'The locator strategy to use.').
      AddJsonParameter('value', '{string}', 'The The search target.').
      SetReturnType('{Array.<{ELEMENT:string}>}',
                    'A list of WebElement JSON objects for the located elements.').
      AddError('XPathLookupError', 'If using XPath and the input expression is invalid.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/click').
      Post('Click on an element.').
      RequiresVisibility())

  resources.append(
      ElementResource('/session/:sessionId/element/:id/submit').
      Post('Submit a `FORM` element. The submit command may also be applied to any element that is '
           'a descendant of a `FORM` element.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/text').
      Get('Returns the visible text for the element.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/value').
      Post('''Send a sequence of key strokes to an element.

Any UTF-8 character may be specified, however, if the server does not support \
native key events, it should simulate key strokes for a standard US keyboard \
layout. The Unicode [http://unicode.org/faq/casemap_charprop.html#8 Private Use\
 Area] code points, 0xE000-0xF8FF, are used to represent pressable, non-text \
 keys (see table below).


<table cellspacing=5 cellpadding=5>
<tbody><tr><td valign=top>
|| *Key* || *Code* ||
|| NULL || U+E000 ||
|| Cancel || U+E001 ||
|| Help || U+E002 ||
|| Back space || U+E003 ||
|| Tab || U+E004 ||
|| Clear || U+E005 ||
|| Return^1^ || U+E006 ||
|| Enter^1^ || U+E007 ||
|| Shift || U+E008 ||
|| Control || U+E009 ||
|| Alt || U+E00A ||
|| Pause  || U+E00B ||
|| Escape || U+E00C ||

</td><td valign=top>
|| *Key* || *Code* ||
|| Space || U+E00D ||
|| Pageup || U+E00E ||
|| Pagedown || U+E00F ||
|| End || U+E010 ||
|| Home || U+E011 ||
|| Left arrow || U+E012 ||
|| Up arrow || U+E013 ||
|| Right arrow || U+E014 ||
|| Down arrow || U+E015 ||
|| Insert || U+E016 ||
|| Delete || U+E017 ||
|| Semicolon || U+E018 ||
|| Equals || U+E019 ||

</td><td valign=top>
|| *Key* || *Code* ||
|| Numpad 0 || U+E01A ||
|| Numpad 1 || U+E01B ||
|| Numpad 2 || U+E01C ||
|| Numpad 3 || U+E01D ||
|| Numpad 4 || U+E01E ||
|| Numpad 5 || U+E01F ||
|| Numpad 6 || U+E020 ||
|| Numpad 7 || U+E021 ||
|| Numpad 8 || U+E022 ||
|| Numpad 9 || U+E023 ||

</td><td valign=top>
|| *Key* || *Code* ||
|| Multiply || U+E024 ||
|| Add || U+E025 ||
|| Separator || U+E026 ||
|| Subtract || U+E027 ||
|| Decimal || U+E028 ||
|| Divide || U+E029 ||

</td><td valign=top>
|| *Key* || *Code* ||
|| F1 || U+E031 ||
|| F2 || U+E032 ||
|| F3 || U+E033 ||
|| F4 || U+E034 ||
|| F5 || U+E035 ||
|| F6 || U+E036 ||
|| F7 || U+E037 ||
|| F8 || U+E038 ||
|| F9 || U+E039 ||
|| F10 || U+E03A ||
|| F11 || U+E03B ||
|| F12 || U+E03C ||
|| Command/Meta || U+E03D ||

</td></tr>
<tr><td colspan=5>^1^ The return key is _not the same_ as the \
[http://en.wikipedia.org/wiki/Enter_key enter key].</td></tr></tbody></table>

The server must process the key sequence as follows:
  * Each key that appears on the keyboard without requiring modifiers are sent \
as a keydown followed by a key up.
  * If the server does not support native events and must simulate key strokes \
with !JavaScript, it must generate keydown, keypress, and keyup events, in that\
 order. The keypress event should only be fired when the corresponding key is \
for a printable character.
  * If a key requires a modifier key (e.g. "!" on a standard US keyboard), the \
sequence is: <var>modifier</var> down, <var>key</var> down, <var>key</var> up, \
<var>modifier</var> up, where <var>key</var> is the ideal unmodified key value \
(using the previous example, a "1").
  * Modifier keys (Ctrl, Shift, Alt, and Command/Meta) are assumed to be \
"sticky"; each modifier should be held down (e.g. only a keydown event) until \
either the modifier is encountered again in the sequence, or the `NULL` \
(U+E000) key is encountered.
  * Each key sequence is terminated with an implicit `NULL` key. Subsequently, \
all depressed modifier keys must be released (with corresponding keyup events) \
at the end of the sequence.
''').
      RequiresVisibility().
      AddJsonParameter('value', '{Array.<string>}',
                       'The sequence of keys to type. An array must be provided. '
                       'The server should flatten the array items to a single '
                       'string to be typed.'))

  resources.append(
      SessionResource('/session/:sessionId/keys').
      Post('Send a sequence of key strokes to the active element. This '
           'command is similar to the '
           '[JsonWireProtocol#/session/:sessionId/element/:id/value'
           ' send keys] command in every aspect except the implicit '
           'termination: The modifiers are *not* released at the end of the '
           'call. Rather, the state of the modifier keys is kept between '
           'calls, so mouse interactions can be performed while modifier '
           'keys are depressed.').
      AddJsonParameter('value', '{Array.<string>}',
                       'The keys sequence to be sent. The sequence is defined '
                       'in the'
                       '[JsonWireProtocol#/session/:sessionId/element/:id/value'
                       ' send keys] command.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/name').
      Get('Query for an element\'s tag name.').
      SetReturnType('{string}', 'The element\'s tag name, as a lowercase string.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/clear').
      Post('Clear a `TEXTAREA` or `text INPUT` element\'s value.').
      RequiresVisibility().
      RequiresEnabledState())

  resources.append(
      ElementResource('/session/:sessionId/element/:id/selected').
      Get('Determine if an `OPTION` element, or an `INPUT` element of type `checkbox` or '
          '`radiobutton` is currently selected.').
      SetReturnType('{boolean}', 'Whether the element is selected.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/enabled').
      Get('Determine if an element is currently enabled.').
      SetReturnType('{boolean}', 'Whether the element is enabled.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/attribute/:name').
      Get('Get the value of an element\'s attribute.').
      SetReturnType('{string|null}',
                    'The value of the attribute, or null if it is not set on the element.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/equals/:other').
      Get('Test if two element IDs refer to the same DOM element.').
      AddUrlParameter(':other', 'ID of the element to compare against.').
      SetReturnType('{boolean}', 'Whether the two IDs refer to the same element.').
      AddError('StaleElementReference',
               'If either the element refered to by `:id` or `:other` is no '
               'longer attached to the page\'s DOM.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/displayed').
      Get('Determine if an element is currently displayed.').
      SetReturnType('{boolean}', 'Whether the element is displayed.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/location').
      Get('Determine an element\'s location on the page. The point `(0, 0)` refers to the '
          'upper-left corner of the page. The element\'s coordinates are returned as a JSON object '
          'with `x` and `y` properties.').
      SetReturnType('{x:number, y:number}', 'The X and Y coordinates for the element on the page.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/location_in_view').
      Get('''Determine an element\'s location on the screen once it has been \
scrolled into view.

*Note:* This is considered an internal command and should *only* be used to \
determine an element's
location for correctly generating native events.''').
      SetReturnType('{x:number, y:number}', 'The X and Y coordinates for the element.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/size').
      Get('Determine an element\'s size in pixels. The size will be returned as a JSON object '
          ' with `width` and `height` properties.').
      SetReturnType('{width:number, height:number}', 'The width and height of the element, in pixels.'))

  resources.append(
      ElementResource('/session/:sessionId/element/:id/css/:propertyName').
      Get('Query the value of an element\'s computed CSS property. The CSS property to query should'
          ' be specified using the CSS property name, *not* the !JavaScript property name (e.g. '
          '`background-color` instead of `backgroundColor`).').
      SetReturnType('{string}', 'The value of the specified CSS property.'))

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
      Post('Set the browser orientation. The orientation should be specified '
           'as defined in [http://selenium.googlecode.com/svn/trunk/docs/api/'
           'java/org/openqa/selenium/ScreenOrientation.html ScreenOrientation]'
           ': `{LANDSCAPE|PORTRAIT}`.').
      AddJsonParameter('orientation', '{string}',
                       'The new browser orientation as defined in '
                       '[http://selenium.googlecode.com/svn/trunk/docs/api/'
                       'java/org/openqa/selenium/ScreenOrientation.html '
                       'ScreenOrientation]: `{LANDSCAPE|PORTRAIT}`.'))

  resources.append(
      SessionResource('/session/:sessionId/alert_text').
      Get('Gets the text of the currently displayed JavaScript `alert()`, `confirm()`, '
          'or `prompt()` dialog.').
      SetReturnType('{string}', 'The text of the currently displayed alert.').
      AddError('NoAlertPresent', 'If there is no alert displayed.').
      Post('Sends keystrokes to a JavaScript `prompt()` dialog.').
      AddJsonParameter('text', '{string}', 'Keystrokes to send to the `prompt()` dialog.').
      AddError('NoAlertPresent', 'If there is no alert displayed.'))

  resources.append(
      SessionResource('/session/:sessionId/accept_alert').
      Post('Accepts the currently displayed alert dialog. Usually, this is equivalent '
           'to clicking on the \'OK\' button in the dialog.').
      AddError('NoAlertPresent', 'If there is no alert displayed.'))

  resources.append(
      SessionResource('/session/:sessionId/dismiss_alert').
      Post('Dismisses the currently displayed alert dialog. For `confirm()` and `prompt()` '
           'dialogs, this is equivalent to clicking the \'Cancel\' button. For `alert()` '
           'dialogs, this is equivalent to clicking the \'OK\' button.').
      AddError('NoAlertPresent', 'If there is no alert displayed.'))

  resources.append(
      SessionResource('/session/:sessionId/moveto').
      Post('Move the mouse by an offset of the specificed element. If no element '
           'is specified, the move is relative to the current mouse cursor. If an '
           'element is provided but no offset, the mouse will be moved to the center'
           ' of the element. If the element is not visible, it will be scrolled into view.').
      AddJsonParameter('element', '{string}', 'ID of the element to move to. If not specified'
                       ' or is null, the offset is relative to current position of the mouse.').
      AddJsonParameter('xoffset', '{number}', 'X offset to move to, relative to the top-left '
                       'corner of the element. If not specified, the mouse'
                       ' will move to the middle of the element.').
      AddJsonParameter('yoffset', '{number}', 'Y offset to move to, relative to the top-left '
                       'corner of the element. If not specified, the mouse'
                       ' will move to the middle of the element.'))

  resources.append(
      SessionResource('/session/:sessionId/click').
      Post('Click any mouse button (at the coordinates set by the last moveto command). Note '
           'that calling this command after calling buttondown and before calling button up '
           '(or any out-of-order interactions sequence) will yield undefined behaviour).').
      AddJsonParameter('button', '{number}', 'Which button, enum: `{LEFT = 0, MIDDLE = 1 '
                       ', RIGHT = 2}`. Defaults to the left mouse button if not specified.'))

  resources.append(
      SessionResource('/session/:sessionId/buttondown').
      Post('Click and hold the left mouse button (at the coordinates set by the last moveto '
           'command). Note that the next mouse-related command that should follow is buttondown'
           ' . Any other mouse command (such as click or another call to buttondown) will yield'
           ' undefined behaviour.'))

  resources.append(
      SessionResource('/session/:sessionId/buttonup').
      Post('Releases the mouse button previously held (where the mouse is currently at). '
           'Must be called once for every buttondown command issued. See the note in click and '
           'buttondown about implications of out-of-order commands.'))

  resources.append(
      SessionResource('/session/:sessionId/doubleclick').
      Post('Double-clicks at the current mouse coordinates (set by moveto).'))

  resources.append(
      SessionResource('/session/:sessionId/touch/click').
      Post('Single tap on the touch enabled device.').
      AddJsonParameter('element', '{string}', 'ID of the element to single tap '
                       'on.'))
  resources.append(
      SessionResource('/session/:sessionId/touch/down').
      Post('Finger down on the screen.').
      AddJsonParameter('x', '{number}', 'X coordinate on the screen.').
      AddJsonParameter('y', '{number}', 'Y coordinate on the screen.'))
  resources.append(
      SessionResource('/session/:sessionId/touch/up').
      Post('Finger up on the screen.').
      AddJsonParameter('x', '{number}', 'X coordinate on the screen.').
      AddJsonParameter('y', '{number}', 'Y coordinate on the screen.'))
  resources.append(
      SessionResource('session/:sessionId/touch/move').
      Post('Finger move on the screen.').
      AddJsonParameter('x', '{number}', 'X coordinate on the screen.').
      AddJsonParameter('y', '{number}', 'Y coordinate on the screen.'))
  resources.append(
      SessionResource('session/:sessionId/touch/scroll').
      Post('Scroll on the touch screen using finger based motion events. Use '
           'this command to start scrolling at a particular screen location.').
      AddJsonParameter('element', '{string}', 'ID of the element where the '
                       'scroll starts.').
      AddJsonParameter('xOffset', '{number}', 'The x offset in pixels to scroll '
                       'by.').
      AddJsonParameter('yOffset', '{number}', 'The y offset in pixels to scroll '
                       'by.'))
  resources.append(
      SessionResource('session/:sessionId/touch/scroll').
      Post('Scroll on the touch screen using finger based motion events. Use '
           'this command if you don\'t care where the scroll starts on the '
           'screen.').
      AddJsonParameter('xOffset', '{number}', 'The x offset in pixels to scroll'
                       'by.').
      AddJsonParameter('yOffset', '{number}', 'The y offset in pixels to scroll'
                       'by.'))
  resources.append(
      SessionResource('session/:sessionId/touch/doubleclick').
      Post('Double tap on the touch screen using finger motion events.').
      AddJsonParameter('element', '{string}', 'ID of the element to double tap '
                       'on.'))
  resources.append(
      SessionResource('session/:sessionId/touch/longclick').
      Post('Long press on the touch screen using finger motion events.').
      AddJsonParameter('element', '{string}', 'ID of the element to long press '
                       'on.'))
  resources.append(
      SessionResource('session/:sessionId/touch/flick').
      Post('Flick on the touch screen using finger motion events. This flick'
           'command starts at a particulat screen location.').
      AddJsonParameter('element', '{string}', 'ID of the element where the '
                       'flick starts.').
      AddJsonParameter('xOffset', '{number}', 'The x offset in pixels to flick '
                       'by.').
      AddJsonParameter('yOffset', '{number}', 'The y offset in pixels to flick '
                       'by.').
      AddJsonParameter('speed', '{number}', 'The speed in pixels per seconds.'))
  resources.append(
      SessionResource('session/:sessionId/touch/flick').
      Post('Flick on the touch screen using finger motion events. Use this '
           'flick command if you don\'t care where the flick starts on the screen.').
      AddJsonParameter('xSpeed', '{number}', 'The x speed in pixels per '
                       'second.').
      AddJsonParameter('ySpeed', '{number}', 'The y speed in pixels per '
                      'second.'))

  resources.append(
      SessionResource('/session/:sessionId/location').
      Get('Get the current geo location.').
      SetReturnType('{latitude: number, longitude: number, altitude: number}', 'The current geo location.').
      Post('Set the current geo location.').
      AddJsonParameter('location', '{latitude: number, longitude: number, altitude: number}', 'The new location.'))

  resources.append(
      SessionResource('/session/:sessionId/local_storage').
      Get('Get all keys of the storage.').
      SetReturnType('{Array.<string>}', 'The list of keys.').
      Post('Set the storage item for the given key.').
      AddJsonParameter('key', '{string}', 'The key to set.').
      AddJsonParameter('value', '{string}', 'The value to set.').
      Delete('Clear the storage.'))

  resources.append(
      SessionResource('/session/:sessionId/local_storage/key/:key').
      Get('Get the storage item for the given key.').
      AddUrlParameter(':key', 'The key to get.').
      Delete('Remove the storage item for the given key.').
      AddUrlParameter(':key', 'The key to remove.'))

  resources.append(
      SessionResource('/session/:sessionId/local_storage/size').
      Get('Get the number of items in the storage.').
      SetReturnType('{number}', 'The number of items in the storage.'))

  resources.append(
      SessionResource('/session/:sessionId/session_storage').
      Get('Get all keys of the storage.').
      SetReturnType('{Array.<string>}', 'The list of keys.').
      Post('Set the storage item for the given key.').
      AddJsonParameter('key', '{string}', 'The key to set.').
      AddJsonParameter('value', '{string}', 'The value to set.').
      Delete('Clear the storage.'))

  resources.append(
      SessionResource('/session/:sessionId/session_storage/key/:key').
      Get('Get the storage item for the given key.').
      AddUrlParameter(':key', 'The key to get.').
      Delete('Remove the storage item for the given key.').
      AddUrlParameter(':key', 'The key to remove.'))

  resources.append(
      SessionResource('/session/:sessionId/session_storage/size').
      Get('Get the number of items in the storage.').
      SetReturnType('{number}', 'The number of items in the storage.'))

  logging.info('Generating %s', wiki_path)
  f = open(wiki_path, 'w')
  try:
    f.write('''#summary A description of the protocol used by WebDriver to \
communicate with remote instances
#labels WebDriver
<wiki:comment>
========================================================
========================================================

DO NOT EDIT THIS WIKI PAGE THROUGH THE UI.

Instead, use http://selenium.googlecode.com/svn/trunk/wire.py

$ svn co https://selenium.googlecode.com/svn/ --depth=empty wire_protocol
$ cd wire_protocol
$ svn update --depth=infinity ./wiki
$ svn update --depth=files ./trunk
# modify ./trunk/wire.py
$ python ./trunk/wire.py
$ svn commit ./trunk/wire.py ./wiki/JsonWireProtocol.wiki

========================================================
========================================================
</wiki:comment>

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

== Basic Terms and Concepts ==

<dl>
<dt>
==== Client ====
</dt>
<dd>The machine on which the !WebDriver API is being used.

</dd>
<dt>
==== Server ====
</dt>
<dd>The machine running the RemoteWebDriver. This term may also refer to a \
specific browser that implements the wire protocol directly, such as the \
FirefoxDriver or IPhoneDriver.

</dd>
<dt>
==== Session ====
</dt>
<dd>The server should maintain one browser per session. Commands sent to a \
session will be directed to the corresponding browser.

</dd>
<dt>
==== !WebElement ====
</dt>
<dd>An object in the !WebDriver API that represents a DOM element on the page.

</dd>
<dt>
==== !WebElement JSON Object ====
</dt>
<dd>The JSON representation of a !WebElement for transmission over the wire. \
This object will have the following properties:

|| *Key* || *Type* || *Description* ||
|| ELEMENT || string || The opaque ID assigned to the element by the server. \
This ID should be used in all subsequent commands issued against the element. ||

</dd>

<dt>
==== Capabilities JSON Object ====
</dt>
<dd>Not all server implementations will support every !WebDriver feature. \
Therefore, the client and server should use JSON objects with the properties \
listed below when describing which features a session supports.

|| *Key* || *Type* || *Description* ||
|| browserName || string || The name of the browser being used; should be one \
of `{chrome|firefox|htmlunit|internet explorer|iphone}`. ||
|| version || string || The browser version, or the empty string if unknown. ||
|| platform || string || A key specifying which platform the browser is running \
on. This value should be one of `{WINDOWS|XP|VISTA|MAC|LINUX|UNIX}`. When \
requesting a new session, the client may specify `ANY` to indicate any \
available platform may be used. ||
|| javascriptEnabled || boolean || Whether the session supports executing user \
supplied JavaScript in the context of the current page. ||
|| takesScreenshot || boolean || Whether the session supports taking \
screenshots of the current page. ||
|| handlesAlerts || boolean || Whether the session can interact with modal \
popups, such as `window.alert` and `window.confirm`. ||
|| databaseEnabled || boolean || Whether the session can interact \
database storage. ||
|| locationContextEnabled || boolean || Whether the session can set and query \
the browser's location context. ||
|| applicationCacheEnabled || boolean || Whether the session can interact with \
the application cache. ||
|| browserConnectionEnabled || boolean || Whether the session can query for \
the browser's connectivity and disable it if desired. ||
|| cssSelectorsEnabled || boolean || Whether the session supports CSS \
selectors when searching for elements. ||
|| webStorageEnabled || boolean || Whether the session supports interactions \
with [http://www.w3.org/TR/2009/WD-webstorage-20091029/ storage objects]. ||
|| rotatable || boolean || Whether the session can rotate the current page's \
current layout between portrait and landscape orientations (only applies to \
mobile platforms). ||
|| acceptSslCerts || boolean || Whether the session should accept all SSL \
certs by default. ||
|| nativeEvents || boolean || Whether the session is capable of generating \
native events when simulating user input. ||
|| proxy || proxy object || Details of any proxy to use. If no proxy is \
specified, whatever the system's current or default state is used. The format \
is specified under Proxy JSON Object. ||


</dd>

<dt>
==== Desired Capabilities ====
</dt>
<dd>A Capabilities JSON Object sent by the client describing the capabilities \
a new session created by the server should possess. Any omitted keys implicitly \
indicate the corresponding capability is irrelevant.</dd>

<dt>
==== Actual Capabilities ====
</dt>
<dd>A Capabilities JSON Object returned by the server describing what \
features a session actually supports. Any omitted keys implicitly indicate \
the corresponding capability is not supported.</dd>

<dt>
==== Cookie JSON Object ====
</dt>
<dd>
A JSON object describing a Cookie.

|| *Key* || *Type* || *Description* ||
|| name || string || The name of the cookie. ||
|| value || string || The cookie value. ||
|| path || string || (Optional) The cookie path.^1^ ||
|| domain || string || (Optional) The domain the cookie is visible to.^1^ ||
|| secure || boolean || (Optional) Whether the cookie is a secure cookie.^1^ ||
|| expiry || number || (Optional) When the cookie expires, specified in \
seconds since midnight, January 1, 1970 UTC.^1^ ||

^1^ When returning Cookie objects, the server should only omit an optional \
field if it is incapable of providing the information.</dd>

<dt>
=== Proxy JSON Object ===
</dt>
<dd>
A JSON object describing a Proxy configuration.

|| *Key* || *Type* || *Description* ||
|| proxyType || string || (Required) The type of proxy being used. Possible \
values are: *direct* - A direct connection - no proxy in use, *manual* - \
Manual proxy settings configured, e.g. setting a proxy for HTTP, a proxy for \
FTP, etc, *pac* - Proxy autoconfiguration from a URL), autodetect (proxy \
autodetection, probably with WPAD, *system* - Use system settings ||
|| proxyAutoconfigUrl || string || (Required if proxyType == pac, Ignored \
otherwise) Specifies the URL to be used for proxy autoconfiguration. \
Expected format example: http://hostname.com:1234/pacfile ||
|| ftpProxy, httpProxy, sslProxy || string || (Optional, Ignored if proxyType \
!= manual) Specifies the proxies to be used for FTP, HTTP and HTTPS requests \
respectively. Behaviour is undefined if a request is made, where the proxy \
for the particular protocol is undefined, if proxyType is manual. Expected \
format example: hostname.com:1234 ||
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
%s

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

|| *HTTP Method* || *Path* || *Summary* ||
%s

== Command Detail ==

%s''' % ('\n'.join(e.ToWikiTableString() for e in error_codes),
         ''.join(r.ToWikiTableString() for r in resources),
         '\n----\n\n'.join(r.ToWikiString() for r in resources)))
  finally:
    f.close()
  logging.info('ALL DONE!')


if __name__ == '__main__':
  main()
