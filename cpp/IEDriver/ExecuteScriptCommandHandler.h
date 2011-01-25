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

			ScriptWrapper *script_wrapper = new ScriptWrapper(browser_wrapper, script, json_args.size());
			status_code = this->PopulateArgumentArray(manager, script_wrapper, json_args);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Error setting arguments for script");
				return;
			}

			status_code = script_wrapper->Execute();

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
};

} // namespace webdriver

#endif // WEBDRIVER_IE_EXECUTESCRIPTCOMMANDHANDLER_H_
