#ifndef WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_
#define WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_

#include "BrowserManager.h"

#define BSTR_VALUE(method, css_name)     if (_wcsicmp(css_name, property_name) == 0) { CComBSTR bstr; method(&bstr); result_str = (BSTR)bstr; return result_str;}
#define VARIANT_VALUE(method, css_name)  if (_wcsicmp(css_name, property_name) == 0) { CComVariant var; method(&var); result_str = this->MangleColour(property_name, browser_wrapper->ConvertVariantToWString(&var)); return result_str;}
#define ADD_COLOR(index, name, hex)		this->colour_names_hex_code_map[index][0] = name; this->colour_names_hex_code_map[index][1] = hex;

namespace webdriver {

class GetElementValueOfCssPropertyCommandHandler : public WebDriverCommandHandler {
public:
	GetElementValueOfCssPropertyCommandHandler(void) {
		ADD_COLOR(0, L"aqua", L"#00ffff");
		ADD_COLOR(1, L"black", L"#000000");
		ADD_COLOR(2, L"blue", L"#0000ff");
		ADD_COLOR(3, L"fuchsia", L"#ff00ff");
		ADD_COLOR(4, L"gray", L"#808080");
		ADD_COLOR(5, L"green", L"#008000");
		ADD_COLOR(6, L"lime", L"#00ff00");
		ADD_COLOR(7, L"maroon", L"#800000");
		ADD_COLOR(8, L"navy", L"#000080");
		ADD_COLOR(9, L"olive", L"#808000");
		ADD_COLOR(10, L"purple", L"#800080");
		ADD_COLOR(11, L"red", L"#ff0000");
		ADD_COLOR(12, L"silver", L"#c0c0c0");
		ADD_COLOR(13, L"teal", L"#008080");
		ADD_COLOR(14, L"white", L"#ffffff");
		ADD_COLOR(15, L"yellow", L"#ffff00");
		ADD_COLOR(16, NULL, NULL);
	}

	virtual ~GetElementValueOfCssPropertyCommandHandler(void) {
	}

protected:
	void GetElementValueOfCssPropertyCommandHandler::ExecuteInternal(BrowserManager *manager, const std::map<std::string, std::string>& locator_parameters, const std::map<std::string, Json::Value>& command_parameters, WebDriverResponse * response) {
		std::map<std::string, std::string>::const_iterator id_parameter_iterator = locator_parameters.find("id");
		std::map<std::string, std::string>::const_iterator property_name_parameter_iterator = locator_parameters.find("propertyName");
		if (id_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: id");
			return;
		} else if (property_name_parameter_iterator == locator_parameters.end()) {
			response->SetErrorResponse(400, "Missing parameter in URL: propertyName");
			return;
		} else {
			std::wstring element_id(CA2W(id_parameter_iterator->second.c_str(), CP_UTF8));
			std::wstring name(CA2W(property_name_parameter_iterator->second.c_str(), CP_UTF8));

			BrowserWrapper *browser_wrapper;
			int status_code = manager->GetCurrentBrowser(&browser_wrapper);
			if (status_code != SUCCESS) {
				response->SetErrorResponse(status_code, "Unable to get browser");
				return;
			}

			std::tr1::shared_ptr<ElementWrapper> element_wrapper;
			status_code = this->GetElement(manager, element_id, &element_wrapper);
			if (status_code == SUCCESS) {
				std::wstring value(this->GetPropertyValue(browser_wrapper, element_wrapper->element(), name.c_str()));

				std::string property_value(CW2A(value.c_str(), CP_UTF8));
				response->SetResponse(SUCCESS, property_value);
				return;
			} else {
				response->SetErrorResponse(status_code, "Element is no longer valid");
				return;
			}
		}
	}

private:
	std::wstring MangleColour(LPCWSTR property_name, const std::wstring& to_mangle) {
		if (wcsstr(property_name, L"color") == NULL) {
			return to_mangle;
		}

		// Look for each of the named colours and mangle them.
		for (int i = 0; colour_names_hex_code_map[i][0]; i++) {
			if (_wcsicmp(colour_names_hex_code_map[i][0], to_mangle.c_str()) == 0) {
				return colour_names_hex_code_map[i][1];
			}
		}

		return to_mangle;
	}

