import https from 'https';
https.get('https://clubeaquitem.com.br/api/scrape-status', (res) => {
    console.log('Status Code:', res.statusCode);
    res.on('data', d => process.stdout.write(d.toString()));
});
