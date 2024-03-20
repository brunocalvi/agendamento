const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const appointmentService = require("./services/appointmentService");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/agendamento");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/cadastro", (req, res) => {
  res.render("create");
});

app.post("/create", async (req, res) => {
  var status = await appointmentService.Create(
    req.body.name,
    req.body.email,
    req.body.description,
    req.body.cpf,
    req.body.date,
    req.body.time,
  );

  if(status) {
    res.redirect("/");
  } else {
    res.send("Ocorreu uma falha !");
  }
});

app.get("/getcalendar", async (req, res) => {
  var appointments = await appointmentService.GetAll(false);

  res.json(appointments);
});

app.get("/event/:id", async (req,res) => {
  let dados = await appointmentService.GetById(req.params.id);

  res.render("event", {'dados': dados});
});

app.post("/finish", async (req, res) => {
  id = req.body.id;
  let result = await appointmentService.Finish(id);

  res.redirect("/");
});

app.get("/list", async (req, res) => {
  let search = req.query.search;

  let resultSearch = await appointmentService.Search(search);
  let appos = await appointmentService.GetAll(true);

  if(search == undefined || search == '') {
    res.render("list", {'dados': appos});

  } else {
    res.render("list", {'dados': resultSearch});
    
  }
});

var pollTime = 1000 * 60 * 1;

setInterval(async () => {
  await appointmentService.SendNotification();
}, pollTime);

app.listen(8686, () => {
  console.log("Servidor rodando na porta 8686 !");
});