package com.thoughtworks.selenium.internal;

import java.util.List;

public interface FilterFunction {
	List filterElements(List allElements, String filterValue);
}
