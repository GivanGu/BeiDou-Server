ARG RUNTIME_JRE_IMAGE=eclipse-temurin:21-jre-alpine
 
FROM maven:3.9.6-amazoncorretto-21 AS builder
 
WORKDIR /opt/build
 
COPY ./pom.xml                 ./pom.xml
COPY ./gms-server/pom.xml      ./gms-server/pom.xml
 
# RUN mvn dependency:resolve -B --no-transfer-progress
RUN --mount=type=cache,target=/root/.m2 mvn dependency:resolve -B --no-transfer-progress
 
COPY ./gms-server/src          ./gms-server/src
 
# RUN mvn package -B -DskipTests --no-transfer-progress
RUN --mount=type=cache,target=/root/.m2 mvn package -B -DskipTests --no-transfer-progress
 
RUN mkdir result && mv ./gms-server/target/BeiDou.jar ./result/BeiDou.jar
 
COPY ./gms-server/src/main/resources/application.yml ./result/application.yml
COPY ./gms-server/wz ./result/wz
COPY ./gms-server/wz-zh-CN ./result/wz-zh-CN
COPY ./gms-server/scripts ./result/scripts
COPY ./gms-server/scripts-zh-CN ./result/scripts-zh-CN
 
FROM $RUNTIME_JRE_IMAGE
 
COPY --from=builder /opt/build/result /opt/server_backup
 
COPY ./docker/entrypoint-nightly.sh /
 
RUN chmod +x /entrypoint-nightly.sh
 
VOLUME /opt/server
 
EXPOSE 8686 8484 7575 7576 7577
 
ENTRYPOINT ["/entrypoint-nightly.sh"]