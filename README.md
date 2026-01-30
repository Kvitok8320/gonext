# GoNext

Минимальное приложение на **Expo Router** + **TypeScript** с **React Native Paper** (Expo SDK 54).

## Экран Home

- **AppBar** с заголовком «GoNext»
- В центре экрана:
  - Текст: «Привет, React Native Paper!»
  - Кнопка: «Нажми меня»
- При нажатии на кнопку показывается **Snackbar** с текстом: «Кнопка нажата»

## Запуск

```bash
npm install
npx expo start
```

- **iOS/Android:** отсканируйте QR-код в Expo Go
- **Web:** в меню нажмите `w` или `npx expo start --web`

## Зависимости (SDK 54)

- Expo ~54.0.0, React 19.1.0, React Native 0.81.5
- expo-router, react-native-paper
- expo-constants, expo-linking, react-native-safe-area-context, react-native-screens
- react-dom, react-native-web (для веб-платформы)

Проверка совместимости: `npx expo-doctor`
