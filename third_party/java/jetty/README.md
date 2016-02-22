When modifying the jetty-repacked-5 jar, here's how to upload it to maven central:

    mvn gpg:sign-and-deploy-file -Durl=https://oss.sonatype.org/service/local/staging/deploy/maven2/ -DrepositoryId=sonatype-nexus-staging -DpomFile=jetty-repacked-5.pom -Dfile=jetty-repacked-5.jar -Dfiles=jetty-repacked-5-sources.jar,jetty-repacked-5-sources.jar -Dclassifiers=sources,javadoc -Dtypes=jar,jar
