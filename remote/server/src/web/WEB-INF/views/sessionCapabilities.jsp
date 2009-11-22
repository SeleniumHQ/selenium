<%@ page contentType="text/html;charset=UTF-8" language="java" %>

<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<html>
  <head><title>Session Capabilities</title></head>
  <body>
  	<c:out value="${capabilities.browserName}" />
  </body>
</html>