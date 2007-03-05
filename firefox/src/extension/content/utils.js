function newInstance(className, interfaceName) {
	var clazz = Components.classes[className];
	if (clazz == undefined) {
		throw new Exception();
	}
	
	var iface = Components.interfaces[interfaceName];
	
	if (iface == undefined) {
		throw new Exception();
	}
	
	return clazz.createInstance(iface);
}

