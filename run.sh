#!/bin/bash

echo "🚀 Запуск CryptoPredict приложения..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей сервера..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Установка зависимостей клиента..."
    cd client
    npm install
    cd ..
fi

# Создаем .env файл если его нет
if [ ! -f ".env" ]; then
    echo "⚙️ Создание файла конфигурации..."
    cp .env.example .env
fi

echo "✅ Все зависимости установлены!"
echo ""
echo "🔧 Для запуска приложения откройте два терминала:"
echo ""
echo "Терминал 1 (Сервер):"
echo "  npm run dev"
echo ""
echo "Терминал 2 (Клиент):"
echo "  npm run client"
echo ""
echo "🌐 Приложение будет доступно по адресу: http://localhost:3000"
echo "🔗 API сервер: http://localhost:3001"
echo ""
echo "📚 Документация: README.md"