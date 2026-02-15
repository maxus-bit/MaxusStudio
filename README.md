# Maxus Angular - AI Thumbnails Generator

Angular приложение для генерации AI thumbnail изображений.

## Структура проекта

```
src/
├── app/
│   ├── core/                    # Ядро приложения
│   │   ├── config/             # Конфигурация (Firebase)
│   │   ├── guards/             # Route guards
│   │   ├── models/             # TypeScript модели
│   │   └── services/           # Сервисы (Auth, Firestore, API)
│   ├── features/               # Функциональные модули
│   │   ├── landing/            # Лендинг страница
│   │   ├── dashboard/          # Дашборд
│   │   └── privacy-policy/     # Политика конфиденциальности
│   └── app.component.ts        # Корневой компонент
├── assets/                      # Статические файлы
│   └── img/                    # Изображения
└── styles.scss                  # Глобальные стили
```

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите dev сервер:
```bash
npm start
```

3. Откройте браузер на `http://localhost:4200`

## Сборка для production

```bash
npm run build
```

## Основные технологии

- **Angular 18** - Frontend framework
- **Firebase** - Authentication, Firestore, Storage
- **Stability AI API** - Генерация изображений
- **TypeScript** - Типизация
- **SCSS** - Стилизация

## Миграция с vanilla JS

Проект мигрирован с vanilla JavaScript на Angular. Старые файлы сохранены в корне проекта:
- `index.html`, `dashboard.html` - старые HTML файлы
- `script.js`, `dashboard.js` - старые JS файлы
- `styles.css`, `dashboard-styles.css` - старые CSS файлы

## Следующие шаги

1. ✅ Базовая структура Angular
2. ✅ Firebase интеграция
3. ✅ Базовые сервисы
4. ⏳ Полная миграция Dashboard компонента
5. ⏳ Миграция всех стилей
6. ⏳ Компоненты для модальных окон
7. ⏳ Тестирование

