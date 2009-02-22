import simplejson
from webdriver_common.exceptions import *


def format_json(json_struct):
    return simplejson.dumps(json_struct, indent=4)

def handle_find_element_exception(e):
    if ("Unable to find" in e.response["value"]["message"] or
        "Unable to locate" in e.response["value"]["message"]):
        raise NoSuchElementException("Unable to locate element:")
    else:
        raise e

def return_value_if_exists(resp):
    if resp and "value" in resp:
        return resp["value"]
