const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

app = express();

app.get('/raspagem', (req, res) => {

    let url = 'https://rachacuca.com.br/quiz/animais/';
    let base = 'https://rachacuca.com.br';
    
    request(url, function (error, response, html) {
        if (!error) {
            let $ = cheerio.load(html);

            let titulo = $("title").text();
            titulo = titulo.replace(/ /g,"_");
            
            titulo = titulo.replace(/-/g, "_");

            let resultado = [];
            let codigo;
            
            $('.titulo').each(function (i) {
                
                codigo = $(this).find('a').attr('href').trim();
                resultado.push({
                    url: `${base}${codigo}`
                });
            
            });
            
            fs.writeFile(`${titulo}.json`, JSON.stringify(resultado, null, 4), function(err) {
                res.status(200).json(resultado);
            });
        }
    });
});

app.listen('8081')
console.log('Executando raspagem de dados na porta 8081...');

module.exports = app;