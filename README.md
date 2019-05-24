# Demo of High Frequency usage on Pryv


Test it online on github [/generator/index.html?pryv-reg=reg.pryv.me](https://perki.github.io/pryv-app-web-hfdemo/generator/index.html?pryv-reg=reg.pryv.me)


Simple Random generator:  [generator/simplegen.html?pryv-reg=reg.pryv.me](https://perki.github.io/pryv-app-web-hfdemo/generator/simplegen.html?pryv-reg=reg.pryv.me)

Simple reader (to be used with simple generator):  [generator/reader.html?pryv-reg=reg.pryv.me](https://perki.github.io/pryv-app-web-hfdemo/generator/reader.html?pryv-reg=reg.pryv.me)


This web app will track your mouse and post it as a *series:xx/xx* event

### Implementation

- Mouse is tracked and x positions are buffered
- When connecting
	- An event of type 'series:count/generic' is created to hold the serie
- When connected
	- every `samplePostMs` milliseconds the buffer is posted

The app propose a link to an web app to monitor the events	

### Status

Preview version



### Todo

- include y
- use already exisiting item
- add link to viewer
