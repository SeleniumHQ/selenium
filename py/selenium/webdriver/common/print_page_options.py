# Licensed to the Software Freedom Conservancy(SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.


class PrintOptions():
    ORIENTATION_VALUES = ['portrait', 'landscape']

    def __init__(self):
        self._print_options = {}
        self._page = {}
        self._margin = {}

    def to_dict(self):
        """
        :Returns: A hash of print options configured
        """
        return self._print_options

    @property
    def orientation(self):
        """
        :Returns: Orientation that was set for the page
        """
        return self._print_options.get('orientation', None)

    @orientation.setter
    def orientation(self, value):
        """
        Allows you to set orientation of the page
        :Args:
         - value: Either portrait or landscape
        """
        if value not in self.ORIENTATION_VALUES:
            raise ValueError(f'Orientation value must be one of {self.ORIENTATION_VALUES}')

        self._print_options['orientation'] = value

    @property
    def scale(self):
        """
        :Returns: Scale that was set for the page
        """
        return self._print_options.get('scale', None)

    @scale.setter
    def scale(self, value):
        """
        Allows you to to set scale for the page
        :Args:
         - value: integer or float between 0.1 and 2
        """
        self.__validate_num_property('Scale', value)

        if value < 0.1 or value > 2:
            raise ValueError('Scale value should be between 0.1 and 2')

        self._print_options['scale'] = value

    @property
    def background(self):
        """
        :Returns: Background value that was set
        """
        return self._print_options.get('background', None)

    @background.setter
    def background(self, value):
        """
        Allows you to set the boolean value for the background
        :Args:
         - value: Boolean
        """
        if not isinstance(value, bool):
            raise ValueError('Set background value should be a boolean')
        self._print_options['background'] = value

    @property
    def page_width(self):
        """
        :Returns: Page width that was set
        """
        return self._page.get('width', None)

    @page_width.setter
    def page_width(self, value):
        """
        Allows you to set width of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Page Width', value)

        self._page['width'] = value
        self._print_options['page'] = self._page

    @property
    def page_height(self):
        """
        :Returns: Page height that was set
        """
        return self._page.get('height', None)

    @page_height.setter
    def page_height(self, value):
        """
        Allows you to set height of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Page Height', value)

        self._page['height'] = value
        self._print_options['page'] = self._page

    @property
    def margin_top(self):
        """
        :Returns: Top margin of the page
        """
        return self._margin.get('top', None)

    @margin_top.setter
    def margin_top(self, value):
        """
        Allows you to set top margin of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Margin top', value)

        self._margin['top'] = value
        self._print_options['margin'] = self._margin

    @property
    def margin_left(self):
        """
        :Returns: Left margin of the page
        """
        return self._margin.get('left', None)

    @margin_left.setter
    def margin_left(self, value):
        """
        Allows you to set left margin of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Margin left', value)

        self._margin['left'] = value
        self._print_options['margin'] = self._margin

    @property
    def margin_bottom(self):
        """
        :Returns: Bottom margin of the page
        """
        return self._margin.get('bottom', None)

    @margin_bottom.setter
    def margin_bottom(self, value):
        """
        Allows you to set bottom margin of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Margin bottom', value)

        self._margin['bottom'] = value
        self._print_options['margin'] = self._margin

    @property
    def margin_right(self):
        """
        :Returns: Right margin of the page
        """
        return self._margin.get('right', None)

    @margin_right.setter
    def margin_right(self, value):
        """
        Allows you to set right margin of the page
        :Args:
         - value: A positive integer or float
        """
        self.__validate_num_property('Margin right', value)

        self._margin['right'] = value
        self._print_options['margin'] = self._margin

    @property
    def shrink_to_fit(self):
        """
        :Returns: Value set for shrinkToFit
        """
        return self._print_options.get('shrinkToFit', None)

    @shrink_to_fit.setter
    def shrink_to_fit(self, value):
        """
        Allows you to set shrinkToFit
        :Args:
         - value: Boolean
        """
        if not isinstance(value, bool):
            raise ValueError('Set shrink to fit value should be a boolean')
        self._print_options['shrinkToFit'] = value

    @property
    def page_ranges(self):
        """
        :Returns: value set for pageRanges
        """
        return self._print_options.get('pageRanges', None)

    @page_ranges.setter
    def page_ranges(self, value):
        """
        Allows you to set pageRanges for the print command
        :Args:
         - value: A list of page ranges. Eg: ['1-2']
        """
        if not isinstance(value, list):
            raise ValueError('Page ranges should be a list')
        self._print_options['pageRanges'] = value

    def __validate_num_property(self, property_name, value):
        """
        Helper function to validate some of the properties
        """
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError(f'{property_name} should be an integer or a float')

        if value < 0:
            raise ValueError(f'{property_name} cannot be less then 0')
