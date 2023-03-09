
const express = require('express');
const app = express();
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize') 
const xss = require('xss-clean');
const hpp = require('hpp'); 
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const multer = require('multer');
const path = require('path'); 
const cors = require('cors')
app.use(cors()); 

app.set('view engine','pug' );
app.set('views',path.join(__dirname , 'views'))


// 1)Global Middleware

//Serving static file
app.use(express.static(path.join( __dirname, 'public')));

//Set security HTTP headers 
app.use(helmet());
//Development Logging
if(process.env.NODE_ENV ==='development'){
app.use(morgan('dev'))
}


//--------implementing Rate Limiting---(security)--
const limiter =  rateLimit({ 
 max:100,
 windowMs:60 * 60 * 1000,
 message:'To many request from this IP , please try again in hour'   
})
app.use( '/api',limiter);





//Body parser , data from body into req.body
  
     app.use(express.json({limit:'10kb'}));
     app.use(cookieParser())

//Data sanitization against NoSQL query injection( write after body-parser)
app.use(mongoSanitize());


//Data sanitization against XSS (write before route)
app.use(xss());
 

//Prevent parameter pollution
app.use(
    hpp({
      whitelist:[
       'deuration',
       'ratingsQuantity',
       'ratingAverage',
       'maxGroupSize',
       'difficulty',
       'price'
    ]
}))

//Serving static file
//app.use(express.static(`${__dirname}/public/`));
app.use(express.static(path.join( __dirname, 'public')));





//3;ROutes
// app.get('/', (req, res)=>{
//     res.status(200).render('base');

// })

app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

// Error Handaling
app.all( ' * ' , (req,res,next)=>{
     next( new AppError(`Can't find ${req.originalUrl} on this server!`,404));
    });


    //plugIn GlobalError HAndler 
    app.use(globalErrorHandler);

module.exports = app; 
