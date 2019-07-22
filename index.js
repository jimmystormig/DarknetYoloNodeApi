const { exec } = require('child_process');
const express = require('express')

const app = express()
const port = 3002

app.post('/predict', (req, res) => {

  let config = 'yolov3.cfg';
  let weight = 'yolov3.weights';

  if(req.query.tiny && req.query.tiny === 'true'){
    config = 'yolov3-tiny.cfg';
    weight = 'yolov3-tiny.weights';
  }

  exec('./darknet detect cfg/' + config + ' ' + weight + ' ' + req.query.image, (err, stdout, stderr) => {

    if (err) {
      console.log(`err: ${err}`);
      return;
    }

    if(stderr){
      console.log('stderr', stderr);
    }
    
    const lines = stdout.split(/\r?\n/);
    lines.shift();
    
    var personDetected = false;
    var matches = [];
    
    lines.forEach(function (line) {
      const items = line.match(/^(\w*): (\d*)%$/);

      if(!items) return;

      const label = items[1];
      const confidence = items[2];
    
      matches.push({
        label: label,
        confidence: confidence
      });
    
      if(!personDetected && label === 'person'){
        personDetected = true;
      }
    })

    exec('cp /app/predictions.jpg ' + req.query.predictimage, (err2, stdout2, stderr2) => {
      if (err2) {
        console.log(`err: ${err2}`);
        return;
      }
    
      res.send({
        personDetected: personDetected,
        matches: matches,
        predictImage: req.query.predictimage
      });

    });
  
  });

});

app.listen(port, () => console.log(`DarknetYoloNodeApi listening on port ${port}!`))