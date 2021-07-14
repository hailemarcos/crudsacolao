const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
const bodyParser = require('body-parser');
const port = 3000; //porta padrão
const mysql = require('mysql2');
const multer = require('multer');
let data;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   //cb(null, './uploads/');
   cb(null, '/var/www/html/uploads/');
   },
  filename: function(req, file, cb) {
    data = new Date().toISOString().replace(/:/g, '-') + '-';
     cb(null, data + file.originalname);  
        
    }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
    fileFilter: fileFilter
});

// configurando body parse para pegar os POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// definindo as rotas
const router = express.Router();
router.get('/',(req, res) => res.json({ message: 'funcionando'}));
app.use('/', router);

//iniciar o servidor
app.listen(port);
console.log('API funcionando!');

function execSQLQuery(sqlqry, res){
    const connection = mysql.createConnection({
        host                 : 'localhost',
        port                 : 3306,
        user                 : 'haile',
        password             : 'password',  
        database             : 'senai115'
    });

    connection.query(sqlqry, function(error, results, fields){
       if(error)
         res.json(error);
       else
        res.json(results);
         connection.end();
         //console.log("Executou!");   
    });
}

router.get('/clientes', (req, res) => {
    execSQLQuery('SELECT * FROM clientes', res);
})



router.get('/clientes/:id?', (req, res) => {
  let filter = '';
  if(req.params.id) filter = ' WHERE id=' + parseInt(req.params.id);
  execSQLQuery('SELECT * FROM clientes' + filter, res); 
});

router.delete('/clientes/:id', (req, res) =>{
  execSQLQuery('DELETE FROM clientes WHERE id=' + parseInt(req.params.id), res);
});



router.post('/clientes', upload.single('imagem_clientes'), (req, res) => {

  const nome = req.body.nome.substring(0,150);
  const cpf = req.body.cpf.substring(0,11);
  const imagem = 'uploads/' + req.file.filename; 
//   try {
  // const imagem = 'uploads/' + req.file.filename;
//}
//catch (e) {
//imagem  = 'uploads/foto1.jpg';
//} 
    execSQLQuery(`INSERT INTO clientes(nome, cpf, imagem_clientes) VALUES('${nome}','${cpf}','${imagem}')`, res);
  
});

//router.patch('/clientes/:id', upload.single('imagem_clientes'), (req, res) => {
  router.patch('/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nome = req.body.nome.substring(0,150);
  const cpf = req.body.cpf.substring(0,11);
  execSQLQuery(`UPDATE clientes SET nome='${nome}', cpf='${cpf}'  WHERE id=${id}`, res);
  //const imagem = 'uploads/' + req.file.filename;
  //execSQLQuery(`UPDATE clientes SET nome='${nome}', cpf='${cpf}', imagem_clientes='${imagem}'  WHERE id=${id}`, res);
  
});
