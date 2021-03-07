const colors = {
  angry: [['#c61d1d', '#f55460'], ['#ff87a2', '#ffbce3']],
  happy: [['#ece235', '#a8d132'], ['#61bd3d', '#00a64b']],
  sad: [['#216bff', '#7260ef'], ['#c340b5', '#cf39a0']],
  surprised: [['#ffa500', '#ffc0b7'], ['#ff8983', '#c25451']],
  neutral: [['#5e5b2c', '#445c37'], ['#214f59', '#2f4858']],
  fearful: [['#17f4df', '#56f9c7'], ['#82fcae', '#abfd95']],
  disgusted: [['#377211', '#007d3e'], ['#008767', '#008f8d']]
}
let granimState = colors.happy

const video = document.getElementById('video')
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(error => console.error)

function startVideo() {
  navigator.mediaDevices.getUserMedia(
    { video: true }
  ).then(stream => {
    video.srcObject = stream
  }).catch(err => console.error)
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  canvas.setAttribute('id', 'camera')
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      if (detections.length) {
        // find closest expression
        const expressions = detections[0].expressions
        let closest = 0
        let closestExpr = ''
        Object.keys(expressions).forEach(expression => {
          if (Math.abs(expressions[expression] - 1) < Math.abs(closest - 1)) {
            closest = expressions[expression]
            closestExpr = expression
          }
        })
        setFoundExpression(closestExpr)
      }
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    } catch (error) {
      console.error(error)
    }
  }, 100)
})

const setFoundExpression = (expression) => {
  const h1 = document.querySelector('h1')
  h1.removeChild(h1.firstChild)
  h1.appendChild(document.createTextNode(`Looks like you're feeling ${expression}`))
  granimInstance.changeState(`${expression}-state`)
}

var granimInstance = new Granim({
  element: '#back-canvas',
  direction: 'radial',
  isPausedWhenNotInView: true,
  states : {
      "default-state": {
          gradients: colors.happy
      },
      "neutral-state": {
        gradients: colors.neutral
      },
      "angry-state": {
        gradients: colors.angry
      },
      "fearful-state": {
        gradients: colors.fearful
      },
      "disgusted-state": {
        gradients: colors.disgusted
      },
      "surprised-state": {
        gradients: colors.surprised
      },
      "happy-state": {
        gradients: colors.happy
      },
      "sad-state": {
        gradients: colors.sad
      }
  }
});