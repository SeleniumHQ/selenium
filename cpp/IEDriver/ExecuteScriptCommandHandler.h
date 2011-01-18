#ifndef WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_

#include "BrowserManager.h"

namespace webdriver {

class ExecuteScriptCommandHandler : public WebDriverCommandHandler {
public:
	ExecuteScriptCommandHandler(void) {
	}

	virtual ~ExecuteScriptCommandHandler(void) {
	}

protected:
	virtual void ExecuteScriptCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("script") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: script");
			return;
		} else if (command_parameters.find("args") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: args");
			return;
		} else {
			std::wstring script_body(CA2W(command_parameters["script"].asString().c_str(), CP_UTF8));
			const std::wstring script = L"(function() { return function(){" + script_body + L"};})();";

			Json::Value json_args(command_parameters["args"]);

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			ScriptWrapper *script_wrapper = new ScriptWrapper(script, json_args.size());
			status_code = this->PopulateArgumentArray(manager, script_wrapper, json_args);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Error setting arguments for script");
				return;
			}

			status_code = browser_wrapper->ExecuteScript(script_wrapper);

			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "JavaScript error");
				return;
			} else {
				Json::Value script_result;
				script_wrapper->ConvertResultToJsonValue(manager, &script_result);
				response->SetResponse(SUCCESS, script_result);
				delete script_wrapper;
				return;
			}
		}
	}

	int ExecuteScriptCommandHandler::PopulateArgumentArray(BrowserManager *manager, ScriptWrapper *script_wrapper, Json::Value json_args) {
		int status_code = SUCCESS;
		for (UINT arg_index = 0; arg_index < json_args.size(); ++arg_index) {
			LONG index = (LONG)arg_index;
			Json::Value arg = json_args[arg_index];
			if (arg.isString()) {
				std::wstring value(CA2W(arg.asString().c_str(), CP_UTF8));
				script_wrapper->AddArgument(value);
			} else if (arg.isInt()) {
				int int_number(arg.asInt());
				script_wrapper->AddArgument(int_number);
			} else if (arg.isDouble()) {
				double dbl_number(arg.asDouble());
				script_wrapper->AddArgument(dbl_number);
			} else if (arg.isBool()) {
				bool bool_arg(arg.asBool());
				script_wrapper->AddArgument(bool_arg);
			} else if (arg.isObject() && arg.isMember("ELEMENT")) {
				std::wstring element_id(CA2W(arg["ELEMENT"].asString().c_str(), CP_UTF8));

				ElementWrapper *element_wrapper;
				status_code = this->GetElement(manager, element_id, &element_wrapper);
				if (status_code != SUCCESS) {
					break;
				}
				script_wrapper->AddArgument(element_wrapper);
			}
		}

		return status_code;
	}
//
//	int ExecuteScriptCommandHandler::ConvertScriptResult(ScriptWrapper *script_wrapper, BrowserManager *manager, Json::Value *value) {
//		int status_code = SUCCESS;
//		CComVariant result(script_wrapper->result());
//		if (script_wrapper->ResultIsString()) { 
//			std::string string_value;
//			string_value = CW2A(script_wrapper->result().bstrVal, CP_UTF8);
//			*value = string_value;
//		} else if (script_wrapper->ResultIsInteger()) {
//			*value = script_wrapper->result().lVal;
//		} else if (script_wrapper->ResultIsDouble()) {
//			*value = script_wrapper->result().dblVal;
//		} else if (script_wrapper->ResultIsBoolean()) {
//			*value = script_wrapper->result().boolVal == VARIANT_TRUE;
//		} else if (script_wrapper->ResultIsEmpty()) {
//			*value = Json::Value::null;
//		} else if (script_wrapper->ResultIsIDispatch()) {
//			if (script_wrapper->ResultIsArray() || script_wrapper->ResultIsElementCollection()) {
//				BrowserWrapper *browser_wrapper;
//				manager->GetCurrentBrowser(&browser_wrapper);
//				Json::Value result_array(Json::arrayValue);
//
//				long length = 0;
//				this->GetArrayLength(script_wrapper, browser_wrapper, &length);
//
//				for (long i = 0; i < length; ++i) {
//					Json::Value array_item_result;
//					int array_item_status = this->GetArrayItem(script_wrapper, browser_wrapper, manager, i, &array_item_result);
//					result_array[i] = array_item_result;
//				}
//				*value = result_array;
//			} else {
//				IHTMLElement *node = (IHTMLElement*) script_wrapper->result().pdispVal;
//				ElementWrapper *element_wrapper;
//				manager->AddManagedElement(node, &element_wrapper);
//				*value = element_wrapper->ConvertToJson();
//			}
//		} else {
//			status_code = EUNKNOWNSCRIPTRESULT;
//		}
//		return status_code;
//	}
//
//private:
//	int ExecuteScriptCommandHandler::GetArrayLength(ScriptWrapper *array_script_wrapper, BrowserWrapper *browser_wrapper, long *length) {
//		// Prepare an array for the Javascript execution, containing only one
//		// element - the original returned array from a JS execution.
//		std::wstring get_length_script(L"(function(){return function() {return arguments[0].length;}})();");
//		ScriptWrapper *get_length_script_wrapper = new ScriptWrapper(get_length_script, 1);
//		get_length_script_wrapper->AddArgument(array_script_wrapper->result());
//		int length_result = browser_wrapper->ExecuteScript(get_length_script_wrapper);
//
//		if (length_result != SUCCESS) {
//			return length_result;
//		}
//
//		// Expect the return type to be an integer. A non-integer means this was
//		// not an array after all.
//		if (!get_length_script_wrapper->ResultIsInteger()) {
//			return EUNEXPECTEDJSERROR;
//		}
//
//		*length = get_length_script_wrapper->result().lVal;
//		delete get_length_script_wrapper;
//		return SUCCESS;
//	}
//
//	int ExecuteScriptCommandHandler::GetArrayItem(ScriptWrapper *array_script_wrapper, BrowserWrapper *browser_wrapper, BrowserManager *manager, long index, Json::Value *item){
//		std::wstring get_array_item_script(L"(function(){return function() {return arguments[0][arguments[1]];}})();"); 
//		ScriptWrapper *get_array_item_script_wrapper = new ScriptWrapper(get_array_item_script, 2);
//		get_array_item_script_wrapper->AddArgument(array_script_wrapper->result());
//		get_array_item_script_wrapper->AddArgument(index);
//		int get_item_result = browser_wrapper->ExecuteScript(get_array_item_script_wrapper);
//		if (get_item_result != SUCCESS) {
//			return get_item_result;
//		}
//
//		Json::Value array_item_result;
//		int array_item_status = this->ConvertScriptResult(get_array_item_script_wrapper, manager, item);
//		delete get_array_item_script_wrapper;
//		return SUCCESS;
//	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_
