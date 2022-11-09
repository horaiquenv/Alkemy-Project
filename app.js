const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const multer = require("multer");

const indexRouter = require('./routes/index')

const port = process.env.PORT || 3000

const app = express()
app.use(cors())

app.set("views", path.join(__dirname, "views"));
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/images"),
  
  filename:(req, file, cb)=>{
    let imageName = Date.now() + "-" + path.extname(file.originalname);
    cb(null, imageName)
  }
})

app.use(multer({
  storage,
   dest: path.join(__dirname, "public/images"),
   fileFilter:(req,file,cb)=>{
    const filetypes = /image|png|jpg|svg|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname))
    if(mimetype && extname){
      return cb(null, true)
    }
    cb("Debe ser una imagen valida")
   }
}).single("image"))


app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})


app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor funcionando en el puerto ${port}`)
  
})



function verifyToken(req, res, next) {
  jwt.verify(
    req.headers["x-access-token"],
    req.app.get("secretKey"),
    function (err, decode) {
      if (err) {
        res.json({ message: err.message });
      } else {
        console.log(decode);
        next();
      }
    }
  );
}

app.verifyToken = verifyToken;

module.exports = app
