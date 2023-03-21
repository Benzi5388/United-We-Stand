const nodemailer =require('nodemailer')
 function sentOTP(email, otp){
    return new Promise((resolve, reject)=>{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: "benzi5388@gmail.com",
              pass: "qemlosevhykkkccn",
            },
          });
      
            var mailOptions={
              from: "benzi5388@gmail.com",
              to: email,
              subject: "E-cart Email verification",
              html: `
              <h1>Verify Your Email For E-cart</h1>
                <h3>use this code in E-cart to verify your email</h3>
                <h2>${otp}</h2>
              `,
            }
        
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                reject(error)

              } else {
                resolve({success:true, message:"Email sent successfull"})
              }
            });
    })
}


module.exports=sentOTP;