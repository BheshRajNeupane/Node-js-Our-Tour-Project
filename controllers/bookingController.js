
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


const Tour = require('../models/tourModel'); //
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../Models/bookingModel');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

//  Integrating Stripe into the Back-End
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    //Information about session
    payment_method_types: ['card'], //
    success_url: `${req.protocol}://${req.get('host')}/?tour=${ req.params.tourID}&user=${req.user.id}$price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,

    customer_email: req.user.email,
    client_reference_id: req.params.tourID,

    ////product Information
    line_items: [
      {
        price_data: {
          product_data: { name: `${tour.name} Tour` },
          unit_amount: `${tour.price}` * 100,
          currency: 'usd',
          // images:[],
          //tax_behavior: 'exclusive',
        },

        quantity: 1,
      },
    ],
    mode: 'payment',
  });

 // 3) Create session as response
  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
 // next();
});

//  Creating New Bookings on Checkout Success
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //This is temporary ,because it's unsecure : everyone can make bookings without paying
  //after deployment we will make another

  // query = ?tour=${req.params.tourID}&user=${req.user.id}$price=${tour.price}`,

  const { tour, user, price } = req.query; //in success user after ? ..
  console.log(req.body);

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  //next();
  res.redirect(req.originalUrl.split('?')[0]); //ie  ${req.protocol}://${req.get('host')}/
  const session = req.body.session;

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});
