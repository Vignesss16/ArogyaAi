const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/hackx').then(async () => {
  const db = mongoose.connection.db;
  const patients = await db.collection('patients').find().toArray();
  console.log('ALL PATIENTS:');
  patients.forEach(p => console.log(p.name, p.phone));

  const visits = await db.collection('visits').find().toArray();
  console.log('\nALL VISITS:');
  visits.forEach(v => console.log(v.patientName, v.patientPhone));

  process.exit(0);
}).catch(console.error);
