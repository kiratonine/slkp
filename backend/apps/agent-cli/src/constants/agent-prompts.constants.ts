export const AGENT_MESSAGES = {
  started: 'AI Agent started.',
  enterCommand: 'Введите команду:',
  bridgeDetected: '[agent] Обнаружена команда подключения S1lk x402 Bridge',
  bridgeInit: '[agent] Подключаю payment capability...',
  bridgeEnabled: '[agent] S1lk x402 Bridge успешно подключён',
  askSessionToken: '[agent] Вставьте sessionToken:',
  sessionStored: '[agent] Session token сохранён в runtime',
  readyForPayments:
    '[agent] Теперь я могу оплачивать x402-запросы через S1lk x402 Bridge',
  unknownCommand: '[agent] Неизвестная команда. Попробуйте снова.',
  bridgeNotEnabled:
    '[agent] S1lk x402 Bridge ещё не подключён. Сначала подключите решение.',
  sessionMissing:
    '[agent] Session token ещё не задан. Сначала подключите bridge и вставьте token.',
  runningPremiumFlow: '[agent] Выполняю premium payment flow...',
} as const;