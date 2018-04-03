/*globals window, document, pryv */

var pryvHF = {
  pryvConn: null, // global holder for the connection
  xEvent: null // HF event serie for x data
};

/*globals document, pryv*/
(function () {

  window.addEventListener('deviceorientation', function (event) {

    var now = Date.now() / 1000;
    xLabel.innerHTML =  event.gamma;
    yLabel.innerHTML =   event.beta;

    xBuffer.push([now, event.gamma]);

    counter += 2;
  });



  var xLabel = document.getElementById('xLabel');
  var yLabel = document.getElementById('yLabel');
  var frequencyLabel = document.getElementById('frequencyLabel');
  var dataSentLabel = document.getElementById('dataSent');
  var dataBufferLabel = document.getElementById('dataBuffer');

  var samplingMs = 100;

  var counter = 0;
  var previousTick = Date.now();


  var xBuffer = []; // holds data to be posted


  document.onmousemove = function (event) {
    var now = Date.now() / 1000;
    xLabel.innerHTML =  event.pageX;
    yLabel.innerHTML =  event.pageY;

    xBuffer.push([now, event.pageX]);

    counter += 2;
  };

  function sampleHz() {
    var now = Date.now();
    frequencyLabel.innerHTML = Math.round(counter * 1000 /  (now - previousTick));
    dataBufferLabel.innerHTML = xBuffer.length;
    counter = 0;
    previousTick = now;
    setTimeout(sampleHz, samplingMs);
  }

  sampleHz();

  // --- Post logic

  var samplePostMs = 100;


  var sendCount = 0;

  function samplePost() {
    if (pryvHF.xEvent && xBuffer.length > 0) {
      var nBuffer = xBuffer;
      xBuffer = [];
      postSerie(pryvHF.pryvConn, pryvHF.xEvent, nBuffer, function (/* err, res */) {
        sendCount += nBuffer.length;
        dataSentLabel.innerHTML = sendCount;
      });
    }
    setTimeout(samplePost, samplePostMs);

  }

  samplePost();

})();


function postSerie(connection, event, points, done) {
  connection.request({
    withoutCredentials: true,
    method: 'POST',
    path: '/events/' + event.id + '/series',
    jsonData: {
      format: 'flatJSON',
      fields: event.content.fields,
      points: points
    },
    callback: done
  });
}


function setupConnection(connection) {
  // A- retrieve previously created events or create events holders

  var postData = [
    {
      method: 'events.create',
      params: {
        streamId: 'hfdemo',
        type: 'series:count/generic',
        description: 'Holder for x mouse position'
      }
    }
  ];

  var resultTreatment = [
    function handleCreateEventX(result) {
      pryvHF.xEvent = result.event;
      console.log('X handle set', pryvHF.xEvent);
    }
  ];


  connection.request({
    method: 'POST',
    path: '/',
    jsonData: postData,
    callback: function (err, result, resultInfo) {
      if (err) { return console.log('...error: ' + JSON.stringify([err, result])); }
      console.log('...event created: ' + JSON.stringify(result));
      if (result && result.results) {
        for (var i = 0; i < result.results.length; i++) {
          resultTreatment[i].call(null, result.results[i]);
        }
      } else {
        console.log(' No result!!', resultInfo);
      }

    }
  });


  pryvHF.pryvConn = connection;

}





/// -------------------------- Pryv Connection Boiler Plate ---------------------------------- ///


/**
 * retrieve the registerURL from URL parameters
 */
function getRegisterURL() {
  return pryv.utility.urls.parseClientURL().parseQuery()['reg-pryv'] ||
    pryv.utility.urls.parseClientURL().parseQuery()['pryv-reg'];
}

var customRegisterUrl = getRegisterURL();
if (customRegisterUrl) {
  pryv.Auth.config.registerURL = {host: customRegisterUrl, 'ssl': true};
}

/**
 * retrieve the registerURL from URL parameters
 */
function getSettingsFromURL() {
  var settings = {
    username : pryv.utility.urls.parseClientURL().parseQuery().username,
    domain : pryv.utility.urls.parseClientURL().parseQuery().domain,
    auth: pryv.utility.urls.parseClientURL().parseQuery().auth
  };

  if (settings.username && settings.auth) {
    return settings;
  }

  return null;
}

function setupShareLink(/* connect */) {
  var urlLabel = document.getElementById('sharelink');
  urlLabel.innerHTML = ('<a target="_new" ' +
    'href="https://pryv.github.io/app-web-plotly/?pryv-reg=reg.preview.pryv.tech&liverange=0.2">' +
    'FOLLOW ON PLOTLY APP</A>');
}

document.onreadystatechange = function () {

  document.getElementById('loading').style.display = 'none';
  document.getElementById('logo-pryv').style.display = 'block';
  var state = document.readyState;
  if (state === 'complete') {
    var settings = getSettingsFromURL();
    if (settings) {
      var connection = new pryv.Connection(settings);
      connection.fetchStructure(function () {
        setupConnection(connection);
      });
    } else {

      // Authenticate user
      var authSettings = {
        requestingAppId: 'app-web-hfdemo',
        requestedPermissions: [
          {
            streamId: 'hfdemo',
            defaultName: 'Demo HF',
            level: 'manage'
          }
        ],
        returnURL: false,
        spanButtonID: 'pryv-button',
        callbacks: {
          needSignin: null,
          needValidation: null,
          signedIn: function (connect) {
            setupShareLink(connect);
            connect.fetchStructure(function () {
              setupConnection(connect);
            });
          }
        }
      };
      pryv.Auth.setup(authSettings);
    }
  }
};