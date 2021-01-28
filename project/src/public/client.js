let store = Immutable.Map({
    user: Immutable.Map({ name: "Student" }),
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
                <p>Thanks to the NASA APIs available, we have access to NASA data, including imagery. Here you can find the most recent data from the rovers on Mars. For more information, please visit the <a href="https://api.nasa.gov/" target="_blank">api.nasa.gov</a> catalog, it is constantly growing.</p>
                <p>Choose between <button id="curiosity-btn" class="rover-btn">Curiosity</button><button id="opportunity-btn" class="rover-btn">Opportunity</button> and <button id="spirit-btn" class="rover-btn">Spirit</button> rovers to see more details about their trips and latest photos.</p>
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

const AddRovers = (roversList, roversObject) => {
    const roversData = roversList.map(rover => DataOfRover(roversObject.get(rover), rover))
    return PrepareHtml(roversData)
}

// A pure function that renders infomation requested from the backend
const DataOfRover = (roverObject, roverName) => {
    // If rover's data does not exist, request it
    if (roverObject.size == 0 || typeof roverObject === 'undefined') {
        getRover(store, roverName)
    } else {
        return (`
            <div id="${roverObject.get('latest_photos').get(0).get('rover').get('name')}-box" class="rover-box">
                <h2>${roverObject.get('latest_photos').get(0).get('rover').get('name')}</h2>
                <ul class="details-list">
                    <li>Launch Date: ${roverObject.get('latest_photos').get(0).get('rover').get('launch_date')}</li>
                    <li>Landing Date: ${roverObject.get('latest_photos').get(0).get('rover').get('landing_date')}</li>
                    <li>Status: ${roverObject.get('latest_photos').get(0).get('rover').get('status')}</li>
                    <li>Max_sol*: ${roverObject.get('latest_photos').get(0).get('sol')}</li>
                    <li>Date the most recent photos were taken: ${roverObject.get('latest_photos').get(0).get('earth_date')}</li>
                </ul>
                <p class="note">*Photos are organized by the sol (Martian rotation or day) on which they were taken, counting up from the rover's landing date. A photo taken on ${roverObject.get('latest_photos').get(0).get('rover').get('name')}'s 1000th Martian sol exploring Mars, for example, will have a sol attribute of 1000.</p>
                <div>
                    <h2>Latest photos</h2>
                    ${roverObject.get('latest_photos').slice(-4).reduce((acc, curr) => ReducePhotos(acc, curr), '')}
                </div>
            </div>
        `)
    }
}

const PrepareHtml = (roversData) => {
    const roversString = roversData.reduce((accum, rover) => {
                                        return accum + rover
                                    }, '')
    return roversString
}

const ReducePhotos = (acc, curr) => {
    const accumulator = acc + `<div class="img-box"><img src="${curr.get('img_src')}" width="100%" /></div>`
    return accumulator
}

// ------------------------------------------------------  API CALLS

const getRover = (state, rover) => {
    fetch(`http://localhost:3000/latest-photos/${rover}`)
        .then(res => res.json())
        .then(data => {
                          const newRovers = {
                              rovers: {}
                          }
                          newRovers.rovers[rover] = data.photos
                          updateStore(newRovers)
                      })
}
