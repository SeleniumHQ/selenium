<%@ taglib uri="/WEB-INF/c.tld" prefix="c"%>

<%
   response.setDateHeader ("Expires", System.currentTimeMillis());
   response.setHeader("Pragma", "no-cache");
   if (request.getProtocol().equals("HTTP/1.1")) {
     response.setHeader("Cache-Control", "no-cache");
   }
%>

<c:choose>
	<c:when test="${results == null}">
		waiting for post
	</c:when>
	<c:otherwise>
		<html><body>
		
		<h1>Test suite results </h1>
		
		<table>
		    <tr>
		        <td>result:</td>
		        <td><c:out value="${results.result}"/></td>
		    </tr>
		    <tr>
		        <td>totalTime:</td>
		        <td><c:out value="${results.totalTime}"/></td>
		    </tr>
		    <tr>
		        <td>numTestPasses:</td>
		        <td><c:out value="${results.numTestPasses}"/></td>
		    </tr>
		    <tr>
		        <td>numTestFailures:</td>
		        <td><c:out value="${results.numTestFailures}"/></td>
		    </tr>
		    <tr>
		        <td>numCommandPasses:</td>
		        <td><c:out value="${results.numCommandPasses}"/></td>
		    </tr>
		    <tr>
		        <td>numCommandFailures:</td>
		        <td><c:out value="${results.numCommandFailures}"/></td>
		    </tr>
		    <tr>
		        <td>numCommandErrors:</td>
		        <td><c:out value="${results.numCommandErrors}"/></td>
		    </tr>
		    <tr>
		        <td><c:out value="${results.decodedTestSuite}" escapeXml="false"/></td>
		        <td>&nbsp;</td>
		    </tr>
		    <c:forEach var="testTable" items="${results.decodedTestTables}">
		        <tr>
		            <td><c:out value="${testTable}" escapeXml="false"/></td>
		            <td>&nbsp;</td>
		        </tr>
		    </c:forEach>
		</table>
		</body>
		</html>
	</c:otherwise>

</c:choose>