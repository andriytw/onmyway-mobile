#!/bin/bash
# Скрипт для перевірки статусу компіляції iOS додатку

echo "🔍 Перевірка статусу компіляції OnMyWayMobile"
echo "=============================================="
echo ""

# 1. Перевірка активних процесів
PROCESSES=$(ps aux | grep -E "xcodebuild|react-native.*run-ios" | grep -v grep | wc -l | tr -d ' ')
echo "📊 Активних процесів компіляції: $PROCESSES"
if [ "$PROCESSES" -gt 0 ]; then
    echo "   ✅ Компіляція ТРИВАЄ..."
    ps aux | grep -E "xcodebuild|react-native.*run-ios" | grep -v grep | head -2 | awk '{print "   PID:", $2, "-", $11, $12, $13}'
else
    echo "   ⏸ Компіляція ЗАВЕРШЕНА або не запущена"
fi
echo ""

# 2. Перевірка скомпільованого .app файлу
APP_PATH="ios/build/Build/Products/Debug-iphonesimulator/OnMyWayMobile.app"
if [ -d "$APP_PATH" ]; then
    echo "✅ Додаток СКОМПІЛЬОВАНО!"
    APP_SIZE=$(du -sh "$APP_PATH" 2>/dev/null | awk '{print $1}')
    MOD_TIME=$(stat -f "%Sm" -t "%H:%M:%S" "$APP_PATH" 2>/dev/null || stat -c "%y" "$APP_PATH" 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1)
    echo "   📦 Розмір: $APP_SIZE"
    echo "   ⏰ Останнє оновлення: $MOD_TIME"
else
    echo "⏳ Додаток ще НЕ скомпільовано..."
fi
echo ""

# 3. Перевірка встановлення на емулятор
SIMULATOR_ID="E6BD4A43-F7AA-43D5-8F17-20D14FD2FC4F"
if xcrun simctl get_app_container "$SIMULATOR_ID" com.onmywaymobile &>/dev/null; then
    echo "✅ Додаток ВСТАНОВЛЕНО на емулятор iPhone 17 Pro!"
else
    echo "⏳ Додаток ще НЕ встановлено на емулятор..."
fi
echo ""

# 4. Перевірка Metro bundler
if curl -s http://localhost:8081/status &>/dev/null; then
    echo "✅ Metro bundler ПРАЦЮЄ"
else
    echo "⚠️  Metro bundler не працює (можливо не запущений)"
fi
echo ""

# 5. Перевірка останніх повідомлень в логах
if [ -f /tmp/xcode-build.log ]; then
    echo "📋 Останні повідомлення з логу:"
    SUCCESS=$(tail -100 /tmp/xcode-build.log 2>/dev/null | grep -i "BUILD SUCCEEDED\|succeeded" | tail -1)
    FAILED=$(tail -100 /tmp/xcode-build.log 2>/dev/null | grep -i "BUILD FAILED\|failed\|error" | tail -1)
    
    if [ -n "$SUCCESS" ]; then
        echo "   ✅ $SUCCESS"
    fi
    if [ -n "$FAILED" ]; then
        echo "   ❌ $FAILED"
    fi
    if [ -z "$SUCCESS" ] && [ -z "$FAILED" ]; then
        echo "   ℹ️  Компіляція в процесі..."
        LAST_LINE=$(tail -1 /tmp/xcode-build.log 2>/dev/null | cut -c1-80)
        echo "   Останній рядок: $LAST_LINE..."
    fi
else
    echo "📋 Лог компіляції не знайдено"
fi
echo ""

# 6. Оцінка часу
if [ "$PROCESSES" -gt 0 ]; then
    echo "⏱️  Очікуваний час до завершення: 2-5 хвилин"
    echo "   (залежить від швидкості комп'ютера)"
fi
echo ""
echo "💡 Для повторної перевірки запустіть: ./check-build-status.sh"
echo "   або: bash check-build-status.sh"
