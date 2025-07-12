FROM maven:3.9.9-eclipse-temurin-24-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests
FROM eclipse-temurin:24-jdk AS run
WORKDIR /app

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["/wait-for-it.sh", "db:10994", "--timeout=30", "--strict", "--", "java","-jar","app.jar"]