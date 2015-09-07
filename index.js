var spark = require("spark"),
	TogglClient = require("toggl-api"),
	toggl = new TogglClient({apiToken: "YOURAPITOKEN"}),
	_ = require("underscore"),
	currentParticle;

initParticle();

function initParticle() {
	spark.on("login", function(err, body) {
		console.log("Particle device login successful: ", body);
		var deviceList = spark.listDevices();

		deviceList.then(function(devices) {
			currentParticle = _.find(devices, function(device) {
				return device.name == "Timon";
			});
			
			console.log("Timon was found: ", currentParticle);

			currentParticle.onEvent("buttonPressed", function() {
				console.log("Button was pressed!");

        toggl.getCurrentTimeEntry(function(err, currentEntry) {
          if (currentEntry) {
            console.log(currentEntry.description + " is running");

            toggl.stopTimeEntry(currentEntry.id, function(err, stoppedEntry) {
              console.log(stoppedEntry.description + " was stopped");

              currentParticle.callFunction("ledTrigger", "OFF", function(result) {
                console.log("LED should be off");
              });
            });
          } else {
            var currentDate = new Date(),
                yesterday = new Date();

            yesterday.setDate(currentDate.getDate() - 1);
            
            toggl.getTimeEntries(yesterday.toISOString(), currentDate.toISOString(), function(err, data) {
              if (!err) {
                var lastEntry = data[data.length - 1];
                console.log(lastEntry);

                toggl.startTimeEntry({
                  description: lastEntry.description,
                  pid: lastEntry.pid,
                  wid: lastEntry.wid
                }, function(err, timeEntry) {
                  console.log("Entry started");

                  currentParticle.callFunction("ledTrigger", "ON", function(result) {
                    console.log("LED should be on");
                  });
                });
              }
            });
          }
        });
			});
		});
	});

	spark.login({
		accessToken: "YOURSPARKTOKEN"
	}, function(err, body) {
		if (!err) console.log("API login complete!");
	});
}