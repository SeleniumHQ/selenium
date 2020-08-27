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

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

# TODO: Add more tests later

def test_turtle_with_simple_script(driver):
    driver.load_brython(timeout=5)
    turtle_script = """
    # Adapted from https://brython.info/gallery/turtle.html
    from browser import document, html
    import turtle
    if 'turtle-div' not in document:
        document <= html.DIV(Id='turtle-div', style={'float':'left', 'border': '1px solid green'})
    turtle.set_defaults(
        turtle_canvas_wrapper = document['turtle-div']
    )
    t = turtle.Turtle()

    t.width(5)

    for c in ['red', '#00ff00', '#fa0', 'rgb(0,0,200)']:
        t.color(c)
        t.forward(100)
        t.left(90)

    # dot() and write() do not require the pen to be down
    t.penup()
    t.goto(-30, -100)
    t.dot(40, 'rgba(255, 0, 0, 0.5')
    t.goto(30, -100)
    t.dot(40, 'rgba(0, 255, 0, 0.5')
    t.goto(0, -70)
    t.dot(40, 'rgba(0, 0, 255, 0.5')

    t.goto(0, 125)
    t.color('purple')
    t.write("I love Brython!", font=("Arial", 20, "normal"))


    turtle.done()
    """
    driver.execute_brython(turtle_script)

    WebDriverWait(driver, 12).until(EC.presence_of_element_located((By.ID, 'turtle-div')))
