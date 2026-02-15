#!/bin/bash

# 🔐 Pre-commit скрипт для проверки безопасности
# Использование: поместить в .git/hooks/pre-commit и chmod +x

echo "🔍 Проверка безопасности перед коммитом..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Проверка на Firebase API ключи
echo -n "Проверка Firebase API ключей... "
if git diff --cached | grep -i "AIzaSy"; then
    echo -e "${RED}❌ ОШИБКА: Обнаружены Firebase API ключи!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 2. Проверка на Gemini API ключи
echo -n "Проверка Gemini API ключей... "
if git diff --cached | grep -i "AIzaSy"; then
    echo -e "${RED}❌ ОШИБКА: Обнаружены Gemini API ключи!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 3. Проверка на Stripe ключи
echo -n "Проверка Stripe ключей... "
if git diff --cached | grep -E "sk_(live|test)_"; then
    echo -e "${RED}❌ ОШИБКА: Обнаружены Stripe ключи!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 4. Проверка что environment.development.ts не коммитится
echo -n "Проверка environment.development.ts... "
if git diff --cached --name-only | grep -E "environment\.development\.ts$"; then
    echo -e "${RED}❌ ОШИБКА: Пытаешься закоммитить environment.development.ts!${NC}"
    echo "Используй: git reset src/environments/environment.development.ts"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 5. Проверка что functions/.env не коммитится
echo -n "Проверка functions/.env... "
if git diff --cached --name-only | grep -E "functions/\.env(\.local)?$"; then
    echo -e "${RED}❌ ОШИБКА: Пытаешься закоммитить functions/.env!${NC}"
    echo "Используй: git reset functions/.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 6. Проверка на .firebase/ файлы
echo -n "Проверка .firebase/ папки... "
if git diff --cached --name-only | grep -E "^\.firebase/"; then
    echo -e "${RED}❌ ОШИБКА: Пытаешься закоммитить файлы из .firebase/!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# 7. Проверка на node_modules
echo -n "Проверка node_modules... "
if git diff --cached --name-only | grep -E "node_modules/"; then
    echo -e "${RED}❌ ОШИБКА: Пытаешься закоммитить node_modules!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓${NC}"
fi

# Итоговый результат
echo ""
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Все проверки пройдены! Коммит разрешён.${NC}"
    exit 0
else
    echo -e "${RED}❌ Обнаружено $ERRORS ошибок безопасности!${NC}"
    echo "Исправь проблемы и повтори попытку."
    exit 1
fi

