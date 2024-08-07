const express = require('express');
const app = express();
const db = require('./database');
const path = require('path');
const requestIp = require('request-ip');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to log the IP address
app.use((req, res, next) => {
  const clientIp = requestIp.getClientIp(req);
  const isIPv6 = clientIp.includes(':') && !clientIp.includes('.');
  const ipv4 = isIPv6 ? null : clientIp;
  const ipv6 = isIPv6 ? clientIp : null;

  db.run(`INSERT INTO ip_addresses (ipv4, ipv6) VALUES (?, ?)`, [ipv4, ipv6], (err) => {
    if (err) {
      console.error(err.message);
    }
  });

  next();
});

// Utility function to get the client's IP address
function getClientIp(req) {
  const clientIp = requestIp.getClientIp(req);
  if (clientIp.startsWith("::ffff:")) {
    return clientIp.substring(7);
  }
  return clientIp;
}

// Route to display the client's IP address
app.get('/', (req, res) => {
  const ip = getClientIp(req);
  const isIPv6 = ip.includes(':') && !ip.includes('.');
  const ipv4 = isIPv6 ? null : ip;
  const ipv6 = isIPv6 ? ip : null;

  res.render('index', { ipv4, ipv6 });
});

// Route to display the stats page
app.get('/stats', (req, res) => {
  res.render('stats');
});

// Route to provide JSON data for stats
app.get('/stats/data', (req, res) => {
  db.all(`SELECT ipv4, ipv6 FROM ip_addresses`, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Database error');
      return;
    }

    let ipv4Count = 0;
    let ipv6Count = 0;

    rows.forEach(row => {
      if (row.ipv4) {
        ipv4Count++;
      }
      if (row.ipv6) {
        ipv6Count++;
      }
    });

    res.json({ IPv4: ipv4Count, IPv6: ipv6Count });
  });
});

// Route to display the list of IP addresses
app.get('/list', (req, res) => {
  db.all(`SELECT ipv4, ipv6, timestamp FROM ip_addresses`, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Database error');
      return;
    }

    res.render('list', { rows });
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
