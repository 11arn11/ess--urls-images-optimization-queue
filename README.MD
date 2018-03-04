# ESS - URLs Images Optimization Queue
#### (Enhanced Sites Services)


### Installazione
```bash
node docker-compose up -d 
```


### Configurazione


### Utilizzo

###### Per ottenere le configurazioni disponibili
```bash
node index.js -c 
node index.js --config 
```

###### Per lanciare tutta la procedura
```bash
node index.js -s "site_name"
```

###### Per lanciare lo step 0 (crawling the site)
```bash
node step0.js -s "site_name"
```

###### Per lanciare lo step 1 (PageSpeedInsight)
```bash
node step1.js -s "site_name"
```

###### Per lanciare lo step 2 (PageSpeedOptimization)
```bash
node step2.js -s "site_name"
```

