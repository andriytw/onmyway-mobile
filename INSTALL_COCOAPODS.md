# Встановлення CocoaPods - Інструкції

## Проблема
Системний Ruby версії 2.6.10 застарілий. CocoaPods потребує Ruby >= 3.0.

## Рішення: Встановити Homebrew, потім CocoaPods

### Крок 1: Відкрийте Terminal.app

### Крок 2: Встановіть Homebrew
Виконайте в терміналі:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Коли з'явиться `Password:`, введіть:** `tsero1209`

Встановлення займе кілька хвилин.

### Крок 3: Додайте Homebrew до PATH
Після встановлення Homebrew, виконайте (для Apple Silicon Mac):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Або для Intel Mac:
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

### Крок 4: Перевірте Homebrew
```bash
brew --version
```

### Крок 5: Встановіть CocoaPods через Homebrew
```bash
brew install cocoapods
```

### Крок 6: Перевірте CocoaPods
```bash
pod --version
```

### Крок 7: Встановіть iOS залежності
```bash
cd "/Users/andriy/Library/CloudStorage/GoogleDrive-andriy.tw@gmail.com/Мой диск/!OnMyWay/onmyway---smart-ride-sharing/OnMyWayMobile/ios"
pod install
cd ..
```

---

## Альтернатива (якщо Homebrew не працює)

Можна спробувати встановити новішу версію Ruby через rbenv:

```bash
# Встановити rbenv через Homebrew (якщо Homebrew встановлений)
brew install rbenv ruby-build

# Встановити Ruby 3.2
rbenv install 3.2.0
rbenv global 3.2.0

# Встановити CocoaPods
gem install cocoapods
```

---

**Після виконання всіх кроків, повідомте мене, і я перевірю результат та запущу додаток!**



