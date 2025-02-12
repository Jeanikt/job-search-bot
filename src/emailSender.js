const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD
  }
});

async function sendJobsEmail(jobs) {
  const jobListHTML = jobs.map(job => `
    <li>
      <h3>${job.title}</h3>
      <p>Empresa: ${job.company}</p>
      <p>Localização: ${job.location}</p>
      <p>Fonte: ${job.source}</p>
      <a href="${job.url}">Ver Vaga</a>
    </li>
  `).join('');

  const mailOptions = {
    from: process.env.ZOHO_EMAIL,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Novas Vagas de Desenvolvedor (${jobs.length})`,
    html: `
      <h1>Novas Vagas de Desenvolvedor</h1>
      <p>Encontramos ${jobs.length} novas vagas:</p>
      <ul>${jobListHTML}</ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

module.exports = { sendJobsEmail };