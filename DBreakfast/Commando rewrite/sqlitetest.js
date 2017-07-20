var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('abcd');

db.serialize(function() {
  db.run("CREATE TABLE orders (oid TEXT, stuff TEXT, customer TEXT, channel TEXT, guild TEXT)");

  var stmt = db.prepare("INSERT INTO user VALUES (?,?)");

  stmt.finalize();

  db.each("SELECT oid, stuff, customer, channel, guild FROM orders", function(err, row) {
    console.log("Order info : " + row.oid, row.stuff, row.customer, row.channel, row.guild);
  });
});

db.close();
