(window.webpackJsonp=window.webpackJsonp||[]).push([[73],{494:function(n,e,t){"use strict";t.r(e),e.default="(async function () {\n  /* globals dat */\n  const {Scene, Sprite, Group} = spritejs;\n  const container = document.getElementById('stage');\n  const scene = new Scene({\n    container,\n    width: 1200,\n    height: 1200,\n  });\n\n  await scene.preload([\n    '//p.ssl.qhimg.com/t01293283c63b01af00.png',\n    '//s.ssl.qhres.com/static/ee4e193568c3ffcb.json',\n  ]);\n\n  const layer = scene.layer('fglayer');\n  layer.canvas.style.backgroundColor = '#FFFDCC';\n\n  const group = new Group();\n  group.name = 'group';\n  group.attr({\n    pos: [380, 460],\n  });\n  layer.append(group);\n\n  const guanguan = new Sprite('guanguan.png');\n  guanguan.name = 'guanguan';\n  guanguan.attr({\n    pos: [200, 10],\n  });\n  group.append(guanguan);\n\n  const lemon = new Sprite('lemon.png');\n  lemon.name = 'lemon';\n  lemon.attr({\n    pos: [10, 80],\n    scale: 0.5,\n  });\n  group.append(lemon);\n\n  window.scene = scene;\n  window.lemon = lemon;\n  window.guanguan = guanguan;\n  window.group = group;\n\n  const initGui = () => {\n    const gui = new dat.GUI();\n    const config = {\n      choosen: 'lemon',\n      initObject: lemon,\n    };\n    const x = gui.add({x: config.initObject.attributes.x}, 'x', 0, 800).onChange((val) => {\n      config.initObject.attr({\n        x: val,\n      });\n    });\n    const y = gui.add({y: config.initObject.attributes.y}, 'y', 0, 800).onChange((val) => {\n      config.initObject.attr({\n        y: val,\n      });\n    });\n    gui.add(config, 'choosen', ['lemon', 'guanguan', 'group']).onChange((val) => {\n      config.initObject = layer.getElementsByName(val)[0] || group.getElementsByName(val)[0];\n      x.setValue(config.initObject.attributes.x);\n      y.setValue(config.initObject.attributes.y);\n    });\n  };\n\n  initGui();\n}());"}}]);