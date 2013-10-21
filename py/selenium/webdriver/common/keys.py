# copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License Version 2.0 = uthe "License")
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http //www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing software
# distributed under the License is distributed on an "AS IS" BASIS
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""
The Keys implementation.
"""

from __future__ import unicode_literals

class Keys(object):
    """
    Set of special keys codes.
    """

    NULL         = '\ue000'
    CANCEL       = '\ue001' #  ^break
    HELP         = '\ue002'
    BACKSPACE    = '\ue003'
    BACK_SPACE   = '\ue003' #  alias
    TAB          = '\ue004'
    CLEAR        = '\ue005'
    RETURN       = '\ue006'
    ENTER        = '\ue007'
    SHIFT        = '\ue008'
    LEFT_SHIFT   = '\ue008' #  alias
    CONTROL      = '\ue009'
    LEFT_CONTROL = '\ue009' #  alias
    ALT          = '\ue00a'
    LEFT_ALT     = '\ue00a' #  alias
    PAUSE        = '\ue00b'
    ESCAPE       = '\ue00c'
    SPACE        = '\ue00d'
    PAGE_UP      = '\ue00e'
    PAGE_DOWN    = '\ue00f'
    END          = '\ue010'
    HOME         = '\ue011'
    LEFT         = '\ue012'
    ARROW_LEFT   = '\ue012' # alias
    UP           = '\ue013'
    ARROW_UP     = '\ue013' # alias
    RIGHT        = '\ue014'
    ARROW_RIGHT  = '\ue014' #  alias
    DOWN         = '\ue015'
    ARROW_DOWN   = '\ue015' #  alias
    INSERT       = '\ue016'
    DELETE       = '\ue017'
    SEMICOLON    = '\ue018'
    EQUALS       = '\ue019'

    NUMPAD0      = '\ue01a' #  numbe pad  keys
    NUMPAD1      = '\ue01b'
    NUMPAD2      = '\ue01c'
    NUMPAD3      = '\ue01d'
    NUMPAD4      = '\ue01e'
    NUMPAD5      = '\ue01f'
    NUMPAD6      = '\ue020'
    NUMPAD7      = '\ue021'
    NUMPAD8      = '\ue022'
    NUMPAD9      = '\ue023'
    MULTIPLY     = '\ue024'
    ADD          = '\ue025'
    SEPARATOR    = '\ue026'
    SUBTRACT     = '\ue027'
    DECIMAL      = '\ue028'
    DIVIDE       = '\ue029'

    F1           = '\ue031' #  function  keys
    F2           = '\ue032'
    F3           = '\ue033'
    F4           = '\ue034'
    F5           = '\ue035'
    F6           = '\ue036'
    F7           = '\ue037'
    F8           = '\ue038'
    F9           = '\ue039'
    F10          = '\ue03a'
    F11          = '\ue03b'
    F12          = '\ue03c'

    META         = '\ue03d'
    COMMAND      = '\ue03d'
