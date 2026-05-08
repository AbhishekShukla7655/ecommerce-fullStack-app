# Java 21 use karenge
FROM eclipse-temurin:21-jdk-jammy

# Working directory
WORKDIR /app

# Pehle pom.xml copy karo — dependencies cache hogi
COPY pom.xml .

# Maven wrapper copy karo
COPY mvnw .
COPY .mvn/ .mvn/

# mvnw ko executable banao
RUN chmod +x mvnw

# Dependencies download karo
RUN ./mvnw dependency:go-offline -B

# Source code copy karo
COPY src/ src/

# Build karo — tests skip
RUN ./mvnw clean package -DskipTests

# Port expose karo
EXPOSE 8080

# App start karo
ENTRYPOINT ["java", "-jar", "target/ecommerce-0.0.1-SNAPSHOT.jar"]