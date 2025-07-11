FROM openjdk:17
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} hello-world-grpc-0.0.1-SNAPSHOT.jar
ENTRYPOINT ["java", "-jar","hello-world-grpc-0.0.1-SNAPSHOT.jar"]