
// Building a Complex Email Handler
const nodemailer = require('nodemailer') 
const pug = require('pug');
const{ htmlToText }= require('html-to-text');//npm i html-to-text
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_PASSWORD);

module.exports = class Email{
  constructor(user , url){//userDetalis , resteUrl
     this.to = user.email;
     this.firstName = user.name.split(' ')[0];
     this.url=url;
     this.from = `Bhesh Raj Neupane <${process.env.EMAIL_FROM}>`;
    // console.log(htmlToText)
  }

  newTransport(){
      if(process.env.NODE_ENV === 'production'){
         //Sendgrid
          return nodemailer.createTransport({
            service:'SendGrid',
            auth:{
              user:process.env.SENDGRID_USERNAME,
              pass:process.env.SENDGRID_PASSWORD
           }
         })
      }

      //development mode ;test on mailptrap using nodemailer
    return nodemailer.createTransport({
         // service:'Gmail',
         host:process.env.EMAIL_HOST,
         port:process.env.EMAIL_PORT,
         auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD   
          }
         });
       
     }


  //Send the actual email 
   async send(template , subject) {
  
      //1) Render HTML based templates

       //const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`)
     //htmlToString = fromString(html)
      // text: htmlToString
         //personalize :sending data also
      const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug` , 
         {
         firstName :this.firstName,
         url : this.url,
         subject
         })

      //2) Define email options
      const mailOptions = { 
         from: this.from,
         to : this.to ,
         subject:subject,
         html:html,
         text: htmlToText(html ,{
            wordwrap: 130
         })
         //text: htmlToText.fromString(html)
         //html also but not send it
         }

      //3) Create a transport and send email
      await this.newTransport().sendMail(mailOptions)
     //Note:sendMail was built in fxn to send email , which takes one arg as option for mail
      } //sendClosed


   async sendWelcome(){
      //send(template , subject)
      //welcome-->tempalte which created
      await  this.send('welcome' , 'Welcome to the Tour Family!')
    }
   async sendPasswordReset(){
      await this.send('passwordReset','Your password reset token(valid for only 10 minutes)')
   }

}// class Closed











