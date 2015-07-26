var fs = require('fs');
var ejs = require('ejs');
var client = require('./keys');

var mandrill_client = require('./keys.js');

var csvFile = fs.readFileSync("friend_list.csv", "utf8");
var emailTemp = fs.readFileSync("email_template.html", 'utf8');

var client = tumblr.createClient({
  consumer_key: '',
  consumer_secret: '',
  token: '',
  token_secret: ''
});

var mandrill_client = new mandrill.Mandrill('');



function sendEmail(to_name, to_email, from_name, from_email, subject, message_html) {
  var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
         //console.log(message);
         //console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
}

var posts = [];

var csv = csvFile.split('\n');

function csvParser(csv) {
  var outputObj = [];
  var headers = csv[0].split(',');
  for(var i = 1; i <csv.length-1; i++) {
    var data = csv[i].split(',');
    var obj = {};
    for(var j = 0; j <data.length; j++) {
      obj[headers[j]] = data[j];
    }
    outputObj.push(obj);
  }
  return outputObj;
}

var parsed = csvParser(csv);


client.posts('tashoecraft.tumblr.com', function(err, blog) {
  var posts = [];
  blog.posts.forEach(function(a) {
    if((new Date() - new Date(a.date)) < 604800000)
    //console.log(a.body);
      posts.push(a);
  });
  var emailTemplate = ejs.render(emailTemp,
    { firstName: parsed[0].firstName,
      numMonthsSinceContact: parsed[0].numMonthsSinceContact,
      latestPosts: posts
  });

  var massSend = function() {
    for(i = 0; i < parsed.length; i++) {
      sendEmail(parsed[i].firstName, parsed[i].emailAddress, 'Austin', 'tashoecraft@gmail.com', 'My new Posts!', emailTemplate);
    }
  };

  massSend();
});
