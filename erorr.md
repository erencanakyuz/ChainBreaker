index.html:1090 Failed to initialize game: TypeError: canvas.getContext is not a function
    at WebGLRenderer.init (phaser.js:81404:25)
    at new WebGLRenderer (phaser.js:81377:14)
    at CreateRenderer (phaser.js:79638:29)
    at Game.boot (phaser.js:162701:9)
    at DOMContentLoaded (phaser.js:91974:9)
    at new Game (phaser.js:162673:9)
    at index.html:1088:26
(anonymous) @ index.html:1090Understand this error
phaser.js:79850 Uncaught TypeError: this.gameCanvas.getContext is not a function
    at new CanvasRenderer (phaser.js:79850:88)
    at CreateRenderer (phaser.js:79642:29)
    at Game.boot (phaser.js:162701:9)
    at DOMContentLoaded (phaser.js:91974:9)
    at new Game (phaser.js:162673:9)
    at index.html:1093:26