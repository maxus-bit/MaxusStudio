# 🔐 Локальная Конфигурация Окружения

## Как настроить локальную разработку

### 1. Создание файла конфигурации

Скопируй файл-шаблон:
```bash
cp src/environments/environment.development.example.ts src/environments/environment.development.ts
```

### 2. Получение Firebase ключей

1. Перейди на [Firebase Console](https://console.firebase.google.com)
2. Выбери проект **maxus-studio**
3. Нажми на "Project Settings" (шестеренка)
4. В разделе "Your apps" найди веб-приложение
5. Скопируй объект `firebaseConfig` и заполни в `environment.development.ts`

### 3. Получение Gemini API ключа

1. Перейди на [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Нажми "Create API key"
3. Скопируй ключ в `geminiApiKey` в файле `environment.development.ts`

### 4. ⚠️ ВАЖНО: Никогда не коммитьте реальные ключи!

Файл `src/environments/environment.development.ts` находится в `.gitignore` именно для этого:
```
# Никогда не коммитим локальные конфиги с ключами
src/environments/environment.development.ts
src/environments/environment.local.ts
```

Всегда работайте только с локальной копией!

### 5. Проверка конфигурации

После заполнения запусти:
```bash
npm start
```

Если видишь Firebase авторизацию и работающее приложение - всё настроено правильно!

## 🚨 Если ключи были скомпрометированы

Если ты случайно коммитил реальные ключи раньше:

1. **Немедленно** перегенерируй ключи в Firebase Console
2. Выполни очистку git истории:
```bash
git filter-branch --tree-filter 'rm -f src/environments/environment.development.ts' HEAD
```

3. Убедись, что `.gitignore` содержит:
```
src/environments/environment.development.ts
```

4. Сделай force push (только если ты один в ветке!):
```bash
git push origin main --force
```

