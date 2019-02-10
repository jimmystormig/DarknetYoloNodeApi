const { exec } = require('child_process');
const express = require('express')

const app = express()
const port = 3002

app.post('/predict', (req, res) => {

  exec('./darknet detect cfg/yolov3.cfg yolov3.weights ' + req.query.image, (err, stdout, stderr) => {

    if (err) {
      console.log(`err: ${err}`);
      return;
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
      if (err) {
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