	std::wstring GetElementValueOfCssPropertyCommandHandler::GetPropertyValue(BrowserWrapper *browser_wrapper, IHTMLElement *element, LPCWSTR property_name) {
		std::wstring result_str(L"");
		CComQIPtr<IHTMLElement2> styled(element);
		if (!styled) {
			return result_str;
		}

		CComBSTR name(property_name);

		CComPtr<IHTMLCurrentStyle> style;
		styled->get_currentStyle(&style);

		/*
		// This is what I'd like to write.

		CComVariant value;
		style->getAttribute(name, 0, &value);
		return variant2wchar(value);
		*/

		// So the way we've done this strikes me as a remarkably poor idea.

		/*
		Not implemented
			background-position
			clip
			column-count
			column-gap
			column-width
			float
			marker-offset
			opacity
			outline-top-width
			outline-right-width
			outline-bottom-width
			outline-left-width
			outline-top-color
			outline-right-color
			outline-bottom-color
			outline-left-color
			outline-top-style
			outline-right-style
			outline-bottom-style
			outline-left-style
			user-focus
			user-select
			user-modify
			user-input
			white-space
			word-spacing
		*/
		BSTR_VALUE(		style->get_backgroundAttachment,		L"background-attachment");
		VARIANT_VALUE(	style->get_backgroundColor,				L"background-color");
		BSTR_VALUE(		style->get_backgroundImage,				L"background-image");
		BSTR_VALUE(		style->get_backgroundRepeat,			L"background-repeat");
		VARIANT_VALUE(	style->get_borderBottomColor,			L"border-bottom-color");
		BSTR_VALUE(		style->get_borderBottomStyle,			L"border-bottom-style");
		VARIANT_VALUE(	style->get_borderBottomWidth,			L"border-bottom-width");
		VARIANT_VALUE(	style->get_borderLeftColor,				L"border-left-color");
		BSTR_VALUE(		style->get_borderLeftStyle,				L"border-left-style");
		VARIANT_VALUE(	style->get_borderLeftWidth,				L"border-left-width");
		VARIANT_VALUE(	style->get_borderRightColor,			L"border-right-color");
		BSTR_VALUE(		style->get_borderRightStyle,			L"border-right-style");
		VARIANT_VALUE(	style->get_borderRightWidth,			L"border-right-width");
		VARIANT_VALUE(	style->get_borderTopColor,				L"border-top-color");
		BSTR_VALUE(		style->get_borderTopStyle,				L"border-top-style");
		VARIANT_VALUE(	style->get_borderTopWidth,				L"border-top-width");
		VARIANT_VALUE(	style->get_bottom,						L"bottom");
		BSTR_VALUE(		style->get_clear,						L"clear");
		VARIANT_VALUE(	style->get_color,						L"color");
		BSTR_VALUE(		style->get_cursor,						L"cursor");
		BSTR_VALUE(		style->get_direction,					L"direction");
		BSTR_VALUE(		style->get_display,						L"display");
		BSTR_VALUE(		style->get_fontFamily,					L"font-family");
		VARIANT_VALUE(	style->get_fontSize,					L"font-size");
		BSTR_VALUE(		style->get_fontStyle,					L"font-style");
		VARIANT_VALUE(	style->get_fontWeight,					L"font-weight");
		VARIANT_VALUE(	style->get_height,						L"height");
		VARIANT_VALUE(	style->get_left,						L"left");
		VARIANT_VALUE(	style->get_letterSpacing,				L"letter-spacing");
		VARIANT_VALUE(	style->get_lineHeight,					L"line-height");
		BSTR_VALUE(		style->get_listStyleImage,				L"list-style-image");
		BSTR_VALUE(		style->get_listStylePosition,			L"list-style-position");
		BSTR_VALUE(		style->get_listStyleType,				L"list-style-type");
		BSTR_VALUE(		style->get_margin, 						L"margin");
		VARIANT_VALUE(	style->get_marginBottom, 				L"margin-bottom");
		VARIANT_VALUE(	style->get_marginRight, 				L"margin-right");
		VARIANT_VALUE(	style->get_marginTop, 					L"margin-top");
		VARIANT_VALUE(	style->get_marginLeft, 					L"margin-left");
		BSTR_VALUE(		style->get_overflow, 					L"overflow");
		BSTR_VALUE(		style->get_padding, 					L"padding");
		VARIANT_VALUE(	style->get_paddingBottom, 				L"padding-bottom");
		VARIANT_VALUE(	style->get_paddingLeft, 				L"padding-left");
		VARIANT_VALUE(	style->get_paddingRight, 				L"padding-right");
		VARIANT_VALUE(	style->get_paddingTop, 					L"padding-top");
		BSTR_VALUE(		style->get_position, 					L"position");
		VARIANT_VALUE(	style->get_right, 						L"right");
		BSTR_VALUE(		style->get_textAlign, 					L"text-align");
		BSTR_VALUE(		style->get_textDecoration, 				L"text-decoration");
		BSTR_VALUE(		style->get_textTransform, 				L"text-transform");
		VARIANT_VALUE(	style->get_top, 						L"top");
		VARIANT_VALUE(	style->get_verticalAlign,				L"vertical-align");
		BSTR_VALUE(		style->get_visibility,					L"visibility");
		VARIANT_VALUE(	style->get_width,						L"width");
		VARIANT_VALUE(	style->get_zIndex,						L"z-index");

		return result_str;
	}

	const wchar_t* colour_names_hex_code_map[17][2];
};

} // namespace webdriver

#endif // WEBDRIVER_IE_GETELEMENTVALUEOFCSSPROPERTYCOMMANDHANDLER_H_
