FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
RUN apt-get update && apt-get install -y maven
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -q
EXPOSE 8081
CMD ["java", "-jar", "target/java-risk-engine-1.0.0.jar"]
