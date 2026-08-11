# Imagem Base: Ubuntu Linux com OpenJDK 17 pré-instalado
FROM eclipse-temurin:17-jdk-jammy

# Define variáveis de ambiente
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/35.0.0
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependências básicas do Linux
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala o Node.js 20 LTS e npm
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g eas-cli

# Cria pasta e baixa o Android Command Line Tools oficial
RUN mkdir -p /opt/android-sdk/cmdline-tools \
    && curl -o /tmp/cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
    && unzip /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools \
    && mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Aceita licenças e instala Android SDK Platform 35 e Build Tools 35.0.0
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# Cria diretório de trabalho
WORKDIR /app

# Comando padrão ao iniciar o container: compilar o APK via EAS Local
CMD ["npx", "eas-cli", "build", "-p", "android", "--profile", "preview", "--local", "--output=/app/mwe-treino.apk"]
