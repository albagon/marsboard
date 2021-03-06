require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// Call to 'Mars Rover Photos' API
// Query for latest photos.
app.get('/latest-photos/:rover', async (req, res) => {
    try {
        const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover}/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ photos })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
