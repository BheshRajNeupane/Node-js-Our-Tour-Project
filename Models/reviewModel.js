
const Tour = require('./tourModel')

const mongoose = require('mongoose');
const reviewSchema= new mongoose.Schema(
    {
      review:{
          type:String,
          required:[true , 'Review can not be empty!']
      },
      rating:{
          type:Number,
          min:1,
          max:5
      },
      createdAt:{
          type:Date,
          default:Date.now()
      },
      tour:{ //<--------used in aggrigarate
          type:mongoose.Schema.ObjectId,
          ref:'Tour',
          required:[true, 'Review must belong to a user']
      },
      user:{
          type:mongoose.Schema.ObjectId,
          ref:'User',
          required:[true, 'Review must belong to a user']
      }
      },
      {
        toJSON:{virtuals:true},
        toObj:{virtuals:true}
      }

     )//end schema

//Preventing Dublicate Review

reviewSchema.index({tour:1,user:1} ,{unique:true})
//combination of tour and user should be unique

reviewSchema.pre(/^find/ , function(next){
        this.populate({ //for user
           path:'user',
           select:'name photo'
        })
        next();
    })
        
      ;


   //------------------ Calculating Average Rating on Tours ----------



//Using Static Methods of Mongoose

reviewSchema.statics.calcAverageRating = async function(tourId){
  const stats = await this.aggregate([
{
    $match:{tour:tourId}
},
{
    $group:{
        _id:'$tour', 
        nRating:{ $sum:1},
        avgRating:{$avg:'$rating'}
    }
}
  ])//aggreation closed


//filling data in Tour
if(stats.length > 0){
    await Tour.findByIdAndUpdate(tourId, {
        ratingQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    
    })
}else{ 

await Tour.findByIdAndUpdate(tourId, {
    ratingQuantity:0,
    ratingsAverage:4.8//default review creating
})
}

}//end static method

reviewSchema.post('save', function(){
    this.constructor.calcAverageRating(this.tour)
})


reviewSchema.pre(/^findOneAnd/ , async function(next){ 
    console.log(this);  
    this.r = await this.findOne() 
    next();
    
})
//note :here we pass data from pre middleware to post middleware

reviewSchema.post(/^findOneAnd/ , async function(){
    await this.r.constructor.calcAverageRating(this.r.tour)
    //this.r = await this.findOne() : doesnot work here,query has already executed
   // console.log(this.r);
    //console.log(this);
})


const Review = mongoose.model('Review' , reviewSchema);
module.exports = Review;