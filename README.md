# 🏋️ MWE-TREINO

Welcome to **MWE-TREINO**, a mobile app built with **Expo** to help you track and manage your gym workouts.

This project was created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and is focused on simplicity, offline usage, and a clean user experience.

---

## 🚀 Getting Started

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Start the application

```bash
npx expo start
```

After starting the project, you can open the app using:

* 📱 **Expo Go** (quick testing)
* 🤖 **Android Emulator**
* 🍎 **iOS Simulator**
* 🧪 **Development Build** (recommended for full feature support)

---

## 📦 Gerando o APK via Docker (Build Local)

Você pode compilar o arquivo instalável `.apk` do Android diretamente na sua máquina sem precisar configurar o Android SDK ou Java manualmente, utilizando o **Docker**.

### 📋 Pré-requisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução.

### ⚙️ Como compilar:

#### Opção 1: Via Script PowerShell (Recomendado no Windows)
Basta executar o script automatizado na raiz do projeto:
```powershell
.\build-apk-docker.ps1
```

#### Opção 2: Via Docker Compose
```bash
docker compose up --build
```

#### Opção 3: Via Docker CLI (Manual)
1. Construa a imagem do builder:
```bash
docker build -t mwe-android-builder .
```
2. Execute o container montando a pasta do projeto:
```bash
# PowerShell (Windows)
docker run --rm -v "${PWD}:/app" mwe-android-builder

# Bash / Linux / macOS
docker run --rm -v "$(pwd):/app" mwe-android-builder
```

> 💡 **Resultado:** O instalável final será gerado automaticamente na raiz do projeto com o nome `mwe-treino.apk`.

---

## 📱 About the App

**MWE-TREINO** is a gym companion app designed to help users:

* Create and manage workouts
* Track exercises and training sessions
* Persist data locally for offline use

The project is still evolving, and new features and UI improvements are planned.

---

## 🛠️ Tech Stack

* **Expo**
* **React Native**
* **TypeScript**
* **SQLite** (local persistence)

---

## 📌 Roadmap

* [ ] Training session execution flow
* [ ] Workout history
* [ ] UI/UX improvements
* [ ] Performance and code refactoring

---

## 📄 License

This project is for study and personal use.

Feel free to explore, test, and contribute 🚀

