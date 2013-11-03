# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
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

"""
The Desired Capabilities implementation.
"""

class DesiredCapabilities(object):
    """
    Set of supported desired capabilities.
    """

    FIREFOX = {
        "browserName": "firefox",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    INTERNETEXPLORER = {
        "browserName": "internet explorer",
        "version": "",
        "platform": "WINDOWS",
        "javascriptEnabled": True,
    }

    CHROME = {
        "browserName": "chrome",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    OPERA = {
        "browserName": "opera",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    SAFARI = {
        "browserName": "safari",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    HTMLUNIT = {
        "browserName": "htmlunit",
        "version": "",
        "platform": "ANY",
    }

    HTMLUNITWITHJS = {
        "browserName": "htmlunit",
        "version": "firefox",
        "platform": "ANY",
        "javascriptEnabled": True,
    }

    IPHONE = {
        "browserName": "iPhone",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    IPAD = {
        "browserName": "iPad",
        "version": "",
        "platform": "MAC",
        "javascriptEnabled": True,
    }

    ANDROID = {
        "browserName": "android",
        "version": "",
        "platform": "ANDROID",
        "javascriptEnabled": True,
    }
    
    PHANTOMJS = {
        "browserName":"phantomjs",
        "version": "",
        "platform": "ANY",
        "javascriptEnabled": True,
    }


class AllowDesiredCapabilitesOverrides(object):
    '''This is a decorator class intended to decorate the __init__ method for
    all webdrivers.  It allows the caller to override any argument in the init
    method with similarly named key in desired_capabilities.  This way
    desired_capabilities can be used as a standard way to completely setup 
    / configure a webdriver instance.
    '''
   
    def __init__(self, constructors={}):
        '''handle keyword arguments for the decorator.  Currently we support
        constructors which is a dictionary of argument_names -> callable.  Then
        if the argument_name is found in the desired capabilities dictionary
        the callable will be called and passed in the value of
        desired_capabilities['argument_name'].  This allows for complex object
        to be instantiated from passed in parameters in the
        desired_capabilities
        '''

        self.constructors = constructors

    def _get_list_of_function_arguments(self, f):
        from inspect import getargspec
        return getargspec(f)[0][1:]

    def _get_desired_capabilities_index(self,arg_list):
        return arg_list.index("desired_capabilities")

    def __call__ (self, f):
        '''The decorator main entry point.
        Stores the various argument names for the function we are
        decorating removing the self argument.
        '''
        decorated_func_args = self._get_list_of_function_arguments(f)
        caps_arg_index = self._get_desired_capabilities_index(decorated_func_args)

        def wrap(init_self, *args, **kwargs):
            #find desired_capabilities
            if caps_arg_index < len(args):
                caps = args[caps_arg_index]
            else:
                caps = kwargs.get("desired_capabilities") 

            if caps:
                for count, val in enumerate(decorated_func_args):
                    if caps.has_key(val):
                        #we shouldn't overwrite parameters if they have
                        #allready been passed in
                        if kwargs.get(val):
                            raise TypeError(f.__name__ + " got multiple values"
                                            " for keyword " + val)
                        #check for custom constructors
                        constructor = self.constructors.get(val)
                        if constructor:
                            args = caps.pop(val)
                            if isinstance(args, (list, tuple)):
                                kwargs[val] = constructor(*args)
                            else:
                                kwargs[val] = constructor(**args)
                        else:
                            kwargs[val] = caps.pop(val)
            f(init_self, *args, **kwargs)


        #make the decorate play nice
        wrap.__doc__ = f.__doc__
        wrap.__name__ = f.__name__
        wrap.__dict__.update(f.__dict__)

        return wrap
