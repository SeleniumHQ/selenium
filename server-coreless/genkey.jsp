<%@ page import="org.apache.tools.ant.Project" %><%@ page import="org.apache.tools.ant.filters.StringInputStream" %><%@ page import="org.apache.tools.ant.taskdefs.Copy" %><%@ page import="org.apache.tools.ant.taskdefs.Execute" %><%@ page import="org.apache.tools.ant.taskdefs.PumpStreamHandler" %><%@ page import="org.apache.tools.ant.types.FileSet" %><%@ page import="javax.servlet.ServletOutputStream" %><%@ page import="java.io.File" %><%@ page import="java.io.FileInputStream" %><%@ page import="java.io.FileOutputStream" %><%@ page import="java.io.IOException" %><%@ page import="java.nio.channels.FileChannel" %><%!
    public static void genKey(String domain, File base, ServletOutputStream out) throws IOException {
        // first, make a temp dir from the WD
        File wd = new File(base, Long.toString(System.currentTimeMillis()));
        wd.mkdirs();

        try {
            // now copy the demoCA dir
            copyDir(new File(base, "demoCA"), new File(wd, "demoCA"));
            copyFile(new File(base, "ca.key"), new File(wd, "ca.key"));

            Execute e = new Execute(new PumpStreamHandler(System.out, System.err));
            String keytoolCmd = "/opt/java/sdk/current/bin/keytool";
            e.setCommandline(new String[]{
                    keytoolCmd, "-genkey", "-alias", domain, "-keypass", "password", "-storepass", "password", "-keystore", "server.keystore", "-dname", "CN=" + domain + ", OU=Selenium, O=OpenQA, L=Portland, S=OR, C=US"
            });
            e.setWorkingDirectory(wd);
            e.execute();

            e.setCommandline(new String[]{
                    keytoolCmd, "-certreq", "-alias", domain, "-storepass", "password", "-keystore", "server.keystore", "-file", domain + ".csr"
            });
            e.execute();

            e = new Execute(new PumpStreamHandler(System.out, System.err, new StringInputStream("y\ny\n")));
            e.setWorkingDirectory(wd);
            e.setCommandline(new String[]{
                    "openssl", "ca", "-in", domain + ".csr", "-out", "serverapp.pem", "-keyfile", "ca.key", "-days", "10950"
            });
            e.execute();

            e = new Execute(new PumpStreamHandler(System.out, System.err));
            e.setWorkingDirectory(wd);
            e.setCommandline(new String[]{
                    "openssl", "x509", "-in", "serverapp.pem", "-out", "serverapp.der", "-outform", "DER"
            });
            e.execute();

            e = new Execute(new PumpStreamHandler(System.out, System.err, new StringInputStream("yes\n")));
            e.setWorkingDirectory(wd);
            e.setCommandline(new String[]{
                    keytoolCmd, "-import", "-alias", "ca", "-storepass", "password", "-keystore", "server.keystore", "-file", "demoCA/cacert.pem"
            });
            e.execute();

            e = new Execute(new PumpStreamHandler(System.out, System.err));
            e.setWorkingDirectory(wd);
            e.setCommandline(new String[]{
                    keytoolCmd, "-import", "-alias", domain, "-storepass", "password", "-keystore", "server.keystore", "-file", "serverapp.der"
            });
            e.execute();

            File keystore = new File(wd, "server.keystore");
            FileInputStream fis = new FileInputStream(keystore);
            byte[] buffer = new byte[1024];
            int length;
            while (((length = fis.read(buffer)) != -1)) {
                out.write(buffer, 0, length);
            }

            System.out.println("Wrote keystore at " + keystore.getAbsolutePath() + " to output stream");
        } finally {
            deleteDir(wd);
        }
    }

    public static void copyFile(File in, File out) throws IOException {
        FileChannel sourceChannel = new
                FileInputStream(in).getChannel();
        FileChannel destinationChannel = new
                FileOutputStream(out).getChannel();
        sourceChannel.transferTo(0, sourceChannel.size(), destinationChannel);
        // or
        //  destinationChannel.transferFrom(sourceChannel, 0, sourceChannel.size());
        sourceChannel.close();
        destinationChannel.close();
    }

    public static void copyDir(File from, File to) {
        Copy copy = new Copy();
        copy.setTodir(to);
        FileSet fileSet = new FileSet();
        fileSet.setDir(from);
        copy.addFileset(fileSet);
        copy.setProject(new Project());
        copy.execute();
    }

    // Deletes all files and subdirectories under dir.
    // Returns true if all deletions were successful.
    // If a deletion fails, the method stops attempting to delete and returns false.
    public static boolean deleteDir(File dir) {
        if (dir.isDirectory()) {
            String[] children = dir.list();
            for (String child : children) {
                boolean success = deleteDir(new File(dir, child));
                if (!success) {
                    return false;
                }
            }
        }

        // The directory is now empty so delete it
        return dir.delete();
    }
%><%
    response.setContentType("binary/octet-stream");
    response.addHeader("Content-Disposition", "attachment; filename=server.keystore");
    ServletOutputStream os = response.getOutputStream();
    genKey(request.getParameter("domain"), new File("/opt/j2ee/domains/openqa.org/dangerous-certificate-authority/workspace/certs"), os);
    os.flush();
    os.close();
%>