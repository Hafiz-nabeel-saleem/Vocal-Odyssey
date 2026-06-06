require('dotenv').config();
const express = require('express');
const path = require('path');

const authRoutes = require('./routes/auth');
const supervisorRoutes = require('./routes/supervisor');
const childRoutes = require('./routes/child');
const levelRoutes = require('./routes/level');
const progressRoutes = require('./routes/progress');
const attemptRoutes = require('./routes/attempt');
const adminRoutes = require('./routes/admin');
const speechRoutes = require('./routes/speech');
const authentication = require('./middlewares/authentication');
const connect = require('./db/connect');

const app = express();

require('./middlewares/security')(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/supervisor', authentication, supervisorRoutes);
app.use('/api/v1/children', authentication, childRoutes);
app.use('/api/v1/levels', authentication, levelRoutes);
app.use('/api/v1/progress', authentication, progressRoutes);
app.use('/api/v1/attempts', authentication, attemptRoutes);
app.use('/api/v1/admin', authentication, adminRoutes);
app.use('/api/v1/speech', authentication, speechRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
      await connect(process.env.MONGO_URI);
      app.listen(PORT, () => {
          console.log(`Server listening on port ${PORT}`);
      });
  } catch (err) {
      console.log(err);
  }
}

start();
