# 🔐 SECURITY.md - Политика Безопасности Maxus Проекта

## 🚨 Критические файлы и данные

Проект содержит следующие типы секретных данных, которые **ДОЛЖНЫ быть защищены**:

### 1. Firebase Credentials
- **Файл:** `src/environments/environment.development.ts`
- **Содержит:** API Key, Auth Domain, Project ID, Storage Bucket, Messaging Sender ID, App ID
- **Риск:** ❌ **КРИТИЧЕСКИЙ** - Доступ ко всему Firebase проекту
- **Статус:** Игнорируется в `.gitignore`

### 2. Gemini API Key
- **Файл:** `src/environments/environment.development.ts`
- **Содержит:** Google Gemini API ключ
- **Риск:** ❌ **КРИТИЧЕСКИЙ** - Может быть использован для платных запросов
- **Статус:** Игнорируется в `.gitignore`

### 3. Stripe Keys
- **Файл:** `functions/.env`
- **Содержит:** Stripe Secret Key (TEST и LIVE)
- **Риск:** ❌ **КРИТИЧЕСКИЙ** - Доступ ко всем платежам и данным карт
- **Статус:** Игнорируется в `.gitignore`

### 4. Firebase Service Account (если будет)
- **Файл:** `service-account.json`
- **Содержит:** Полный доступ к Firebase проекту
- **Риск:** ❌ **КРИТИЧЕСКИЙ**
- **Статус:** Игнорируется в `.gitignore`

---

## ✅ Правильный способ работы

### Локальная разработка

1. **Копируй шаблоны:**
```bash
cp src/environments/environment.development.example.ts src/environments/environment.development.ts
cp functions/.env.example functions/.env
```

2. **Заполни СВОИ ключи:**
- Для development Firebase проекта (все в test mode)
- Для Gemini API ключа
- Для Stripe TEST ключа

3. **Проверь что файлы НЕ трекируются:**
```bash
git status
# Не должно быть:
# - src/environments/environment.development.ts
# - functions/.env
```

### Production деплой

#### Firebase
1. Используй Environment-specific конфигурацию
2. Переменные окружения задаются через Firebase Console
3. Не коммитьте production ключи

#### Stripe
```bash
firebase functions:config:set stripe.secret="sk_live_YOUR_KEY"
```

#### Gemini API
Устанавливается через функцию в Cloud Functions или переменные окружения.

---

## 🔍 Проверка и Мониторинг

### Автоматическая проверка перед коммитом

**На Windows (PowerShell):**
```bash
.\scripts\pre-commit-security-check.ps1
```

**На Mac/Linux (Bash):**
```bash
bash scripts/pre-commit-security-check.sh
```

### Ручная проверка

Перед каждым коммитом запусти:

```bash
# Посмотри что будет закоммичено
git diff --cached

# Поищи подозрительные ключи
grep -r "AIzaSy\|sk_live_\|sk_test_" src/ functions/

# Проверь статус важных файлов
git status src/environments/environment.development.ts
git status functions/.env
```

---

## 🚨 ЧТО ДЕЛАТЬ ЕСЛИ КЛЮЧИ УТЕКЛИ

### 1. НЕМЕДЛЕННО (в течение часа)

Если ты закоммитил ключи в git:

```bash
# Перегенерируй ключи в Firebase/Gemini/Stripe console
# https://console.firebase.google.com
# https://makersuite.google.com/app/apikey
# https://dashboard.stripe.com/apikeys
```

### 2. Удали из git истории

```bash
# Удали файл из всей истории
git filter-branch --tree-filter 'rm -f src/environments/environment.development.ts' HEAD

# Или используй BFG tool (проще и быстрее)
# https://rtyley.github.io/bfg-repo-cleaner/
bfg --delete-files environment.development.ts
```

### 3. Force push (⚠️ опасно!)

```bash
# ТОЛЬКО если ты уверен что никто не основал ветки на старых коммитах!
git push origin main --force
```

### 4. Inform the team
Скажи всем членам команды что они должны сделать:
- Переделать свои ключи
- Обновить местные копии
- Очистить кэш git

---

## 📋 .gitignore Rules

Текущие игнорируемые файлы:

```gitignore
# Angular Environment
src/environments/environment.development.ts
src/environments/environment.local.ts

# Переменные окружения
.env
.env.local
.env.*.local
functions/.env
functions/.env.local
functions/.env.*.local

# Ключи и сертификаты
*.key
*.pem
*.p12
*.jks

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
firebase.json.backup

# Google Cloud Service Accounts
service-account.json
```

---

## 🛡️ Best Practices

### ✅ ДЕЛАЙ ТАК:

- ✅ Используй `.example` файлы как шаблоны
- ✅ Заполняй локальные копии только своими тестовыми ключами
- ✅ Регулярно ротируй ключи (каждый месяц минимум)
- ✅ Используй разные ключи для dev, test и production
- ✅ Проверяй git diff перед коммитом
- ✅ Используй pre-commit хуки

### ❌ НЕ ДЕЛАЙ ТАК:

- ❌ Не коммитьте `.env` файлы с реальными ключами
- ❌ Не публикуй скриншоты консоли Firebase
- ❌ Не отправляй ключи по Slack/Email
- ❌ Не используй одинаковые ключи для всех окружений
- ❌ Не забывай про .gitignore правила

---

## 🔄 Обновление Шаблонов

Если понадобиться добавить новые секретные переменные:

1. Добавь в `.example` файл с инструкциями
2. Добавь в `.gitignore` (без `.example` версии)
3. Обнови документацию в `ENVIRONMENT_SETUP.md`
4. Оповести команду

Пример:
```bash
# Добавил новую переменную
echo "NEW_SECRET_KEY=replace_me" >> src/environments/environment.development.example.ts

# Обновил gitignore
echo "src/environments/*.secret.ts" >> .gitignore

# Закоммитил только пример и gitignore (БЕЗ реальных значений)
git add src/environments/environment.development.example.ts .gitignore
git commit -m "docs: add new secret key template"
```

---

## 📞 Вопросы и Помощь

Если у тебя есть вопросы о безопасности:
1. Прочитай `ENVIRONMENT_SETUP.md`
2. Проверь `PRE_COMMIT_CHECKLIST.md`
3. Запусти скрипт проверки: `scripts/pre-commit-security-check.ps1`

**В сомнениях? Лучше переспроси чем закоммитить ключи!** 🔐

