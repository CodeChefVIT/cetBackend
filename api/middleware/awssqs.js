const AWS = require('aws-sdk');
require("dotenv").config()


const SES_CONFIG = {
    accessKeyId: global.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: global.env.AWS_SECRET_ACCESS_KEY,
    region: 'ap-south-1',
};

const AWS_SES = new AWS.SES(SES_CONFIG);

let params = {
    Source: 'contact@codechefvit.com',
    Destination: {
        ToAddresses: [
            'jugalbhatt3@gmail.com'
        ],
    },
    ReplyToAddresses: [],
    Message: {
        Body: {
            Html: {
                Charset: 'UTF-8',
                Data: `<!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:o="urn:schemas-microsoft-com:office:office">
            
            <head>
                <title>Welcome to CET</title>
                <!--[if !mso]><!-- -->
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <!--<![endif]-->
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                    #outlook a {
                        padding: 0;
                    }
            
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
            
                    table,
                    td {
                        border-collapse: collapse;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
            
                    img {
                        border: 0;
                        height: auto;
                        line-height: 100%;
                        outline: none;
                        text-decoration: none;
                        -ms-interpolation-mode: bicubic;
                    }
            
                    p {
                        display: block;
                        margin: 13px 0;
                    }
                </style>
                <!--[if mso]>
                    <xml>
                    <o:OfficeDocumentSettings>
                      <o:AllowPNG/>
                      <o:PixelsPerInch>96</o:PixelsPerInch>
                    </o:OfficeDocumentSettings>
                    </xml>
                    <![endif]-->
                <!--[if lte mso 11]>
                    <style type="text/css">
                      .mj-outlook-group-fix { width:100% !important; }
                    </style>
                    <![endif]-->
                <style type="text/css">
                    @media only screen and (min-width:480px) {
                        .mj-column-per-100 {
                            width: 100% !important;
                            max-width: 100%;
                        }
                    }
                </style>
                <style type="text/css">
                    @media only screen and (max-width:480px) {
                        table.mj-full-width-mobile {
                            width: 100% !important;
                        }
            
                        td.mj-full-width-mobile {
                            width: auto !important;
                        }
                    }
                </style>
            </head>
            
            <body style="background-color:#F4F4F4;">
                <div style="background-color:#F4F4F4;">
                    <!--[if mso | IE]>
                  <table
                     align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                  >
                    <tr>
                      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                  <![endif]-->
                    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#ffffff;background-color:#ffffff;width:100%;">
                            <tbody>
                                <tr>
                                    <td
                                        style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:30px;text-align:center;">
                                        <!--[if mso | IE]>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            
                    <tr>
                  
                        <td
                           class="" style="vertical-align:top;width:600px;"
                        >
                      <![endif]-->
                                        <div class="mj-column-per-100 mj-outlook-group-fix"
                                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                style="vertical-align:top;" width="100%">
                                                <tr>
                                                    <td align="center"
                                                        style="font-size:0px;padding:10px 25px;padding-bottom:15px;word-break:break-word;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                            style="border-collapse:collapse;border-spacing:0px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="width:250px;"> <a href="https://www.codechefvit.com"
                                                                            target="_self">
            
                                                                            <img height="auto"
                                                                                src="https://i.ibb.co/bBFKmLx/CETHeader.png"
                                                                                style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                                                width="250" />
            
                                                                        </a> </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]>
                        </td>
                      
                    </tr>
                  
                              </table>
                            <![endif]-->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--[if mso | IE]>
                      </td>
                    </tr>
                  </table>
                  
                  <table
                     align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                  >
                    <tr>
                      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                  <![endif]-->
                    <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#FFFFFF;background-color:#FFFFFF;width:100%;">
                            <tbody>
                                <tr>
                                    <td
                                        style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:0px;text-align:center;">
                                        <!--[if mso | IE]>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            
                    <tr>
                  
                        <td
                           class="" style="vertical-align:top;width:600px;"
                        >
                      <![endif]-->
                                        <div class="mj-column-per-100 mj-outlook-group-fix"
                                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                style="vertical-align:top;" width="100%">
                                                <tr>
                                                    <td align="center"
                                                        style="font-size:0px;padding:10px 25px;padding-top:30px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                            style="border-collapse:collapse;border-spacing:0px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="width:150px;"> <img height="auto"
                                                                            src="https://i.ibb.co/VppxmWZ/cet.png"
                                                                            style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                                            width="150" /> </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]>
                        </td>
                      
                    </tr>
                  
                              </table>
                            <![endif]-->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--[if mso | IE]>
                      </td>
                    </tr>
                  </table>
                  
                  <table
                     align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                  >
                    <tr>
                      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                  <![endif]-->
                    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#ffffff;background-color:#ffffff;width:100%;">
                            <tbody>
                                <tr>
                                    <td
                                        style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:0px;text-align:center;">
                                        <!--[if mso | IE]>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            
                    <tr>
                  
                        <td
                           class="" style="vertical-align:top;width:600px;"
                        >
                      <![endif]-->
                                        <div class="mj-column-per-100 mj-outlook-group-fix"
                                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                style="vertical-align:top;" width="100%">
                                                <tr>
                                                    <td align="left"
                                                        style="font-size:0px;padding:10px 25px;padding-top:30px;padding-right:40px;padding-bottom:20px;padding-left:40px;word-break:break-word;">
                                                        <div
                                                            style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#55575d;">
                                                            <p style="margin: 10px 0;font-size:15px; color:#151e23; font-family:Georgia,Helvetica,Arial,sans-serif; color:#000000"
                                                                align="left">Hey,<br /><br /> Your email
                                                                <codechefvit@gmail.com> has been whitelisted and can now be used to
                                                                    sign up on <a href="https://cet-portal.codechefvit.com"
                                                                        style="color: #E31E43">Common Entry
                                                                        Test</a>.<br /><br /> Following email signup, you will be
                                                                    sent a verification code on this email address
                                                                    <codechefvit@gmail.com>
                                                                        in order to verify signup. You can then complete your
                                                                        profile and feature your club on the portal. <br /><br />
                                                                        <i>Note- Featuring your club will lead to every student
                                                                            being able to see your profile details. Make sure you do
                                                                            this after completing your profile!</i><br /><br /> You
                                                                        can then go on, create a test with appropriate details, and
                                                                        then add domains (like technical, management, design) to the
                                                                        test. The starting and ending dates of the test will be the
                                                                        test window within which the students
                                                                        can attempt the domains for the mentioned duration.
                                                                        <br /><br /> Following this, you can add questions of the
                                                                        following type to the domain of your choice:<br /> 1. Single
                                                                        correct MCQ<br /> 2. Multiple correct MCQ<br /> 3. Short
                                                                        answer<br /> 4. Long answer<br /> All of these types support
                                                                        uploading a photo/video/audio file as media. <br /><br />
                                                                        Once you are done creating and have finalized a test, you
                                                                        can <span style="color: #E31E43">publish</span> it. This
                                                                        will allow all students to apply for the test. You can also
                                                                        add students (who have signed up on the portal) directly to
                                                                        the test by providing their email IDs in the mentioned
                                                                        field. This option might come in handy
                                                                        when you don’t want a test to be visible to everyone, like
                                                                        promoting students to the next round. Once the test is done,
                                                                        you can easily view how many students have finished the test
                                                                        and their responses on the portal itself.<br /><br /> If you
                                                                        wish to export an Excel Sheet or CSV of responses or
                                                                        registered students at any time, or if something goes wrong,
                                                                        our tech team will be more than happy to help you. Just
                                                                        shoot an email to
                                                                        <cet.codechefvit@gmail.com>
                                                                            and we will get back to you at the earliest.<br /><br />
                                                                            Good luck!<br /> Regards, <br /> Team CodeChef-VIT<br />
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]>
                        </td>
                      
                    </tr>
                  
                              </table>
                            <![endif]-->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--[if mso | IE]>
                      </td>
                    </tr>
                  </table>
                  
                  <table
                     align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
                  >
                    <tr>
                      <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
                  <![endif]-->
                    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                            style="background:#ffffff;background-color:#ffffff;width:100%;">
                            <tbody>
                                <tr>
                                    <td
                                        style="direction:ltr;font-size:0px;padding:20px 0;padding-bottom:0px;padding-top:0px;text-align:center;">
                                        <!--[if mso | IE]>
                              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            
                    <tr>
                  
                        <td
                           class="" style="vertical-align:top;width:600px;"
                        >
                      <![endif]-->
                                        <div class="mj-column-per-100 mj-outlook-group-fix"
                                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                style="vertical-align:top;" width="100%">
                                                <tr>
                                                    <td align="center"
                                                        style="font-size:0px;padding:10px 25px;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px;word-break:break-word;">
                                                        <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                                            style="border-collapse:collapse;border-spacing:0px;">
                                                            <tbody>
                                                                <tr>
                                                                    <td style="width:600px;"> <a href="#" target="_self">
            
                                                                            <img height="auto"
                                                                                src="https://i.ibb.co/3kRVdbF/bottom-Banner-CET.pngeg"
                                                                                style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;"
                                                                                width="600" />
            
                                                                        </a> </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        <!--[if mso | IE]>
                        </td>
                      
                    </tr>
                  
                              </table>
                            <![endif]-->
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!--[if mso | IE]>
                      </td>
                    </tr>
                  </table>
                  <![endif]-->
                </div>
            </body>
            
            </html>`,
            },
        },
        Subject: {
            Charset: 'UTF-8',
            Data: `Hello,!`,
        }
    },
};

// let sendTemplateEmail = (recipientEmail) => {
//     let params = {
//       Source: '<email address you verified>',
//       Template: '<name of your template>',
//       Destination: {
//         ToAddresses': [ 
//           recipientEmail
//         ]
//       },
//       TemplateData: '{ \"name\':\'John Doe\'}'
//     };
//     return AWS_SES.sendTemplatedEmail(params).promise();
// };

return AWS_SES.sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
// sendPromise.then(
  // function(data) {
  //   console.log(data.MessageId);
  // }).catch(
  //   function(err) {
  //   console.error(err, err.stack);
  // });

// module.exports = {
//   sendEmail,
//   // sendTemplateEmail,
// };