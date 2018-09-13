const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

app = express();

const verificarPastas = ($, base) =>{
    let linksPastas = [];
    let codigo;
    $('.icones.pasta').each(function (i) {
        codigo = $(this).attr('href').trim();
        linksPastas.push({
            url: `${base}${codigo}`
        });
    });  
    return linksPastas;
};

const getLinks = ($, base) => {
    let codigo;
    let resultado = [];

    $('.titulo').each(function (i) {
                
        codigo = $(this).find('a').attr('href').trim();
        resultado.push({
            url: `${base}${codigo}`
        });
    
    });
    return resultado;
};

const getPastas = (url) => {
    request(url, function (error, response, html) {
        if (!error) {
            let $ = cheerio.load(html);

            let titulo = $("title").text();
            titulo = titulo.replace(/ /g,"_");
            
            titulo = titulo.replace(/-/g, "_");
            
            let resultado = [];
            
            //resultado.concat(...getLinks($));
            

            let urlsPastas = verificarPastas($);
            
            res.status(200).json(getLinks($));
            /*$('.titulo').each(function (i) {
                
                codigo = $(this).find('a').attr('href').trim();
                resultado.push({
                    url: `${base}${codigo}`
                });
            
            });
            
            fs.writeFile(`${titulo}.json`, JSON.stringify(resultado, null, 4), function(err) {
                res.status(200).json(resultado);
            });*/
        }
    });
}

const getUlr = (url) => {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, html) {
            if (error) {
                reject(error);
            }else{
                let $ = cheerio.load(html);
                resolve($);
            }
        });
    });
}

app.get('/raspagem', async (req, res) => {

    let url = 'https://rachacuca.com.br/quiz/celebridades/';
    let base = 'https://rachacuca.com.br';

    let $ = await getUlr(url);
    let titulo = $("title").text();
    titulo = titulo.replace(/ /g,"_");
    
    titulo = titulo.replace(/-/g, "_");

    let resultados = [];

    resultados.push(...getLinks($, base));

    let linksPastas = verificarPastas($, base);

    for(let i = 0; i < linksPastas.length; i++){
        let $ = await getUlr(linksPastas[i].url);
        resultados.push(...getLinks($, base));
    }
    console.log(resultados.length);
    res.status(200).json(resultados);
    
    
});

app.listen('8081')
console.log('Executando raspagem de dados na porta 8081...');

module.exports = app;