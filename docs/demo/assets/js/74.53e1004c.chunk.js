(window.webpackJsonp=window.webpackJsonp||[]).push([[74],{495:function(n,t,e){"use strict";e.r(t),t.default="const {Scene, Label, Group} = spritejs;\nconst container = document.getElementById('stage');\nconst scene = new Scene({\n  container,\n  width: 1200,\n  height: 1200,\n});\n\nconst fglayer = scene.layer('fglayer');\nfglayer.canvas.style.backgroundColor = '#3f097a';\n\nconst group = new Group();\ngroup.attr({\n  pos: [600, 540],\n});\n\nfglayer.append(group);\n\nconst text1 = new Label('Hello World !');\n\ntext1.attr({\n  anchor: [0.5, 0.5],\n  font: 'bold 48px Arial',\n  fillColor: '#ffdc45',\n});\n\nconst text2 = new Label('SpriteJS.org');\ntext2.attr({\n  anchor: [0.5, 0.5],\n  y: 60,\n  font: 'bold 48px Arial',\n  fillColor: '#ffdc45',\n});\n\ngroup.animate([\n  {scale: 1.5, rotate: -30},\n  {scale: 1, rotate: 0},\n  {scale: 1.5, rotate: 30},\n], {\n  duration: 3000,\n  iterations: Infinity,\n  direction: 'alternate',\n});\n\ngroup.append(text1, text2);"}}]);