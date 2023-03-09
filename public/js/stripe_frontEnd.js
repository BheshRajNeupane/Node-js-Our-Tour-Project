//RUN in HTTPS 

const stripe = Stripe('pk_test_51MY4vmD0Blb0JTsqg5YSwTFOhsPpliei9SafrZWRlCUDKCYmkAuZvA4FQrIM0OrU8dtBPIiSTRjL109jtjIIffF700WeEWHIew');



 const bookTour =  async tourId => {
     try{
 //1.Get checkout session from API
   const session = await axios(
     `/api/v1/bookings/checkout-session/${tourId}`
     )
     //console.log(session);
    

 //2. Create checkout form + charge credit card
  await stripe.redirectToCheckout({
      sessionId:session.data.session.id
  })
}
catch(err){
  //  console.log(err);
    alert(err.response.data.message);
}
 }




const bookBtn = document.querySelector('.Checkout-btn');

if(bookBtn)
{
    bookBtn.addEventListener('click' , e=>{
        e.target.textContent = 'Processing..'
        const tourId = e.target.dataset.tourId
        bookTour(tourId);
       //console.log(tourId);
    } )
}