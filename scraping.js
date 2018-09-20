const pasta = './data/';
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const {PythonShell} = require('python-shell');

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
};

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
};

const lerArquivo = () =>{
    return new Promise((resolve, reject) => {
        fs.readdir(pasta, (err, files) => {
            let arrayObj  = [];
            files.forEach(file => {
                let obj = JSON.parse(fs.readFileSync('./data/' + file, 'utf8'));
                arrayObj.push(...obj);
            });
            resolve(arrayObj);
        });
    });
};

const scraping = async (url) => {
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
    return questoes;
};

const pythonScript = async (url) =>{
    let options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: './python/',
        args: [`${url}`]
    };
    return new Promise((resolve, reject) => {
        PythonShell.run('script.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            let data = "";
            for(let i =0; i<results.length; i++) data = `${data}${results[i]}`;
            resolve(data);
            
        });
    }); 
}

const mainFunc = async () =>{
    let arrayArquivos = await lerArquivo();
    let index = parseInt(fs.readFileSync("./index.txt"));
    for(let i = 145; i<arrayArquivos.length; i++){
        
        let questoes = JSON.parse(fs.readFileSync("./questoes.json"));

        let questoesUrl = await scraping(arrayArquivos[i].url);
        
        let data = await pythonScript(arrayArquivos[i].url);
        let $ = cheerio.load(data);
        let categoria = $('#breadcrumb').find('li>a').text();
        categoria = categoria.replace('Racha CucaQuiz','');
        
        let contador = 0;
        $('ol>li').each(function (i) {
            questoesUrl[contador].corretaTexto = $(this).find('.resposta-correta').text();
            questoesUrl[contador].categoria = categoria;

            contador++;
        });

        questoes.push(...questoesUrl);

        let salvarQuestoes = JSON.stringify(questoes);

        fs.writeFileSync('index.txt', `${i}`, 'utf8');

        fs.writeFileSync('questoes.json', salvarQuestoes, 'utf8');

        fs.writeFileSync('informacoes.txt', `Indice do for: ${i}\nQuantidade de questões: ${questoes.length}`, 'utf8');

        console.log(`${questoes.length} questões salvas.`);
        
    }
    return true;
    console.log("Scraping finalizado :)")
      
    
};

while(1){
    try {
        if(mainFunc()) break;
    } catch (error) {
        continue;
    }
}



