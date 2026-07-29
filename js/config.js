var CONFIG = {
  timeline: {
    firstMeet: '2026-07-23T04:31:00+08:00',
    becomeCouple: '2026-07-27T00:00:00+08:00'
  },
  loadingText: '\u6b63\u5728\u52a0\u8f7d\u6211\u4eec\u7684\u6545\u4e8b\u2026\u2026',
  messages: [
    '\u597d\u597d\u5403\u996d',
    '\u8bb0\u5f97\u559d\u6c34',
    '\u4e0d\u8981\u71ac\u591c',
    '\u65e9\u70b9\u4f11\u606f',
    '\u6bcf\u5929\u5f00\u5fc3',
    '\u7167\u987e\u597d\u81ea\u5df1',
    '\u5e73\u5b89\u987a\u5229',
    '\u987a\u987a\u5229\u5229',
    '\u7d2f\u4e86\u5c31\u505c\u4e00\u4e0b',
    '\u4e0d\u8981\u59d4\u5c48\u81ea\u5df1',
    '\u9047\u5230\u56f0\u96be\u4e0d\u8981\u6015',
    '\u5e0c\u671b\u4f60\u6bcf\u5929\u90fd\u6709\u597d\u5fc3\u60c5',
    '\u4f60\u5f88\u597d',
    '\u6162\u6162\u6765',
    '\u6211\u5728\u5462',
    '\u4eca\u5929\u4e5f\u8981\u5fae\u7b11',
    '\u821f\u821f\uff0c\u4f60\u597d',
    '\u821f\u821f\u6700\u68d2',
    '\u5e78\u798f\u5feb\u4e50',
    '\u6c38\u8fdc\u5feb\u4e50',
    '\u4e00\u76f4\u5728\u4e00\u8d77',
    '\u611f\u8c22\u9047\u89c1',
    '\u4f60\u662f\u6211\u7684\u5c0f\u5e78\u8fd0',
    '\u6bcf\u4e00\u5929\u90fd\u5f88\u91cd\u8981'
  ],
  texts: {
    storyTitle: '\u6211\u4eec\u7684\u6545\u4e8b',
    chapter1Title: '\u7b2c\u4e00\u6b21\u76f8\u9047',
    chapter1Time: '2026\u5e747\u670823\u65e5 \u00b7 \u51cc\u66684:31',
    chapter1Desc: '\u6545\u4e8b\u4ece\u8fd9\u4e2a\u51cc\u6668\u5f00\u59cb\u3002\n\u4f60\u597d\uff0c\u821f\u821f\u3002',
    chapter2Title: '\u5f00\u542f\u60c5\u4fa3\u5173\u7cfb',
    chapter2Time: '2026\u5e747\u670827\u65e5',
    chapter2Desc: '\u4ece\u8fd9\u4e00\u5929\u5f00\u59cb\uff0c\n\u6211\u4eec\u7684\u6545\u4e8b\u8fdb\u5165\u65b0\u7684\u9636\u6bb5\u3002',
    videoIntro: '\u6709\u4e00\u6bb5\u65cb\u5f8b\uff0c\u6211\u60f3\u7559\u7ed9\u4f60\u3002',
    finalLine1: '\u8c22\u8c22\u4f60\u6765\u5230\u6211\u7684\u4e16\u754c\u3002',
    finalLine2: '\u613f\u4ee5\u540e\u7684\u6bcf\u4e00\u5929\uff0c\n\u90fd\u80fd\u6210\u4e3a\u65b0\u7684\u7eaa\u5ff5\u65e5\u3002',
    videoOverlays: [
      '\u5e0c\u671b\u4f60\u6bcf\u5929\u90fd\u5f00\u5fc3\uff0c\u821f\u821f',
      '\u5e0c\u671b\u4f60\u4e00\u76f4\u7167\u987e\u597d\u81ea\u5df1',
      '\u7d2f\u7684\u65f6\u5019\u8bb0\u5f97\u4f11\u606f',
      '\u4f60\u6c38\u8fdc\u503c\u5f97\u88ab\u6e29\u67d4\u5bf9\u5f85'
    ]
  },
  paths: {
    avatarMe: 'assets/avatar/me.jpg',
    avatarHer: 'assets/avatar/her.jpg',
    photos: [ 'assets/photo/1.jpg', 'assets/photo/2.jpg', 'assets/photo/3.jpg' ],
    video: 'assets/video/memory.mp4',
    music: 'assets/music/music.mp3'
  },
  particles: {
    starCount: 80,
    messageCount: 24,
    msgMinFont: 14,
    msgMaxFont: 34,
    heartParticleCount: 2000,
    convergeSpeed: 0.02,
    orbitCount: 60,
    breathAmplitude: 0.08,
    breathPeriod: 3000
  },
  colors: {
    bgStart: '#0a0e1a',
    bgEnd: '#1a1a2e',
    textHueRange: [280, 360],
    textSaturation: 75,
    textLightness: [55, 85],
    heartAccent: '#ff6b8a',
    heartGlow: '#ff2d55'
  },
  timing: {
    loadingDuration: 5000,
    floatDuration: 12000,
    convergeDuration: 7000,
    heartFormDelay: 2000,
    timelineDelay: 2500,
    videoIntroDisplay: 3000,
    videoFadeTransition: 1500,
    finalDisplay: 10000
  },
  eggs: {
    tripleClickThreshold: 3,
    tripleClickWindow: 1500,
    longPressThreshold: 3000
  },
  performance: {
    retinaScale: true,
    targetFPS: 60,
    throttleInterval: 16
  }
};

