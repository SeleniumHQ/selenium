#ifndef WEBDRIVER_JAVASCRIPT_COMMANDS_H_
#define WEBDRIVER_JAVASCRIPT_COMMANDS_H_

#include <string>

namespace webdriver {

//String params are assumed to be sanitised such that they
//contain no un-escaped ' characters

/**
 * Expect:
 * %s: JSON string containing an array of the capabilities desired
 *     from the session
 */
const char *kCreateSessionCommand = "create_session('%s');";

/**
 * Expect:
 * %s: JSON string containing an array containing the url string to get
 * %u: Session ID
 * %s: A generated UUID
 */
const char *kGetUrlCommand = "get_url('%s', %u, '%s');";

const char *kGetTitleCommand = "get_title();";

/**
 * Expect:
 * %s: JSON string containing an array containing the By to use and its value
 */
const char *kGetElementCommand = "get_element(false, '%s');";

/**
 * Expect:
 * %s: JSON string containing an array containing the By to use and its value
 */
const char *kGetElementsCommand = "get_element(true, '%s');";

/**
 * Expect:
 * %s: JSON string containing an array containing the parent node's ID,
 * the By to use and its value
 */
const char *kGetChildElementCommand = "get_element(false, '%s');";

/**
 * Expect:
 * %s: JSON string containing an array containing the parent node's ID,
 * the By to use and its value
 */
const char *kGetChildrenElementCommand = "get_element(true, '%s');";

/**
 * Expect:
 * %s: JSON string containing an object with an id and an array containing
 *     a value string
 */
const char *kSendElementKeysCommand = "send_element_keys('%s');";

/**
 * Expect:
 * %s: JSON string containing an object with an id to clear
 */
const char *kClearElementCommand = "clear_element('%s');";

/**
 * Expect:
 * %s: JSON string containing an object with an id to clear
 */
const char *kClickElementCommand = "click_element('%s');";

/**
 * Expect:
 * %u: Element ID
 * %s: Desired attribute
 */
const char *kGetElementAttribute = "get_element_attribute(%u, '%s');";

/**
 * Expect:
 * %u: Element ID
 */
const char *kGetElementText = "get_element_text(%u);";

/**
 * Expect:
 * %u: Element ID
 */
const char *kIsElementSelected = "is_element_selected(%u);";

/**
 * Expect:
 * %s: JSON array containing an object which identifies the window
 */
const char *kSwitchWindow = "switch_window('%s');";

/**
 * Expect:
 * %s: JSON string containing an object with an id to clear
 */
const char *kSubmitElementCommand = "submit_element('%s');";

} //namespace webdriver

#endif //WEBDRIVER_JAVASCRIPT_COMMANDS_H_