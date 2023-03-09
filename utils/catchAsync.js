
// nice Trick 

//  const catchAsync = fn =>{ 
//     //this is called as creatTour hit
//     return (req,res,next) => { //return anoynomus function by catchAsync
//     // calling 
//     fn(req,res,next).catch(err => next(err)); //note 
//     }
// }



module.exports = fn =>{ 
   
    return (req,res,next) => { 
    // calling 
    fn(req,res,next).catch(err => next(err)); 
    }
}