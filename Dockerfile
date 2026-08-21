# Etapa responsável pela compilação
FROM maven:3-eclipse-temurin-24 AS build

WORKDIR /workspace

COPY pom.xml .

RUN mvn -B -DskipTests dependency:go-offline

COPY src ./src

RUN mvn -B -DskipTests clean package && \
    JAR_FILE="$(find target -maxdepth 1 -type f -name '*.jar' \
      ! -name '*-plain.jar' \
      ! -name '*-sources.jar' \
      ! -name '*-javadoc.jar' \
      | head -n 1)" && \
    test -n "${JAR_FILE}" && \
    cp "${JAR_FILE}" /workspace/app.jar

# Etapa de execução
FROM eclipse-temurin:17-jre-jammy

RUN groupadd --system spring && \
    useradd --system --gid spring --create-home spring

WORKDIR /app

# O banco corrigido fica como semente fora do ponto de montagem do PVC.
# Na primeira execução ele é copiado para /app/data; bancos existentes são preservados.
RUN mkdir -p /app/data /app/seed && \
    chown -R spring:spring /app

COPY --from=build --chown=spring:spring \
    /workspace/app.jar /app/app.jar

COPY --chown=spring:spring data/agenda.db /app/seed/agenda.db
COPY --chown=spring:spring docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 0755 /app/docker-entrypoint.sh

USER spring:spring

EXPOSE 80

ENTRYPOINT ["/app/docker-entrypoint.sh"]
