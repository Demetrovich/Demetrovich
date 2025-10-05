#!/bin/bash

echo "🚀 Запуск CryptoPredict приложения..."

# Проверяем, установлены ли зависимости
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

echo "🔧 Настройка завершена!"
echo ""
echo "Для запуска приложения выполните:"
echo "1. npm run dev    - запуск сервера"
echo "2. npm run client - запуск клиента (в другом терминале)"
echo ""
echo "Или используйте:"
echo "npm run install-all - установка всех зависимостей"
echo ""
echo "Приложение будет доступно по адресу: http://localhost:3000"