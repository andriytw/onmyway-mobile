# Hermes Encoding Fix

## Проблема

`pod install` не може завершитися через проблему з кодуванням в `hermes-engine.podspec`:
```
Invalid `hermes-engine.podspec` file: incompatible character encodings: BINARY (ASCII-8BIT) and UTF-8.
```

Це відома проблема з React Native 0.83.1 та кирилицею в шляху проєкту.

## Рішення

### Варіант 1: Використати JSC замість Hermes (рекомендовано)

Додайте в `ios/Podfile` перед `use_react_native!`:

```ruby
# Disable Hermes to avoid encoding issues
ENV['USE_HERMES'] = '0'
```

Потім:
```bash
cd ios
pod install
```

### Варіант 2: Перемістити проєкт в шлях без кирилиці

Створіть симлінк або перемістіть проєкт в шлях без кирилиці, наприклад:
```bash
ln -s "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile" ~/OnMyWayMobile
cd ~/OnMyWayMobile/ios
pod install
```

### Варіант 3: Оновити React Native

Оновіть React Native до новішої версії, де ця проблема виправлена:
```bash
npm install react-native@latest
```

---

**Рекомендація:** Використайте Варіант 1 (JSC замість Hermes) для швидкого рішення.



