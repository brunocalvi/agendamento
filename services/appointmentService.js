const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factores/AppointmentFactorey");
const mailer = require("nodemailer");

const Appo = mongoose.model("Appointment", appointment);

class AppointmentService {
  async Create(name, email, description, cpf, date, time) {
    var newAppo = new Appo({
      name,
      email,
      description,
      cpf,
      date,
      time,
      finished: false,
      notifield: false
    });

    try{
      await newAppo.save();
      return true;

    }catch(e) {
      console.log(e);
      return false;

    } 
  }

  async GetAll(showFinished) {
    if(showFinished) {
      return await Appo.find();

    } else {
      var appos = await Appo.find({'finished': false});
      var appointments = [];

      appos.forEach(appointment => {
        if(appointment.date != undefined) {
          appointments.push(AppointmentFactory.Build(appointment))
        };
      });

      return appointments;
    }
  }

  async GetById(id) {
    try {
      let event = await Appo.findOne({'_id': id});
      return event;
      
    } catch(e) {
      console.log(e);
    }
  }

  async Finish(id) {
    try {
      await Appo.findByIdAndUpdate(id, {finished: true});
      return true;

    }catch(e) {
      console.log(e);
      return false;
      
    }
  }

  async Search(query) {
    try {
      let appos = Appo.find().or([{email: query}, {cpf: query}]);
      return appos;

    }catch(e) {
      console.log(e);
      return [];
      
    }
  }

  async SendNotification() {
    let appos = await this.GetAll(false);

    let transporter = mailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 25,
      auth: {
        user: 'a8290562acf5ad',
        pass: 'dab0569cd4a430',
      }
    });

    appos.forEach(async app => {

      let date = app.start.getTime();
      let hour = 100 * 60 * 60;
      let gap = date - Date.now();

      if(gap <= hour) {
       
        if(!app.notifield) {
          await Appo.findByIdAndUpdate(app.id, {notifield: true});

          transporter.sendMail({
            from: "Victor Lima <victor@guia.com.br>",
            to: app.email,
            subject: "Sua consulta vai acontecer",
            text: "Fique atento ! A consulta esta chegando !!!",
          }).then(() => {
            console.log(`E-mail enviado ${app.email}`);

          }).catch(e => {
            console.log(e);
            
          });
        }
       

      }

    });
  }
}

module.exports = new AppointmentService();