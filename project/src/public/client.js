let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
    apod: Immutable.Map({ }),
    roversList: Immutable.List(['curiosity', 'opportunity', 'spirit']),
    rovers: Immutable.Map({ curiosity: Immutable.Map({ }),
                            opportunity: Immutable.Map({ }),
                            spirit: Immutable.Map({ })
                          })
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (newState) => {
    store = store.mergeDeep(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content
const App = (state) => {

    return `
        <header></header>
        <main>
            ${Greeting(state.getIn(['user', 'name']))}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(state.get('apod'))}
            </section>
            <section>
                <p>These are the rovers:</p>
                ${AddRovers(state.get('roversList'), state.get('rovers'))}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {

    // If image does not exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.getIn(['image', 'date']))
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() !== today.getDate());
    //if (apod.size == 0 || photodate.getDate() !== today.getDate() ) {
    if (apod.size == 0) {
        console.log('this is apod', apod)
        getImageOfTheDay(store)
    } else {
      // we have an image or video to display
      // check if the photo of the day is actually type video!
      if (apod.getIn(['image', 'media_type']) === "video") {
          return (`
              <p>See today's featured video <a href="${apod.getIn(['image', 'url'])}">here</a></p>
              <p>${apod.getIn(['image', 'title'])}</p>
              <p>${apod.getIn(['image', 'explanation'])}</p>
          `)
      } else {
          return (`
              <img src="${apod.getIn(['image', 'url'])}" height="350px" width="100%" />
              <p>${apod.getIn(['image', 'explanation'])}</p>
          `)
      }
    }
}

const AddRovers = (roversList, roversObject) => {
    console.log('Start mapping roversList')
    const roversData = roversList.map(rover => ManifestOfRover(roversObject.get(rover), rover))
    return PrepareHtml(roversData)
}

const ManifestOfRover = (roverObject, roverName) => {
    // If rover manifest does not exist, request it
    if (roverObject.size == 0 || typeof roverObject === 'undefined') {
        getManifest(store, roverName)
    } else {
        return (`
            <p>The name of the rover is ${roverObject.get('photo_manifest').get('name')}</p>
            <p>Its Launch Date is ${roverObject.get('photo_manifest').get('launch_date')}</p>
            <p>Its Landing Date is ${roverObject.get('photo_manifest').get('landing_date')}</p>
            <p>Its Status is ${roverObject.get('photo_manifest').get('status')}</p>
            <p>Its max_sol is ${roverObject.get('photo_manifest').get('max_sol')}</p>
            <p>Date the most recent photos were taken is ${roverObject.get('photo_manifest').get('max_date')}</p>
        `)
    }
}

const PrepareHtml = (roversData) => {
    const roversString = roversData.reduce((accum, rover) => {
                                        return accum + rover
                                    }, '')
    return `<p>HERE IT GOES ${roversString}</p>`
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore({ apod }))

    //return { apod }
}

const getManifest = (state, rover) => {
    fetch(`http://localhost:3000/${rover}-manifest`)
        .then(res => res.json())
        .then(data => {
                          const newRoverManifest = {
                              rovers: {}
                          }
                          newRoverManifest.rovers[rover] = data.manifest
                          updateStore(newRoverManifest)
                      })
}
