const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

// Uploading Multiple Images: Tours
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); //if no err,return true
  } else {
    cb(new AppError('Not an image! Please upload only an image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 }, //[0]
  { name: 'images', maxCount: 3 }, // [1]
]);
//after this  file properties in req ie req.file

//note
/* ways to upload img

upload.single('fieldName')-->req.file
upload.array('fieldName' , max.NO.Img)-->req.files
upload.fields({},{})-->req.files
*/

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1) Resize Cover Image and put in req to update DB

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg;`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) Resizes Images and put in req , to updateDB
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg;`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename); //each time each image push
    })
  );
  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

//passing (model ,populateOption)
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.creatTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

// Aggregation Pipeline: Matching and Grouping
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
}); //getTourStatsClosed

//  Aggregation Pipeline: Unwinding and Projectin
exports.getMOnthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $sort: { numToursStarts: -1 },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $limit: 5,
    },
  ]);
  res.status(200).json({
    result: plan.length,
    status: 'success',
    data: {
      plan,
    },
  });
});

// --GeoSpatial Query--------------------

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  
  //radius is in radian -->for mongoDB
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,log',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  // tourSchema.index({startLocation:'2dsphere'})

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

//Geospatial Aggregation: Calculating Distances

//Calculating distance from center point/certian point to eact Tour loaction

exports.getDistances = catchAsync(async (req, res, next) => {
  console.log('dis');
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; 

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,log',
        400
      )
    );
  }

 

  const distance = await Tour.aggregate([
    {
  
      $geoNear: {
      
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], //
        },
  
        distanceField: 'distance',

        distanceMultiplier: multiplier,
      }, //near closed
    }, 
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]); //aggereated closed

  res.status(200).json({
    status: 'success',
    data: {
      distance,
    },
  });
}); //exports. closed
