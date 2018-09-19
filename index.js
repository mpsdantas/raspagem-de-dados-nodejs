const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const FormData = require('form-data');
const axios = require('axios');
app = express();

const verificarPastas = ($, base) => {
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
            titulo = titulo.replace(/ /g, "_");

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
            } else {
                let $ = cheerio.load(html);
                resolve($);
            }
        });
    });
}

const obterQuestoes = (string) => {
    let arrayQuestoes = []
    let palavra = "";
    for (let i = 0; i < string.length; i++) {
        if (string[i] != "\n" && palavra == "") {
            palavra += string[i];
        } else if (string[i] != "\n") {
            palavra += string[i];
        } else if (palavra !== "") {
            let jsonPalavra = {
                descricao: palavra
            };
            arrayQuestoes.push(jsonPalavra);
            palavra = "";
        }
    }
    for (let i = 0; i < arrayQuestoes.length; i++) {
        if (arrayQuestoes[i].descricao == " " || arrayQuestoes[i].descricao == "") {
            arrayQuestoes.splice(i, 1);
        }
    }
    return arrayQuestoes;
}
app.get('/raspagem', async (req, res) => {

    let url = 'https://rachacuca.com.br/quiz/tv/';
    let base = 'https://rachacuca.com.br';

    let $ = await getUlr(url);
    let titulo = $("title").text();
    titulo = titulo.replace(/ /g, "_");

    titulo = titulo.replace(/-/g, "_");

    let resultados = [];

    resultados.push(...getLinks($, base));

    let linksPastas = verificarPastas($, base);

    for (let i = 0; i < linksPastas.length; i++) {
        let $ = await getUlr(linksPastas[i].url);
        resultados.push(...getLinks($, base));
    }

    fs.writeFile(`${titulo}.json`, JSON.stringify(resultados, null, 4), function (err) {
        res.status(200).json(resultados);
    })

});

app.get('/raspagem', async (req, res) => {

    let url = 'https://rachacuca.com.br/quiz/tv/';
    let base = 'https://rachacuca.com.br';

    let $ = await getUlr(url);
    let titulo = $("title").text();
    titulo = titulo.replace(/ /g, "_");

    titulo = titulo.replace(/-/g, "_");

    let resultados = [];

    resultados.push(...getLinks($, base));

    let linksPastas = verificarPastas($, base);

    for (let i = 0; i < linksPastas.length; i++) {
        let $ = await getUlr(linksPastas[i].url);
        resultados.push(...getLinks($, base));
    }

    fs.writeFile(`${titulo}.json`, JSON.stringify(resultados, null, 4), function (err) {
        res.status(200).json(resultados);
    })

});

app.get('/raspagem-2', async (req, res) => {

    let url = 'https://rachacuca.com.br/quiz/167935/felinos-ii/';
    let base = 'https://rachacuca.com.br';

    let $ = await getUlr(url);
    let questoes = [];
    $('ol>li').each(function (i) {
        let novaQuestao = {
            enunciado: '',
            alternativas: []
        }
        novaQuestao.alternativas = obterQuestoes($(this).find('ul>li').text());
        novaQuestao.enunciado = $(this).find('li>p').text();
        questoes.push(novaQuestao);
        obterQuestoes(novaQuestao.alternativas)
    });
    let arrayForm = $('#form-solve').serializeArray();
    console.log(arrayForm)
    let form = new FormData();
    for (let i = 0; i < arrayForm.length; i++) {
        form.append(arrayForm[i].name, arrayForm[i].value);
    }
});

app.listen('8081')
console.log('Executando raspagem de dados na porta 8081...');

module.exports = app;