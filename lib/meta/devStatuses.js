

module.exports = {
  mockup: {
    id: 'mockup',
    description: 'Заглушка.'
  },
  experimental: {
    id: 'experimental',
    description: 'Метод может не работать или работать не корректно. Параметры вызова, ответ или документация могут еще поменяться.'
  },
  alpha: {
    id: 'alpha',
    description: 'Все работает, но могут быть доработки. В том числе могут добавляться новый поля в ответе.'
  },
  beta: {
    id: 'beta',
    description: 'Все работает стабильно.'
  },
  release: {
    id: 'release',
    description: 'Все работает, больше ничего не меняется. Любые изменения будут уже в другой версии.'
  }
};