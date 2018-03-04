# ESS - URLs Images Optimization Queue
#### (Enhanced Sites Services)


### Installazione
```bash
node docker-compose up -d 
```


### Configurazione
modifica il file config.js

### Utilizzo

###### Per avviare la Web  GUI per monitorare le code di lavoro
```bash
node nodeJS/gui/arena.js
```

###### Per utilizzare la Web GUI
```
http://localhost:4567/
```

###### Per ottenere le configurazioni disponibili
```bash
node nodeJS/index.js -c 
node nodeJS/index.js --config 
```

###### Per lanciare tutta la procedura
```bash
node nodeJS/index.js -s "site_name"
```

###### Per lanciare lo step 0 (crawling the site)
```bash
node nodeJS/step0.js -s "site_name"
```

###### Per lanciare lo step 1 (PageSpeedInsight)
```bash
node nodeJS/step1.js -s "site_name"
```

###### Per lanciare lo step 2 (PageSpeedOptimization)
```bash
node nodeJS/step2.js -s "site_name"
```

