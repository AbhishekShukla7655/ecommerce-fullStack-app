
FROM eclipse-temurin:21-jdk-alpine


WORKDIR /app


COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn


RUN ./mvnw dependency:go-offline -B

COPY src src


RUN ./mvnw clean install -DskipTests


EXPOSE 8080
CMD ["java", "-jar", "target/ecommerce-0.0.1-SNAPSHOT.jar"]