
//  94 importing data from json file and save to database!!!!!!!!!!!!!!!!
const fs = require('fs')
const mongoose = require('mongoose');//
 const Tour = require('./../../models/tourModel')
 const Review = require('./../../models/reviewModel')
 const User = require('./../../models/userModel')
const dotenv = require('dotenv')// i 
dotenv.config({path:'./config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);// setting password

mongoose
.connect(DB,{

    useNewUrlParser : true,
    useNewUrlIndex : true,
    useFindAndModify : false
}).then( ()=>{
    
    console.log("DB connection successful!");
});
//READ JSON FILE
const tours =  JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
//IMPORT DATA INTO DB
const importData = async ()=>{

    try{
          await Tour.create(tours);
          console.log("Data successfull loaded");
      }
   catch(err){
        console.log(err);
    }
    process.exit();
}

//Delete all data from database
const deleteData = async ()=>{
     try{ 
         await Tour.deleteMany();//mango function
         console.log("Data successfull deleted!");
        }catch(err){
            console.log(err);
        }
        process.exit();
}

//console.log(process.argv);

 /*  1.equivalent to node :'C:\\Program    Files\\nodejs\\node.exe',

  2.equivalent to upto this file:
  'C:\\Users\\HP\\Desktop\\web\\Node js\\main\\starter\\dev-data\\data\\import-dev-data.js',
  3.--import  / --delete

  */
 
 if(process.argv[2]==='--import'){
     importData();
    }else if(process.argv[2] === '--delete'){
        deleteData();
    }
    //terminal:  node dev-data/data/import-dev-data.js --delete 

    // node dev-data/data/import-dev-data.js --import

 