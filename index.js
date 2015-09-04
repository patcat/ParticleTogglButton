var spark = require('spark'),
	TogglClient = require('toggl-api'),
	toggl = new TogglClient({apiToken: '4f1c38ba5dd89b7cadf6eec2fc28fa74'}),
	_ = require('underscore'),
	currentParticle;

initParticle();

function initParticle() {
	spark.on('login', function(err, body) {
		console.log('Particle Core login successful: ', body);
		var deviceList = spark.listDevices();

		deviceList.then(function(devices) {
			currentParticle = _.find(devices, function(device) {
				return device.name == 'Timon';
			});
			
			console.log('Timon was found: ', currentParticle);

			currentParticle.onEvent('buttonPressed', function() {
				console.log('Button was pressed!');

        toggl.getCurrentTimeEntry(function(err, currentEntry) {
          if (currentEntry) {
            console.log(currentEntry.description + ' is running');

            toggl.stopTimeEntry(currentEntry.id, function(err, stoppedEntry) {
              console.log(stoppedEntry.description + ' was stopped');
            });
          } else {
            var currentDate = new Date(),
                yesterday = new Date();

            yesterday.setDate(currentDate.getDate() - 1);
            
            toggl.getTimeEntries(yesterday.toISOString(), currentDate.toISOString(), function(err, data) {
              if (!err) {
                var lastEntry = data[data.length - 1];
                console.log(lastEntry);
                //console.log(err, data);

                toggl.startTimeEntry({
                  description: lastEntry.description,
                  pid: lastEntry.pid,
                  wid: lastEntry.wid
                }, function(err, timeEntry) {
                  console.log('Entry started');
                });
              }
            });
          }
        });

				/*toggl.startTimeEntry({
          description: 'Button Event'
        }, function(err, timeEntry) {
          console.log('Entry started');
        })*/
			});
		});
	});

	spark.login({
		accessToken: '9c0f99363411f0fd2c650ce1bbd8c0a5a3d4cd2e'
	}, function(err, body) {
		if (!err) console.log('API login complete!');
	});
}