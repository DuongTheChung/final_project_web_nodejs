var express=require('express');
var path=require('path');
var bodyParser=require('body-parser');
var session=require('express-session');
var expressValidator=require('express-validator');
var mongoose=require('mongoose');
var config=require('./config/database');


mongoose.connect(config.database);
var db=mongoose.connection;
db.on('error',console.error.bind(console,'connect error'));
db.once('open',()=>{
    console.log('connect to MongoDB');
});



var app=express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname,'public')));

app.locals.errors=null;

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

app.use(expressValidator({
    errorFormatter :function(param,msg,value){
        var namespace=param.split('.')
        ,root=namespace.shift()
        ,formParam=root

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return{
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));

//express-message
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

var pages=require('./routes/pages');
var adminPages=require('./routes/admin_pages');

app.use('/admin/pages',adminPages);
app.use('/',pages);

var port=3000;
app.listen(port,()=>{
    console.log('Server started on port ' + port);
});

