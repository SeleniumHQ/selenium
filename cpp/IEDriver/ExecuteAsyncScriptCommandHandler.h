#ifndef WEBDRIVER_IE_EXECUTEASYNCSCRIPTCOMMANDHANDLER_H_
#define WEBDRIVER_IE_EXECUTEASYNCSCRIPTCOMMANDHANDLER_H_

#include "BrowserManager.h"
#include "ExecuteScriptCommandHandler.h"

#define GUID_STRING_LEN 40

namespace webdriver {

class ExecuteAsyncScriptCommandHandler : public ExecuteScriptCommandHandler {
public:
	ExecuteAsyncScriptCommandHandler(void) {
	}

	virtual ~ExecuteAsyncScriptCommandHandler(void) {
	}

protected:
	void ExecuteAsyncScriptCommandHandler::ExecuteInternal(BrowserManager *manager, std::map<std::string, std::string> locator_parameters, std::map<std::string, Json::Value> command_parameters, WebDriverResponse * response) {
		if (command_parameters.find("script") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: script");
			return;
		} else if (command_parameters.find("args") == command_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter: args");
			return;
		} else {
			wchar_t page_id_buffer[GUID_STRING_LEN] = {0};
			GUID page_id_guid;
			::CoCreateGuid(&page_id_guid);
			::StringFromGUID2(page_id_guid, page_id_buffer, GUID_STRING_LEN);
			std::wstring page_id = &page_id_buffer[0];

			wchar_t pending_id_buffer[GUID_STRING_LEN] = {0};
			GUID pending_id_guid;
			::CoCreateGuid(&pending_id_guid);
			::StringFromGUID2(pending_id_guid, pending_id_buffer, GUID_STRING_LEN);
			std::wstring pending_id = &pending_id_buffer[0];

			Json::Value json_args(command_parameters["args"]);

			int timeout_value = manager->async_script_timeout();
			wchar_t timeout_buffer[12] = {0};
			_itow_s(timeout_value, &timeout_buffer[0], 12, 10);
			std::wstring timeout = &timeout_buffer[0];

			std::wstring script_body(CA2W(command_parameters["script"].asString().c_str(), CP_UTF8));

			std::wstring async_script = L"(function() { return function(){\n";
			async_script += L"document.__$webdriverPageId = '" + page_id + L"';\n";
			async_script += L"var timeoutId = window.setTimeout(function() {\n";
			async_script += L"  window.setTimeout(function() {\n";
			async_script += L"    document.__$webdriverAsyncTimeout = 1;\n";
			async_script += L"  }, 0);\n";
			async_script += L"}," + timeout + L");\n";
			async_script += L"document.__$webdriverAsyncTimeout = 0;\n";
			async_script += L"var callback = function(value) {\n";
			async_script += L"  document.__$webdriverAsyncTimeout = 0;\n";
			async_script += L"  document.__$webdriverAsyncScriptResult = value;\n";
			async_script += L"  window.clearTimeout(timeoutId);\n";
			async_script += L"};\n";
			async_script += L"var argsArray = Array.prototype.slice.call(arguments);\n";
			async_script += L"argsArray.push(callback);\n";
			async_script += L"if (document.__$webdriverAsyncScriptResult !== undefined) {\n";
			async_script += L"  delete document.__$webdriverAsyncScriptResult;\n";
			async_script += L"}\n";
			async_script += L"(function() {" + script_body + L"}).apply(null, argsArray);\n";
			async_script += L"};})();";

			std::wstring polling_script = L"(function() { return function(){\n";
			polling_script += L"var pendingId = '" + pending_id + L"';\n";
			polling_script += L"if (document.__$webdriverPageId != '" + page_id + L"') {\n";
			polling_script += L"  return [pendingId, -1];\n";
			polling_script += L"} else if ('__$webdriverAsyncScriptResult' in document) {\n";
			polling_script += L"  var value = document.__$webdriverAsyncScriptResult;\n";
			polling_script += L"  delete document.__$webdriverAsyncScriptResult;\n";
			polling_script += L"  return value;\n";
			polling_script += L"} else {\n";
			polling_script += L"  return [pendingId, document.__$webdriverAsyncTimeout];\n";
			polling_script += L"}\n";
			polling_script += L"};})();";

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			CComPtr<IHTMLDocument2> doc;
			browser_wrapper->GetDocument(&doc);
			ScriptWrapper *async_script_wrapper = new ScriptWrapper(doc, async_script, json_args.size());
			status_code = this->PopulateArgumentArray(manager, async_script_wrapper, json_args);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Error setting arguments for script");
				return;
			}

			status_code = async_script_wrapper->Execute();

			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "JavaScript error in async script.");
				return;
			} else {
				ScriptWrapper *polling_script_wrapper = new ScriptWrapper(doc, polling_script, 0);
				while (true) {
					Json::Value polling_result;
					status_code = polling_script_wrapper->Execute();
					polling_script_wrapper->ConvertResultToJsonValue(manager, &polling_result);
					
					Json::UInt index = 0;
					std::string narrow_pending_id(CW2A(pending_id.c_str(), CP_UTF8));
					if (polling_result.isArray() && polling_result.size() == 2 && polling_result[index].isString() && polling_result[index].asString() == narrow_pending_id) {
						int timeout_flag = polling_result[1].asInt();
						if (timeout_flag < 0) {
							response->SetErrorResponse(EUNEXPECTEDJSERROR, "Page reload detected during async script");
							break;
						}
						if (timeout_flag > 0) {
							response->SetErrorResponse(ESCRIPTTIMEOUT, "Timeout expired waiting for async script");
							break;
						}
					} else {
						response->SetResponse(SUCCESS, polling_result);
						break;
					}
				}

				delete polling_script_wrapper;
				delete async_script_wrapper;
				return;
			}
		}
	}
};

} // namespace webdriver

#endif // WEBDRIVER_IE_EXECUTEASYNCSCRIPTCOMMANDHANDLER_H_
