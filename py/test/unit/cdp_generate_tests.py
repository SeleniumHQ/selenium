# The MIT License(MIT)
#
# Copyright(c) 2018 Hyperion Gray
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files(the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

# This is a modified copy of:
# - https://github.com/HyperionGray/python-chrome-devtools-protocol/blob/master/generator/test_generate.py
# The license above is theirs and MUST be preserved.


"""
A combination of unit tests and integration tests.

The main purpose of the tests is to make sure that the CDP spec is converted
into Python code correctly, i.e. integration testing. But some of the most
complicated logic is also covered by unit tests.

Tests that generate code will typically print the expected and actual values.
Pytest doesn't display stdout by default unless a test fails, and debugging
codegen tests is almost always easier with the values displayed on stdout.
"""

# flake8: noqa: E501

from textwrap import dedent

from generate import CdpCommand, CdpDomain, CdpEvent, CdpType, docstring


def test_docstring():
    description = (
        "Values of AXProperty name:\n- from 'busy' to 'roledescription': "
        "states which apply to every AX node\n- from 'live' to 'root': "
        "attributes which apply to nodes in live regions\n- from "
        "'autocomplete' to 'valuetext': attributes which apply to "
        "widgets\n- from 'checked' to 'selected': states which apply to "
        "widgets\n- from 'activedescendant' to 'owns' - relationships "
        "between elements other than parent/child/sibling."
    )
    expected = dedent("""\
        '''
        Values of AXProperty name:
        - from 'busy' to 'roledescription': states which apply to every AX node
        - from 'live' to 'root': attributes which apply to nodes in live regions
        - from 'autocomplete' to 'valuetext': attributes which apply to widgets
        - from 'checked' to 'selected': states which apply to widgets
        - from 'activedescendant' to 'owns' - relationships between elements other than parent/child/sibling.
        '''""")
    actual = docstring(description)
    assert expected == actual


def test_escape_docstring():
    description = "Escape a `Backtick` and some `Backtick`s."
    expected = dedent("""\
        '''
        Escape a ``Backtick`` and some ``Backtick``'s.
        '''""")
    actual = docstring(description)
    assert expected == actual


def test_cdp_primitive_type():
    json_type = {"id": "AXNodeId", "description": "Unique accessibility node identifier.", "type": "string"}
    expected = dedent("""\
        class AXNodeId(str):
            '''
            Unique accessibility node identifier.
            '''
            def to_json(self) -> str:
                return self

            @classmethod
            def from_json(cls, json: str) -> AXNodeId:
                return cls(json)

            def __repr__(self):
                return 'AXNodeId({})'.format(super().__repr__())""")

    type = CdpType.from_json(json_type)
    actual = type.generate_code()
    assert expected == actual


def test_cdp_array_of_primitive_type():
    json_type = {
        "id": "ArrayOfStrings",
        "description": "Index of the string in the strings table.",
        "type": "array",
        "items": {"$ref": "StringIndex"},
    }
    expected = dedent("""\
        class ArrayOfStrings(list):
            '''
            Index of the string in the strings table.
            '''
            def to_json(self) -> typing.List[StringIndex]:
                return self

            @classmethod
            def from_json(cls, json: typing.List[StringIndex]) -> ArrayOfStrings:
                return cls(json)

            def __repr__(self):
                return 'ArrayOfStrings({})'.format(super().__repr__())""")

    type = CdpType.from_json(json_type)
    actual = type.generate_code()
    assert expected == actual


def test_cdp_enum_type():
    json_type = {
        "id": "AXValueSourceType",
        "description": "Enum of possible property sources.",
        "type": "string",
        "enum": ["attribute", "implicit", "style", "contents", "placeholder", "relatedElement"],
    }
    expected = dedent("""\
        class AXValueSourceType(enum.Enum):
            '''
            Enum of possible property sources.
            '''
            ATTRIBUTE = "attribute"
            IMPLICIT = "implicit"
            STYLE = "style"
            CONTENTS = "contents"
            PLACEHOLDER = "placeholder"
            RELATED_ELEMENT = "relatedElement"

            def to_json(self) -> str:
                return self.value

            @classmethod
            def from_json(cls, json: str) -> AXValueSourceType:
                return cls(json)""")

    type = CdpType.from_json(json_type)
    actual = type.generate_code()
    assert expected == actual


def test_cdp_class_type():
    json_type = {
        "id": "AXValue",
        "description": "A single computed AX property.",
        "type": "object",
        "properties": [
            {"name": "type", "description": "The type of this value.", "$ref": "AXValueType"},
            {"name": "value", "description": "The computed value of this property.", "optional": True, "type": "any"},
            {
                "name": "relatedNodes",
                "description": "One or more related nodes, if applicable.",
                "optional": True,
                "type": "array",
                "items": {"$ref": "AXRelatedNode"},
            },
            {
                "name": "sources",
                "description": "The sources which contributed to the computation of this property.",
                "optional": True,
                "type": "array",
                "items": {"$ref": "AXValueSource"},
            },
        ],
    }
    expected = dedent("""\
        @dataclass
        class AXValue:
            '''
            A single computed AX property.
            '''
            #: The type of this value.
            type_: AXValueType

            #: The computed value of this property.
            value: typing.Optional[typing.Any] = None

            #: One or more related nodes, if applicable.
            related_nodes: typing.Optional[typing.List[AXRelatedNode]] = None

            #: The sources which contributed to the computation of this property.
            sources: typing.Optional[typing.List[AXValueSource]] = None

            def to_json(self) -> T_JSON_DICT:
                json: T_JSON_DICT = dict()
                json['type'] = self.type_.to_json()
                if self.value is not None:
                    json['value'] = self.value
                if self.related_nodes is not None:
                    json['relatedNodes'] = [i.to_json() for i in self.related_nodes]
                if self.sources is not None:
                    json['sources'] = [i.to_json() for i in self.sources]
                return json

            @classmethod
            def from_json(cls, json: T_JSON_DICT) -> AXValue:
                return cls(
                    type_=AXValueType.from_json(json['type']),
                    value=json['value'] if 'value' in json else None,
                    related_nodes=[AXRelatedNode.from_json(i) for i in json['relatedNodes']] if 'relatedNodes' in json else None,
                    sources=[AXValueSource.from_json(i) for i in json['sources']] if 'sources' in json else None,
                )""")

    type = CdpType.from_json(json_type)
    actual = type.generate_code()
    assert expected == actual


def test_cdp_command():
    json_cmd = {
        "name": "getPartialAXTree",
        "description": "Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.",
        "experimental": True,
        "parameters": [
            {
                "name": "nodeId",
                "description": "Identifier of the node to get the partial accessibility tree for.",
                "optional": True,
                "$ref": "DOM.NodeId",
            },
            {
                "name": "backendNodeId",
                "description": "Identifier of the backend node to get the partial accessibility tree for.",
                "optional": True,
                "$ref": "DOM.BackendNodeId",
            },
            {
                "name": "objectId",
                "description": "JavaScript object id of the node wrapper to get the partial accessibility tree for.",
                "optional": True,
                "$ref": "Runtime.RemoteObjectId",
            },
            {
                "name": "fetchRelatives",
                "description": "Whether to fetch this nodes ancestors, siblings and children. Defaults to true.",
                "optional": True,
                "type": "boolean",
            },
        ],
        "returns": [
            {
                "name": "nodes",
                "description": "The `Accessibility.AXNode` for this DOM node, if it exists, plus its ancestors, siblings and\nchildren, if requested.",
                "type": "array",
                "items": {"$ref": "AXNode"},
            }
        ],
    }
    expected = dedent("""\
        def get_partial_ax_tree(
                node_id: typing.Optional[dom.NodeId] = None,
                backend_node_id: typing.Optional[dom.BackendNodeId] = None,
                object_id: typing.Optional[runtime.RemoteObjectId] = None,
                fetch_relatives: typing.Optional[bool] = None
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,typing.List[AXNode]]:
            '''
            Fetches the accessibility node and partial accessibility tree for this DOM node, if it exists.

            **EXPERIMENTAL**

            :param node_id: *(Optional)* Identifier of the node to get the partial accessibility tree for.
            :param backend_node_id: *(Optional)* Identifier of the backend node to get the partial accessibility tree for.
            :param object_id: *(Optional)* JavaScript object id of the node wrapper to get the partial accessibility tree for.
            :param fetch_relatives: *(Optional)* Whether to fetch this nodes ancestors, siblings and children. Defaults to true.
            :returns: The ``Accessibility.AXNode`` for this DOM node, if it exists, plus its ancestors, siblings and children, if requested.
            '''
            params: T_JSON_DICT = dict()
            if node_id is not None:
                params['nodeId'] = node_id.to_json()
            if backend_node_id is not None:
                params['backendNodeId'] = backend_node_id.to_json()
            if object_id is not None:
                params['objectId'] = object_id.to_json()
            if fetch_relatives is not None:
                params['fetchRelatives'] = fetch_relatives
            cmd_dict: T_JSON_DICT = {
                'method': 'Accessibility.getPartialAXTree',
                'params': params,
            }
            json = yield cmd_dict
            return [AXNode.from_json(i) for i in json['nodes']]""")

    cmd = CdpCommand.from_json(json_cmd, "Accessibility")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_no_params_or_returns():
    json_cmd = {"name": "disable", "description": "Disables the accessibility domain."}
    expected = dedent("""\
        def disable() -> typing.Generator[T_JSON_DICT,T_JSON_DICT,None]:
            '''
            Disables the accessibility domain.
            '''
            cmd_dict: T_JSON_DICT = {
                'method': 'Accessibility.disable',
            }
            json = yield cmd_dict""")

    cmd = CdpCommand.from_json(json_cmd, "Accessibility")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_return_primitive():
    json_cmd = {
        "name": "getCurrentTime",
        "description": "Returns the current time of the an animation.",
        "parameters": [{"name": "id", "description": "Id of animation.", "type": "string"}],
        "returns": [{"name": "currentTime", "description": "Current time of the page.", "type": "number"}],
    }
    expected = dedent("""\
        def get_current_time(
                id_: str
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,float]:
            '''
            Returns the current time of the an animation.

            :param id_: Id of animation.
            :returns: Current time of the page.
            '''
            params: T_JSON_DICT = dict()
            params['id'] = id_
            cmd_dict: T_JSON_DICT = {
                'method': 'Animation.getCurrentTime',
                'params': params,
            }
            json = yield cmd_dict
            return float(json['currentTime'])""")

    cmd = CdpCommand.from_json(json_cmd, "Animation")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_return_array_of_primitive():
    json_cmd = {
        "name": "getBrowserCommandLine",
        "description": "Returns the command line switches for the browser process if, and only if\n--enable-automation is on the commandline.",
        "experimental": True,
        "returns": [
            {"name": "arguments", "description": "Commandline parameters", "type": "array", "items": {"type": "string"}}
        ],
    }
    expected = dedent("""\
        def get_browser_command_line() -> typing.Generator[T_JSON_DICT,T_JSON_DICT,typing.List[str]]:
            '''
            Returns the command line switches for the browser process if, and only if
            --enable-automation is on the commandline.

            **EXPERIMENTAL**

            :returns: Commandline parameters
            '''
            cmd_dict: T_JSON_DICT = {
                'method': 'Browser.getBrowserCommandLine',
            }
            json = yield cmd_dict
            return [str(i) for i in json['arguments']]""")

    cmd = CdpCommand.from_json(json_cmd, "Browser")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_array_of_primitive_parameter():
    json_cmd = {
        "name": "releaseAnimations",
        "description": "Releases a set of animations to no longer be manipulated.",
        "parameters": [
            {
                "name": "animations",
                "description": "List of animation ids to seek.",
                "type": "array",
                "items": {"type": "string"},
            }
        ],
    }
    expected = dedent("""\
        def release_animations(
                animations: typing.List[str]
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,None]:
            '''
            Releases a set of animations to no longer be manipulated.

            :param animations: List of animation ids to seek.
            '''
            params: T_JSON_DICT = dict()
            params['animations'] = [i for i in animations]
            cmd_dict: T_JSON_DICT = {
                'method': 'Animation.releaseAnimations',
                'params': params,
            }
            json = yield cmd_dict""")

    cmd = CdpCommand.from_json(json_cmd, "Animation")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_ref_parameter():
    json_cmd = {
        "name": "resolveAnimation",
        "description": "Gets the remote object of the Animation.",
        "parameters": [{"name": "animationId", "description": "Animation id.", "type": "string"}],
        "returns": [
            {"name": "remoteObject", "description": "Corresponding remote object.", "$ref": "Runtime.RemoteObject"}
        ],
    }
    expected = dedent("""\
        def resolve_animation(
                animation_id: str
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,runtime.RemoteObject]:
            '''
            Gets the remote object of the Animation.

            :param animation_id: Animation id.
            :returns: Corresponding remote object.
            '''
            params: T_JSON_DICT = dict()
            params['animationId'] = animation_id
            cmd_dict: T_JSON_DICT = {
                'method': 'Animation.resolveAnimation',
                'params': params,
            }
            json = yield cmd_dict
            return runtime.RemoteObject.from_json(json['remoteObject'])""")

    cmd = CdpCommand.from_json(json_cmd, "Animation")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_multiple_return():
    json_cmd = {
        "name": "getEncodedResponse",
        "description": "Returns the response body and size if it were re-encoded with the specified settings. Only\napplies to images.",
        "parameters": [
            {
                "name": "requestId",
                "description": "Identifier of the network request to get content for.",
                "$ref": "Network.RequestId",
            },
            {
                "name": "encoding",
                "description": "The encoding to use.",
                "type": "string",
                "enum": ["webp", "jpeg", "png"],
            },
            {
                "name": "quality",
                "description": "The quality of the encoding (0-1). (defaults to 1)",
                "optional": True,
                "type": "number",
            },
            {
                "name": "sizeOnly",
                "description": "Whether to only return the size information (defaults to false).",
                "optional": True,
                "type": "boolean",
            },
        ],
        "returns": [
            {
                "name": "body",
                "description": "The encoded body as a base64 string. Omitted if sizeOnly is true.",
                "optional": True,
                "type": "string",
            },
            {"name": "originalSize", "description": "Size before re-encoding.", "type": "integer"},
            {"name": "encodedSize", "description": "Size after re-encoding.", "type": "integer"},
        ],
    }
    expected = dedent("""\
        def get_encoded_response(
                request_id: network.RequestId,
                encoding: str,
                quality: typing.Optional[float] = None,
                size_only: typing.Optional[bool] = None
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,typing.Tuple[typing.Optional[str], int, int]]:
            '''
            Returns the response body and size if it were re-encoded with the specified settings. Only
            applies to images.

            :param request_id: Identifier of the network request to get content for.
            :param encoding: The encoding to use.
            :param quality: *(Optional)* The quality of the encoding (0-1). (defaults to 1)
            :param size_only: *(Optional)* Whether to only return the size information (defaults to false).
            :returns: A tuple with the following items:

                0. **body** - *(Optional)* The encoded body as a base64 string. Omitted if sizeOnly is true.
                1. **originalSize** - Size before re-encoding.
                2. **encodedSize** - Size after re-encoding.
            '''
            params: T_JSON_DICT = dict()
            params['requestId'] = request_id.to_json()
            params['encoding'] = encoding
            if quality is not None:
                params['quality'] = quality
            if size_only is not None:
                params['sizeOnly'] = size_only
            cmd_dict: T_JSON_DICT = {
                'method': 'Audits.getEncodedResponse',
                'params': params,
            }
            json = yield cmd_dict
            return (
                str(json['body']) if 'body' in json else None,
                int(json['originalSize']),
                int(json['encodedSize'])
            )""")

    cmd = CdpCommand.from_json(json_cmd, "Audits")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_command_array_of_ref_parameter():
    json_cmd = {
        "name": "grantPermissions",
        "description": "Grant specific permissions to the given origin and reject all others.",
        "experimental": True,
        "parameters": [
            {"name": "origin", "type": "string"},
            {"name": "permissions", "type": "array", "items": {"$ref": "PermissionType"}},
            {
                "name": "browserContextId",
                "description": "BrowserContext to override permissions. When omitted, default browser context is used.",
                "optional": True,
                "$ref": "Target.BrowserContextID",
            },
        ],
    }
    expected = dedent("""\
        def grant_permissions(
                origin: str,
                permissions: typing.List[PermissionType],
                browser_context_id: typing.Optional[target.BrowserContextID] = None
            ) -> typing.Generator[T_JSON_DICT,T_JSON_DICT,None]:
            '''
            Grant specific permissions to the given origin and reject all others.

            **EXPERIMENTAL**

            :param origin:
            :param permissions:
            :param browser_context_id: *(Optional)* BrowserContext to override permissions. When omitted, default browser context is used.
            '''
            params: T_JSON_DICT = dict()
            params['origin'] = origin
            params['permissions'] = [i.to_json() for i in permissions]
            if browser_context_id is not None:
                params['browserContextId'] = browser_context_id.to_json()
            cmd_dict: T_JSON_DICT = {
                'method': 'Browser.grantPermissions',
                'params': params,
            }
            json = yield cmd_dict""")

    cmd = CdpCommand.from_json(json_cmd, "Browser")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_event():
    json_event = {
        "name": "recordingStateChanged",
        "description": "Called when the recording state for the service has been updated.",
        "parameters": [{"name": "isRecording", "type": "boolean"}, {"name": "service", "$ref": "ServiceName"}],
    }
    expected = dedent("""\
        @event_class('BackgroundService.recordingStateChanged')
        @dataclass
        class RecordingStateChanged:
            '''
            Called when the recording state for the service has been updated.
            '''
            is_recording: bool
            service: ServiceName

            @classmethod
            def from_json(cls, json: T_JSON_DICT) -> RecordingStateChanged:
                return cls(
                    is_recording=bool(json['isRecording']),
                    service=ServiceName.from_json(json['service'])
                )""")

    cmd = CdpEvent.from_json(json_event, "BackgroundService")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_event_parameter_docs():
    json_event = {
        "name": "windowOpen",
        "description": "Fired when a new window is going to be opened, via window.open(), link click, form submission,\netc.",
        "parameters": [
            {"name": "url", "description": "The URL for the new window.", "type": "string"},
            {"name": "windowName", "description": "Window name.", "type": "string"},
            {
                "name": "windowFeatures",
                "description": "An array of enabled window features.",
                "type": "array",
                "items": {"type": "string"},
            },
            {
                "name": "userGesture",
                "description": "Whether or not it was triggered by user gesture.",
                "type": "boolean",
            },
        ],
    }
    expected = dedent("""\
        @event_class('Page.windowOpen')
        @dataclass
        class WindowOpen:
            '''
            Fired when a new window is going to be opened, via window.open(), link click, form submission,
            etc.
            '''
            #: The URL for the new window.
            url: str
            #: Window name.
            window_name: str
            #: An array of enabled window features.
            window_features: typing.List[str]
            #: Whether or not it was triggered by user gesture.
            user_gesture: bool

            @classmethod
            def from_json(cls, json: T_JSON_DICT) -> WindowOpen:
                return cls(
                    url=str(json['url']),
                    window_name=str(json['windowName']),
                    window_features=[str(i) for i in json['windowFeatures']],
                    user_gesture=bool(json['userGesture'])
                )""")

    cmd = CdpEvent.from_json(json_event, "Page")
    actual = cmd.generate_code()
    assert expected == actual


def test_cdp_domain_imports():
    """This is a made-up domain in order to keep the test short."""
    json_domain = {
        "domain": "Car",
        "dependencies": [
            "WindTunnel",
        ],
        "types": [
            {
                "id": "Wheels",
                "type": "array",
                "items": {"$ref": "Vehicle.Wheel"},
            },
            {
                "id": "Engine",
                "type": "object",
                "properties": [
                    {"name": "block", "$ref": "Engine.EngineBlock"},
                    {
                        "name": "pistons",
                        "type": "array",
                        "items": {"$ref": "EngineParts.Piston"},
                    },
                ],
            },
        ],
        "commands": [
            {
                "name": "unlockDoor",
                "parameters": [
                    {
                        "name": "door",
                        "description": "The door to unlock.",
                        "$ref": "Door.Door",
                    },
                ],
                "returns": [
                    {
                        "name": "status",
                        "description": "The updated lock state for the door.",
                        "$ref": "Lock.LockState",
                    }
                ],
            },
            {
                "name": "rollDownWindows",
                "parameters": [
                    {
                        "name": "windows",
                        "description": "The windows to roll down.",
                        "type": "array",
                        "items": {"$ref": "Window.Window"},
                    },
                ],
                "returns": [
                    {
                        "name": "status",
                        "description": "The updated position for each window.",
                        "type": "array",
                        "items": {"$ref": "WindowState.WindowPosition"},
                    }
                ],
            },
        ],
        "events": [
            {
                "name": "carStarted",
                "description": "The car has been started.",
                "parameters": [
                    {
                        "name": "driver",
                        "description": "The driver that started the car.",
                        "items": {"$ref": "Driver.Driver"},
                    },
                    {
                        "name": "passengers",
                        "description": "The passengers in the car.",
                        "type": "array",
                        "items": {"$ref": "passenger.Passenger"},
                    },
                ],
            }
        ],
    }
    expected = dedent("""\
        from . import door
        from . import driver
        from . import engine
        from . import engine_parts
        from . import lock
        from . import passenger
        from . import vehicle
        from . import window
        from . import window_state""")  # A domain should have a new line at the end.

    domain = CdpDomain.from_json(json_domain)
    actual = domain.generate_imports()
    assert expected == actual


def test_domain_shadows_builtin():
    """If a domain name shadows a Python builtin, it should have an underscore appended to the module name."""
    input_domain = {
        "domain": "Input",
        "types": [],
        "commands": [],
        "events": [],
    }
    domain = CdpDomain.from_json(input_domain)
    assert domain.module == "input_"


def test_cdp_domain_sphinx():
    json_domain = {
        "domain": "Animation",
        "description": "This is the animation domain.",
        "experimental": True,
        "dependencies": ["Runtime", "DOM"],
        "types": [
            {
                "id": "KeyframeStyle",
                "description": "Keyframe Style",
                "type": "object",
                "properties": [
                    {"name": "offset", "description": "Keyframe's time offset.", "type": "string"},
                    {"name": "easing", "description": "`AnimationEffect`'s timing function.", "type": "string"},
                ],
            }
        ],
        "commands": [
            {
                "name": "getCurrentTime",
                "description": "Returns the current time of the an animation.",
                "parameters": [{"name": "id", "description": "Id of animation.", "type": "string"}],
                "returns": [{"name": "currentTime", "description": "Current time of the page.", "type": "number"}],
            },
        ],
        "events": [
            {
                "name": "animationCanceled",
                "description": "Event for when an animation has been cancelled.",
                "parameters": [
                    {"name": "id", "description": "Id of the animation that was cancelled.", "type": "string"}
                ],
            },
        ],
    }
    """ A CDP domain should generate Sphinx documentation. """
    expected = dedent("""\
        Animation
        =========

        This is the animation domain.

        *This CDP domain is experimental.*

        .. module:: cdp.animation

        * Types_
        * Commands_
        * Events_

        Types
        -----

        Generally, you do not need to instantiate CDP types
        yourself. Instead, the API creates objects for you as return
        values from commands, and then you can use those objects as
        arguments to other commands.

        .. autoclass:: KeyframeStyle
              :members:
              :undoc-members:
              :exclude-members: from_json, to_json

        Commands
        --------

        Each command is a generator function. The return
        type ``Generator[x, y, z]`` indicates that the generator
        *yields* arguments of type ``x``, it must be resumed with
        an argument of type ``y``, and it returns type ``z``. In
        this library, types ``x`` and ``y`` are the same for all
        commands, and ``z`` is the return type you should pay attention
        to. For more information, see
        :ref:`Getting Started: Commands <getting-started-commands>`.

        .. autofunction:: get_current_time

        Events
        ------

        Generally, you do not need to instantiate CDP events
        yourself. Instead, the API creates events for you and then
        you use the event's attributes.

        .. autoclass:: AnimationCanceled
              :members:
              :undoc-members:
              :exclude-members: from_json, to_json
    """)
    domain = CdpDomain.from_json(json_domain)
    actual = domain.generate_sphinx()
    assert expected == actual
