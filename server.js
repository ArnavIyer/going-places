var express=require('express');
var bodyparser=require('body-parser');
var path=require("path");
var multer=require("multer");
console.log(__dirname);
var app=express();
app.use(express.static('public'));
var upload = multer({ dest: __dirname + '/uploads/' });
// app.set('views', __dirname + '/views');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
 app.engine('html', require('ejs').renderFile);
app.get('/',(req,res)=>{
     res.render('some.ejs');
});
app.post('/',upload.single('upl'),(req,res)=>{
    console.log(req.body);
    console.log(req.file);
})
app.listen(3000,()=>{
    console.log("server is up");
})