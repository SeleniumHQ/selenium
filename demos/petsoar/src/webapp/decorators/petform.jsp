<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<table class="form">
    <tr><td colspan="2">
        <h2><decorator:getProperty property="title" /></h2>

        <decorator:getProperty property="description" />
    </td></tr>
    <form action="<decorator:getProperty property="action" />" id="form">
        <decorator:body />

        <tr><td colspan="2">
            <input type="submit" value="<decorator:getProperty property="button" />" id="submit">
        </td></tr>
    </form>
</table>
