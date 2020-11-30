# Licensed to the Software Freedom Conservancy (SFC) under one
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

    def __init__(self):
        self.orientation_values = ['portrait', 'landscape']
        self._print_options = {}
        self._page = {}
        self._margin = {}

    @property
    def to_dict(self):
        """
        :Returns: A hash of print options configured
        """
        return self._print_options

    def set_orientation(self, value):
        if value not in self.orientation_values:
            raise ValueError('Orientation value must be one of ' + str(self.orientation_values))

        self._print_options['orientation'] = value

    def get_orientation(self):
        return self._print_options.get('orientation', None)

    def set_scale(self, value):
        if not isinstance(value, int) and not isinstance(value, float):
            raise ValueError('Scale value should either be an integer or float')

        if value < 0.1 or value > 2:
            raise ValueError('Scale value should be between 0.1 and 2')

        self._print_options['scale'] = value

    def get_scale(self):
        return self._print_options.get('scale', None)

    def set_background(self, value):
        if not isinstance(value, bool):
            raise ValueError('Set background value should be a boolean')
        self._print_options['background'] = value

    def get_background(self):
        return self._print_options.get('background', None)

    def set_width(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Width should be an integer or a float')

        if value < 0:
            raise ValueError('Width cannot be less then 0')

        self._page['width'] = value
        self._print_options['page'] = self._page

    def get_width(self):
        return self._page.get('width', None)

    def set_height(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Height should be an integer or a float')

        if value < 0:
            raise ValueError('Height cannot be less then 0')

        self._page['height'] = value
        self._print_options['page'] = self._page

    def get_height(self):
        return self._page.get('height', None)

    def set_top(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Margin top should be an integer or a float')

        if value < 0:
            raise ValueError('Margin top cannot be less then 0')

        self._margin['top'] = value
        self._print_options['margin'] = self._margin

    def get_top(self):
        return  self._margin.get('top', None)

    def set_left(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Margin left should be an integer or a float')

        if value < 0:
            raise ValueError('Margin left cannot be less then 0')

        self._margin['left'] = value
        self._print_options['margin'] = self._margin

    def get_left(self):
        return self._margin.get('left', None)

    def set_bottom(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Margin bottom should be an integer or a float')

        if value < 0:
            raise ValueError('Margin bottom cannot be less then 0')

        self._margin['bottom'] = value
        self._print_options['margin'] = self._margin

    def get_botton(self):
        return self._margin.get('bottom', None)

    def set_right(self, value):
        if not isinstance(value, float) and not isinstance(value, int):
            raise ValueError('Margin right should be an integer or a float')

        if value < 0:
            raise ValueError('Margin right cannot be less then 0')

        self._margin['right'] = value
        self._print_options['margin'] = self._margin

    def get_right(self):
        return self._margin.get('right', None)

    def set_shrink_to_fit(self, value):
        if not isinstance(value, bool):
            raise ValueError('Set shrink to fit value should be a boolean')
        self._print_options['shrinkToFit'] = value

    def get_shrink_to_fit(self):
        return self._print_options.get('shrinkToFit', None)

    def set_page_ranges(self, value):
        if not isinstance(value, list):
            raise ValueError('Page ranges should be a list')
        self._print_options['pageRanges'] = value

    def get_page_ranges(self):
        return self._print_options.get('pageRanges', None)
