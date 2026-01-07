# Xcode Setup Required

## Поточна ситуація

✅ CocoaPods встановлено через Bundler (версія 1.15.2)
⚠️ Xcode не встановлений (тільки Command Line Tools)
❌ `pod install` не може завершитися без повного Xcode

## Проблема

Для iOS розробки на React Native потрібен **повний Xcode**, а не тільки Command Line Tools.

## Рішення: Встановити Xcode

### Крок 1: Відкрийте App Store

### Крок 2: Знайдіть та встановіть Xcode
- Пошукайте "Xcode" в App Store
- Натисніть "Отримати" або "Встановити"
- Встановлення займе багато часу (Xcode ~15GB) та потребує місця на диску

### Крок 3: Після встановлення, налаштуйте xcode-select
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Коли з'явиться `Password:`, введіть:** `tsero1209`

### Крок 4: Прийміть ліцензію Xcode
```bash
sudo xcodebuild -license accept
```

**Коли з'явиться `Password:`, введіть:** `tsero1209`

### Крок 5: Встановіть додаткові компоненти (якщо потрібно)
Відкрийте Xcode один раз, щоб він встановив додаткові компоненти.

### Крок 6: Повторіть pod install
```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile/ios"
bundle exec pod install
cd ..
```

---

## Альтернатива: Використання Android

Якщо встановлення Xcode займе багато часу, можна спочатку налаштувати Android розробку:

1. Встановіть Android Studio
2. Налаштуйте Android SDK
3. Запустіть Android емулятор
4. Виконайте: `npm run android`

---

## Після встановлення Xcode

Після успішного встановлення Xcode та виконання `pod install`, запустіть iOS додаток:

```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile"
npm run ios
```

---

**Примітка:** Xcode займає приблизно 15GB дискового простору. Переконайтеся, що у вас достатньо місця перед встановленням.



