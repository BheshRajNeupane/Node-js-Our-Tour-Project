
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv') ;


// Function to Handle Uncaught Error
process.on('uncaughtException', err=> {
    console.log("UNCATCH EXCEPTION :\n Shutting down....!!!\n");
    
    console.log(` Referenceerror : ${err.name , err.message}\n`);
    process.exit(1);   
})

dotenv.config({path:'./config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
.connect(DB,{
    useNewUrlParser : true,
    useNewUrlIndex : true,
    useFindAndModify : false,
    useUnifiedTopology: true
    
}
)
.then( ()=>  console.log("DB connection was successful..!!"));

const port = process.env.PORT || 3008;

  const server = app.listen(port, ()=>{
      console.log(`Application running on port ${port}...`);   
  });  

// function to Handle  Unhandle Rejection
process.on('unhandledRejection', err => {
   console.log(err.name,err.message)
   console.log('UNHANDEL REJECTION:\n\n *Shutting Down...!!\n\n');
   server.close(()=>{
       process.exit(1);
   })
});


