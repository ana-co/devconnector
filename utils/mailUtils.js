import nodemailer from 'nodemailer';

export const sendRoomInvitation = ({ userFrom, userTo, roomId }) => {
  const callUrl = `${process.env.URL}/${userFrom._id.toString()}/call`;
  const htmlToSend = `<p>Hello, ${userTo.name}, </p>
        <p> You've got room invitation from ${userFrom.name}. </p> 
        <b>Room ID : ${roomId} </b> <br> <b>Start Call: ${callUrl}</b> <br>  `;

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.sendMail(
    {
      // to: 'davitashvilianna@gmail.com',
      to: userTo.email,
      subject: `Room invitation`,
      // text: text,
      html: htmlToSend,
    },
    (error, info) => {
      if (error) {
        handleError(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }
  );
};
