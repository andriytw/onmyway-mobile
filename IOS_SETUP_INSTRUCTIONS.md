# iOS Build Setup - Інструкції

## Поточна ситуація

Встановлення Homebrew та CocoaPods потребує sudo доступу (пароль адміністратора), який не можу надати автоматично.

## Рішення

Я створив скрипт `setup_ios_build.sh`, який автоматично виконає всі необхідні кроки.

### Варіант 1: Виконати скрипт (рекомендовано)

Відкрийте термінал і виконайте:

```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile"
./setup_ios_build.sh
```

Скрипт:
1. Перевірить чи встановлений Homebrew, якщо ні - встановить
2. Встановить CocoaPods через Homebrew
3. Перевірить встановлення CocoaPods
4. Встановить iOS залежності (`pod install`)

**Примітка:** Під час встановлення Homebrew вас попросять ввести пароль адміністратора.

---

### Варіант 2: Виконати команди вручну

Якщо хочете виконати кроки вручну:

#### Крок 1: Встановити Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Після встановлення, якщо ви на Apple Silicon Mac, додайте Homebrew до PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### Крок 2: Встановити CocoaPods
```bash
brew install cocoapods
```

#### Крок 3: Перевірити встановлення
```bash
pod --version
```

#### Крок 4: Встановити iOS залежності
```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile/ios"
pod install
cd ..
```

---

## Після встановлення

Після успішного виконання скрипта або команд, запустіть додаток:

```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile"
npm run ios
```

Або для вибору конкретного симулятора:

```bash
npx react-native run-ios --simulator="iPhone 15 Pro"
```

---

## Перевірка статусу

Після виконання скрипта, перевірте:

1. **Homebrew:**
   ```bash
   brew --version
   ```

2. **CocoaPods:**
   ```bash
   pod --version
   ```

3. **iOS Pods:**
   ```bash
   ls -la ios/Pods
   ```

Якщо всі команди виконуються успішно - все готово! 🎉



